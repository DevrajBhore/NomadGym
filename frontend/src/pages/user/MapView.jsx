// user/MapView.jsx
// user/MapView.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import API from "../../api/axiosConfig";
import Loader from "../../components/Loader";
import "../../styles/MapView.css";

// Fix missing marker icon in Leaflet default setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const defaultCenter = {
  lat: 28.6139,
  lng: 77.209,
};

const MapView = () => {
  const [gyms, setGyms] = useState([]);
    const [_selectedGym, setSelectedGym] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchRadius, setSearchRadius] = useState(10);

  const mapRef = useRef(null);

  const fetchNearbyGyms = async (lat, lng, radius = 5) => {
    try {
      const response = await API.get(
        `/gyms/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      if (response.data?.success) {
        setGyms(response.data.gyms || []);
      } else {
        console.warn("Unexpected response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching nearby gyms:", error);
      setError("Failed to fetch nearby gyms.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setMapCenter(location);
          fetchNearbyGyms(location.lat, location.lng, searchRadius);
        },
        (err) => {
          console.error("Location error:", err);
          setError("Location access denied.");
          fetchNearbyGyms(defaultCenter.lat, defaultCenter.lng, searchRadius);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, [searchRadius]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    if (userLocation) {
      fetchNearbyGyms(userLocation.lat, userLocation.lng, newRadius);
    } else {
      fetchNearbyGyms(mapCenter.lat, mapCenter.lng, newRadius);
    }
  };

  const FlyToLocation = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      map.flyTo(center, 13);
    }, [center, map]);
    return null;
  };

  if (loading) return <Loader />;

  return (
    <div className="map-view-container">
      <div className="map-controls">
        <button onClick={getCurrentLocation} className="button-primary">
          📍 Find My Location
        </button>
        <select
          value={searchRadius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className="input-base"
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={20}>20 km</option>
          <option value={50}>50 km</option>
        </select>
        {error && <p className="error-message">{error}</p>}
        <p>
          Found {gyms.length} gym{gyms.length !== 1 ? "s" : ""} nearby
        </p>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "70vh", width: "100%" }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <FlyToLocation center={mapCenter} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {gyms.map((gym) => (
          <Marker
            key={gym._id}
            position={[gym.latitude, gym.longitude]}
            eventHandlers={{
              click: () => {
                setSelectedGym(gym);
              },
            }}
          >
            <Popup>
              <strong>{gym.name}</strong>
              <br />
              {gym.address}
              <br />
              ₹{gym.pricePerHour}/hour
              <br />
              <Link to={`/gym/${gym._id}`}>View Details</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="gyms-sidebar">
        <h3>Nearby Gyms</h3>
        {gyms.map((gym) => (
          <div
            key={gym._id}
            className="gym-list-item"
            onClick={() => setSelectedGym(gym)}
          >
            <h4>{gym.name}</h4>
            <p>{gym.address}</p>
            <p>₹{gym.pricePerHour}/hr</p>
            {gym.distance && <p>{gym.distance} km</p>}
            <Link to={`/gym/${gym._id}`}>Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;
