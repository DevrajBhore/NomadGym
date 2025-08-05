// user/FindGymsMap.jsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Star, Dumbbell, Footprints } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axiosConfig from "../../api/axiosConfig";
import GymInfoCard from "../../components/GymInfoCard";
import "../../styles/FindGymsMap.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom user location icon (blue)
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom gym icon (red)
const gymIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const FindGymsMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGyms, setIsLoadingGyms] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRadius, setSearchRadius] = useState(5);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [minRating, setMinRating] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState("distance");
  const [showFilters, setShowFilters] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState([]);

  useEffect(() => {
    // Fetch available amenities for filter
    fetchAmenities();

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLoading(false);
      return;
    }

    // Get user's current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setIsLoading(false);

        // Fetch nearby gyms after getting user location
        await fetchNearbyGyms(coords.lat, coords.lng);
      },
      (error) => {
        console.error("Location error:", error);
        let errorMessage = "Unable to retrieve your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage =
              "An unknown error occurred while retrieving location.";
            break;
        }

        setLocationError(errorMessage);
        setIsLoading(false);

        // Fallback to a default location (Delhi, India)
        const defaultCoords = {
          lat: 18.9582,
          lng: 72.8321,
        };
        setUserLocation(defaultCoords);
        fetchNearbyGyms(defaultCoords.lat, defaultCoords.lng);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Fetch gyms when filters change
  useEffect(() => {
    if (userLocation) {
      const debounceTimer = setTimeout(() => {
        fetchNearbyGyms(userLocation.lat, userLocation.lng);
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [
    searchQuery,
    searchRadius,
    priceRange,
    minRating,
    selectedAmenities,
    sortBy,
  ]);

  const fetchAmenities = async () => {
    try {
      const response = await axiosConfig.get("/gyms/amenities");
      if (response.data.success) {
        setAvailableAmenities(response.data.amenities);
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
    }
  };

  const fetchNearbyGyms = async (lat, lng) => {
    setIsLoadingGyms(true);
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: searchRadius.toString(),
        sortBy: sortBy,
      });

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      if (priceRange.min) {
        params.append("minPrice", priceRange.min);
      }

      if (priceRange.max) {
        params.append("maxPrice", priceRange.max);
      }

      if (minRating) {
        params.append("minRating", minRating);
      }

      selectedAmenities.forEach((amenity) => {
        params.append("amenities", amenity);
      });

      const response = await axiosConfig.get(
        `/gyms/nearby?${params.toString()}`
      );

      if (response.data.success) {
        setGyms(response.data.gyms);
        console.log(`Found ${response.data.count} gyms nearby`);
      } else {
        console.error("Failed to fetch gyms:", response.data.message);
        setGyms([]);
      }
    } catch (err) {
      console.error("Error fetching nearby gyms:", err);
      setGyms([]);
    } finally {
      setIsLoadingGyms(false);
    }
  };

  const handleGymClick = (gym) => {
    setSelectedGym(gym);
  };

  const closeGymCard = () => {
    setSelectedGym(null);
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setMinRating("");
    setSelectedAmenities([]);
    setSortBy("distance");
  };

  if (isLoading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Fetching your location...</p>
      </div>
    );
  }

  if (locationError && !userLocation) {
    return (
      <div className="map-error">
        <h3>Location Error</h3>
        <p>{locationError}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="find-gyms-container">
      {/* Search and Filter Controls */}
      <div className="map-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder=" Search gyms by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="map-search-input"
          />
          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters{" "}
            {(priceRange.min ||
              priceRange.max ||
              minRating ||
              selectedAmenities.length > 0) && (
              <span className="filter-badge">•</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Radius:</label>
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="filter-select"
                >
                  <option value={1}>1 km</option>
                  <option value={2}>2 km</option>
                  <option value={5}>5 km</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  {/* <option value="distance">Distance</option> */}
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  {/* <option value="rating">Rating</option>
                  <option value="name">Name</option> */}
                </select>
              </div>
            </div>

            <div className="filter-row">
              {/* <div className="filter-group">
                <label>Price Range (₹/hr):</label>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="price-input"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="price-input"
                  />
                </div>
              </div> */}

              <div className="filter-group">
                <label>Min Rating:</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Any Rating</option>
                  <option value="1">1+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
            </div>

            {availableAmenities.length > 0 && (
              <div className="filter-group amenities-filter">
                <label>Amenities:</label>
                <div className="amenities-grid">
                  {availableAmenities.slice(0, 8).map((amenity) => (
                    <button
                      key={amenity}
                      className={`amenity-filter-btn ${
                        selectedAmenities.includes(amenity) ? "active" : ""
                      }`}
                      onClick={() => handleAmenityToggle(amenity)}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="filter-actions">
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="apply-filters-btn"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Header */}
      <div className="map-header">
        <h2>Find Gyms Near You</h2>
        {locationError && (
          <div className="location-warning">
            <p> {locationError} Showing default location.</p>
          </div>
        )}

        <div className="gym-count">
          {isLoadingGyms ? (
            <p> Searching for gyms...</p>
          ) : (
            <p>
              Found {gyms.length} gyms within {searchRadius}km
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="map-wrapper">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="gym-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User location marker */}
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="user-popup">
                <strong>
                  <MapPin size={24} /> You are here
                </strong>
                <br />
                <small>
                  Lat: {userLocation.lat.toFixed(4)}, Lng:{" "}
                  {userLocation.lng.toFixed(4)}
                </small>
              </div>
            </Popup>
          </Marker>

          {/* Gym markers */}
          {gyms.map((gym) => (
            <Marker
              key={gym.id}
              position={[
                Number.parseFloat(gym.latitude),
                Number.parseFloat(gym.longitude),
              ]}
              icon={gymIcon}
              eventHandlers={{
                click: () => handleGymClick(gym),
              }}
            >
              <Popup>
                <div className="gym-popup-preview">
                  <strong>
                    <Dumbbell size={24} /> {gym.name}
                  </strong>
                  <br />
                  <div className="popup-rating">
                    {gym.averageRating > 0 && (
                      <span className="stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            color={
                              i < Math.round(gym.averageRating)
                                ? "#ffc107"
                                : "#e0e0e0"
                            }
                          />
                        ))}{" "}
                        {gym.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <span className="price">₹{gym.pricePerHour}/hr</span>
                  <br />
                  <span className="distance">
                    <Footprints size={24} /> {gym.distance}km away
                  </span>
                  <br />
                  <button
                    onClick={() => handleGymClick(gym)}
                    className="popup-details-btn"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Info */}
      <div className="map-info">
        <div className="legend">
          <div className="legend-item">
            <span className="legend-marker user">🔵</span>
            <span>Your Location</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker gym">🔴</span>
            <span>Gym Locations</span>
          </div>
        </div>
        {gyms.length === 0 && !isLoadingGyms && (
          <p className="no-gyms">
            No gyms found within {searchRadius}km
            {searchQuery && ` matching "${searchQuery}"`}. Try expanding your
            search radius or adjusting filters.
          </p>
        )}
      </div>

      {/* Gym Info Card */}
      <GymInfoCard gym={selectedGym} onClose={closeGymCard} />
    </div>
  );
};

export default FindGymsMap;
