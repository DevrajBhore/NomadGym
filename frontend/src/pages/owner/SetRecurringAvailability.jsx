// owner/SetRecurringAvailability.jsx
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import API from "../../api/axiosConfig"
import Loader from "../../components/Loader"
import "../../styles/SetRecurringAvailability.css"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const SetRecurringAvailability = () => {
  const { gymId } = useParams()
  const navigate = useNavigate()
  const [gymName, setGymName] = useState("")
  const [dayOfWeek, setDayOfWeek] = useState("Monday")
  const [startTime, setStartTime] = useState("09:00 AM")
  const [endTime, setEndTime] = useState("05:00 PM")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchGymAndAvailability = async () => {
      try {
        // Fetch gym details
        const gymResponse = await API.get(`/gyms/details/${gymId}`)
        if (gymResponse.status === 200) {
          setGymName(gymResponse.data.gym.name)
        } else {
          setError("Gym not found.")
          setLoading(false)
          return
        }

        // Fetch existing recurring availability for the default day
        await fetchExistingAvailability(dayOfWeek)
      } catch (err) {
        console.error("Error fetching gym details or initial availability:", err)
        setError(err.response?.data?.message || "Failed to load gym details or availability.")
      } finally {
        setLoading(false)
      }
    }

    if (gymId) {
      fetchGymAndAvailability()
    }
  }, [gymId]) // Run once on component mount for initial gym details

  useEffect(() => {
    // Fetch existing recurring availability when dayOfWeek changes
    if (gymId && dayOfWeek) {
      fetchExistingAvailability(dayOfWeek)
    }
  }, [dayOfWeek, gymId])

  const fetchExistingAvailability = async (selectedDay) => {
    setError("")
    setSuccessMessage("")
    try {
      const response = await API.get(`/recurring/get/${gymId}/${selectedDay}`)
      if (response.status === 200) {
        setStartTime(response.data.startTime)
        setEndTime(response.data.endTime)
      }
    } catch (err) {
      // If no existing availability, clear the fields
      if (err.response?.status === 404) {
        setStartTime("09:00 AM")
        setEndTime("05:00 PM")
      } else {
        console.error("Error fetching existing recurring availability:", err)
        setError(err.response?.data?.message || "Failed to load existing availability.")
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!startTime || !endTime) {
      setError("Please enter both start and end times.")
      return
    }

    try {
      const response = await API.post("/recurring/set", {
        gymId,
        dayOfWeek,
        startTime,
        endTime,
      })

      if (response.status === 200) {
        setSuccessMessage(`Recurring availability for ${dayOfWeek} updated successfully!`)
      }
    } catch (err) {
      console.error("Set recurring availability error:", err.response?.data || err.message)
      setError(err.response?.data?.message || "Failed to set recurring availability. Please try again.")
    }
  }

  if (loading) {
    return <Loader />
  }

  if (error && !gymName) {
    return <div className="error-message-center">{error}</div>
  }

  return (
    <div className="set-availability-container">
      <div className="set-availability-card card-base">
        <h2>Set Days Availability for {gymName}</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form className="set-availability-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="dayOfWeek">Day of Week:</label>
            <select
              id="dayOfWeek"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="input-base"
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start Time (e.g., 09:00 AM):</label>
            <input
              type="text"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              placeholder="HH:MM AM/PM"
              className="input-base"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time (e.g., 05:00 PM):</label>
            <input
              type="text"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              placeholder="HH:MM AM/PM"
              className="input-base"
            />
          </div>

          <button type="submit" className="set-button button-primary">
            Save Availability
          </button>
        </form>
        <div className="back-link">
          <button onClick={() => navigate("/owner/dashboard")} className="button-secondary">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default SetRecurringAvailability
