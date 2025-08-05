import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import API from "../../api/axiosConfig"
import Loader from "../../components/Loader"
import "../../styles/AllCities.css"

const AllCities = () => {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await API.get("/gyms/cities")
        if (response.status === 200) {
          setCities(response.data.cities)
        }
      } catch (err) {
        console.error("Error fetching cities:", err)
        setError("Failed to load cities. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [])

  if (loading) {
    return <Loader />
  }

  if (error) {
    return <div className="error-message-center">{error}</div>
  }

  return (
    <div className="all-cities-container">
      <h2>All Available Cities</h2>
      {cities.length === 0 ? (
        <p className="no-content-message">No cities with approved gyms found yet.</p>
      ) : (
        <ul className="city-list">
          {cities.map((city) => (
            <li key={city} className="city-item card-base">
              <Link to={`/gyms/${city}`}>{city}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AllCities
