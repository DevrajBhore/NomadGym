// user/LocationSearch.jsx
import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import API from "../../api/axiosConfig"
import GymCard from "../../components/GymCard"
import Loader from "../../components/Loader"
import "../../styles/LocationSearch.css"

const LocationSearch = () => {
  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userLocation, setUserLocation] = useState(null)
  const [searchRadius, setSearchRadius] = useState(10)
  const [sortBy, setSortBy] = useState("distance")
  const [hasSearched, setHasSearched] = useState(false)
  const searchInputRef = useRef(null)

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          searchNearbyGyms(location.lat, location.lng)
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Location access denied. Please search by city or address.")
          setLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        },
      )
    } else {
      setError("Geolocation is not supported by this browser.")
    }
  }

  // Search gyms near coordinates
  const searchNearbyGyms = async (lat, lng, radius = searchRadius, query = "") => {
    try {
      setLoading(true)
      setError("")

      let url = `/gyms/search?latitude=${lat}&longitude=${lng}&radius=${radius}`
      if (query.trim()) {
        url += `&search=${encodeURIComponent(query.trim())}`
      }

      const response = await API.get(url)
      if (response.data.success) {
        const results = response.data.gyms

        // Sort results
        if (sortBy === "distance") {
          results.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        } else if (sortBy === "price") {
          results.sort((a, b) => a.pricePerHour - b.pricePerHour)
        } else if (sortBy === "name") {
          results.sort((a, b) => a.name.localeCompare(b.name))
        }

        setGyms(results)
        setHasSearched(true)
      }
    } catch (err) {
      console.error("Error searching gyms:", err)
      setError("Failed to search gyms. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Search gyms by text query (city, address, name)
  const searchByText = async (query) => {
    try {
      setLoading(true)
      setError("")

      const response = await API.get(`/gyms/search?search=${encodeURIComponent(query)}`)
      if (response.data.success) {
        const results = response.data.gyms

        // Sort results
        if (sortBy === "price") {
          results.sort((a, b) => a.pricePerHour - b.pricePerHour)
        } else if (sortBy === "name") {
          results.sort((a, b) => a.name.localeCompare(b.name))
        }

        setGyms(results)
        setHasSearched(true)
      }
    } catch (err) {
      console.error("Error searching gyms:", err)
      setError("Failed to search gyms. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      if (userLocation) {
        searchNearbyGyms(userLocation.lat, userLocation.lng, searchRadius, searchQuery)
      } else {
        searchByText(searchQuery)
      }
    }
  }

  // Handle radius change
  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius)
    if (userLocation && hasSearched) {
      searchNearbyGyms(userLocation.lat, userLocation.lng, newRadius, searchQuery)
    }
  }

  // Handle sort change
  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    if (gyms.length > 0) {
      const sortedGyms = [...gyms]
      if (newSort === "distance") {
        sortedGyms.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      } else if (newSort === "price") {
        sortedGyms.sort((a, b) => a.pricePerHour - b.pricePerHour)
      } else if (newSort === "name") {
        sortedGyms.sort((a, b) => a.name.localeCompare(b.name))
      }
      setGyms(sortedGyms)
    }
  }

  useEffect(() => {
    // Focus on search input when component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  return (
    <div className="location-search-container">
      <div className="search-header">
        <h2>Find Gyms Near You</h2>
        <p>Search for gyms by location, name, or address</p>
      </div>

      <div className="search-controls-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by gym name, city, or address..."
              className="search-input input-base"
            />
            <button type="submit" className="search-button button-primary" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        <div className="location-controls">
          <button onClick={getCurrentLocation} className="location-button button-secondary" disabled={loading}>
            📍 Use My Location
          </button>

          {userLocation && (
            <div className="radius-control">
              <label htmlFor="radius">Search within:</label>
              <select
                id="radius"
                value={searchRadius}
                onChange={(e) => handleRadiusChange(Number.parseInt(e.target.value))}
                className="input-base"
              >
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          )}
        </div>

        {hasSearched && gyms.length > 0 && (
          <div className="results-controls">
            <div className="results-info">
              Found {gyms.length} gym{gyms.length !== 1 ? "s" : ""}
              {userLocation && " near you"}
            </div>

            <div className="sort-control">
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input-base"
              >
                {userLocation && <option value="distance">Distance</option>}
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="search-results">
        {loading && <Loader />}

        {!loading && hasSearched && gyms.length === 0 && (
          <div className="no-results">
            <h3>No gyms found</h3>
            <p>Try adjusting your search criteria or expanding the search radius.</p>
          </div>
        )}

        {!loading && gyms.length > 0 && (
          <div className="gyms-grid">
            {gyms.map((gym) => (
              <div key={gym.id} className="gym-result-card">
                <GymCard gym={gym} />
                {gym.distance && <div className="distance-badge">{gym.distance} km away</div>}
              </div>
            ))}
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="search-suggestions">
            <h3>Quick Actions</h3>
            <div className="suggestion-buttons">
              <button onClick={getCurrentLocation} className="suggestion-button button-primary">
                Find Gyms Near Me
              </button>
              <Link to="/map" className="suggestion-button button-secondary">
                View Map
              </Link>
              <Link to="/explore" className="suggestion-button button-secondary">
                Browse by City
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LocationSearch

