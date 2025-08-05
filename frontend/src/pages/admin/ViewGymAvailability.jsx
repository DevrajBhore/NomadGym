import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import API from "../../api/axiosConfig"
import Loader from "../../components/Loader"
import "../../styles/ViewGymAvailability.css" // New CSS file

const ViewGymAvailability = () => {
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
        // Fetch gym details
        const gymResponse = await API.get(`/gyms/${gymId}`)
        if (gymResponse.status === 200) {
          setGymName(gymResponse.data.gym.name)
        } else {
          setError("Gym not found.")
          setLoading(false)
          return
        }

        // Fetch all availability using the new admin endpoint
        const availabilityResponse = await API.get(`/availability/admin/${gymId}/all`)
        if (availabilityResponse.status === 200) {
          setDateSpecificAvailability(availabilityResponse.data.dateSpecific)
          setRecurringAvailability(availabilityResponse.data.recurring)
        }
      } catch (err) {
        console.error("Error fetching all gym availability for admin:", err)
        setError(err.response?.data?.message || "Failed to load all availability.")
      } finally {
        setLoading(false)
      }
    }

    fetchAllAvailability()
  }, [gymId])

  if (loading) {
    return <Loader />
  }

  if (error) {
    return <div className="error-message-center">{error}</div>
  }

  return (
    <div className="admin-view-availability-container">
      <div className="admin-view-availability-card card-base">
        <h2>Availability for {gymName} (Admin View)</h2>

        <div className="availability-section">
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
        </div>

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
          <button onClick={() => navigate("/admin/dashboard")} className="button-secondary">
            ← Back to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewGymAvailability
