// owner/AllGymAvailability.jsx
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import API from "../../api/axiosConfig"
import Loader from "../../components/Loader"
import "../../styles/AllGymAvailability.css"

const AllGymAvailability = () => {
  const { gymId } = useParams()
  const navigate = useNavigate()
  const [gymName, setGymName] = useState("")
  const [dateSpecificAvailability, setDateSpecificAvailability] = useState([])
  const [recurringAvailability, setRecurringAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAllAvailability = async () => {
      try {
        // First get gym details
        const gymResponse = await API.get(`/gyms/${gymId}`)
        if (gymResponse.status === 200) {
          setGymName(gymResponse.data.gym.name)
        } else {
          setError("Gym not found.")
          setLoading(false)
          return
        }

        // Then get availability
        const availabilityResponse = await API.get(`/availability/owner/${gymId}/all`)
        if (availabilityResponse.status === 200) {
          setDateSpecificAvailability(availabilityResponse.data.dateSpecific)
          setRecurringAvailability(availabilityResponse.data.recurring)
        }
      } catch (err) {
        console.error("Error fetching all gym availability:", err)
        setError(err.response?.data?.message || "Failed to load all availability.")
      } finally {
        setLoading(false)
      }
    }

    if (gymId) {
      fetchAllAvailability()
    }
  }, [gymId])

  if (loading) {
    return <Loader />
  }

  if (error) {
    return <div className="error-message-center">{error}</div>
  }

  return (
    <div className="all-gym-availability-container">
      <div className="all-gym-availability-card card-base">
        <h2>All Availability for {gymName}</h2>

        {/* <div className="availability-section">
          <h3>Recurring Availability</h3>
          {recurringAvailability.length === 0 ? (
            <p className="no-availability-message">No recurring availability set.</p>
          ) : (
            <ul className="recurring-list">
              {recurringAvailability.map((rec) => (
                <li key={rec._id} className="recurring-item">
                  <strong>{rec.dayOfWeek}:</strong> {rec.startTime} - {rec.endTime}
                </li>
              ))}
            </ul>
          )}
          <div className="action-link">
            <Link to={`/owner/gym/${gymId}/set-recurring-availability`} className="button-secondary">
              Edit Recurring Availability
            </Link>
          </div>
        </div> */}

        <div className="availability-section">
          <h3>Date-Specific Availability</h3>
          {dateSpecificAvailability.length === 0 ? (
            <p className="no-availability-message">No date-specific availability set.</p>
          ) : (
            <div className="date-specific-grid">
              {dateSpecificAvailability.map((dateAvail) => (
                <div key={dateAvail._id} className="date-card">
                  <h4>{dateAvail.date}</h4>
                  {dateAvail.availableSlots.length > 0 ? (
                    <ul className="slots-list">
                      {dateAvail.availableSlots.map((slot, idx) => (
                        <li key={idx}>{slot}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-slots">No slots available.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="back-link">
          <button onClick={() => navigate("/owner/dashboard")} className="button-secondary">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default AllGymAvailability
