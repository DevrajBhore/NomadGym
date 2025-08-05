import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../../api/axiosConfig"
import Loader from "../../components/Loader"
import "../../styles/SetDateSpecificAvailability.css"
import moment from "moment"

const SetDateSpecificAvailability = () => {
  const navigate = useNavigate()
  const [gyms, setGyms] = useState([])
  const [selectedGymId, setSelectedGymId] = useState("")
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"))
  const [startTime, setStartTime] = useState("09:00 AM")
  const [endTime, setEndTime] = useState("05:00 PM")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchOwnerGyms = async () => {
      try {
        const response = await API.get("/gyms/my-gyms") // Fetch only owner's gyms
        if (response.status === 200) {
          setGyms(response.data.gyms)
          if (response.data.gyms.length > 0) {
            setSelectedGymId(response.data.gyms[0]._id) // Select first gym by default
          }
        }
      } catch (err) {
        console.error("Error fetching owner's gyms:", err)
        setError("Failed to load your gyms. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchOwnerGyms()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!selectedGymId || !date || !startTime || !endTime) {
      setError("Please select a gym, date, start time, and end time.")
      return
    }

    const selectedDateMoment = moment(date, "YYYY-MM-DD", true)
    const today = moment().startOf("day")

    if (!selectedDateMoment.isValid()) {
      setError("Invalid date format.")
      return
    }

    if (selectedDateMoment.isBefore(today)) {
      setError("Cannot set availability for past dates.")
      return
    }

    try {
      const response = await API.post("/availability/set", {
        // Use the existing owner endpoint
        gymId: selectedGymId,
        date,
        startTime,
        endTime,
      })

      if (response.status === 200) {
        setSuccessMessage(
          `Availability for ${moment(date).format("MMMM D, YYYY")} at ${gyms.find((g) => g._id === selectedGymId)?.name} updated successfully!`,
        )
        // Optionally reset form or keep values
      }
    } catch (err) {
      console.error("Set date-specific availability error:", err.response?.data || err.message)
      setError(err.response?.data?.message || "Failed to set availability. Please try again.")
    }
  }

  if (loading) {
    return <Loader />
  }

  if (error && gyms.length === 0) {
    return <div className="error-message-center">{error}</div>
  }

  return (
    <div className="admin-set-date-availability-container">
      {" "}
      {/* Reusing admin CSS class names for consistency */}
      <div className="admin-set-date-availability-card card-base">
        <h2>Set Date-Specific Availability (Owner)</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form className="admin-set-date-availability-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="gymSelect">Select Your Gym:</label>
            {gyms.length > 0 ? (
              <select
                id="gymSelect"
                value={selectedGymId}
                onChange={(e) => setSelectedGymId(e.target.value)}
                className="input-base"
                required
              >
                {gyms.map((gym) => (
                  <option key={gym._id} value={gym._id}>
                    {gym.name} ({gym.city})
                  </option>
                ))}
              </select>
            ) : (
              <p className="no-content-message">No gyms available to set availability for. Please add a gym first.</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={moment().format("YYYY-MM-DD")}
              required
              className="input-base"
            />
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

          <button type="submit" className="set-button button-primary" disabled={!selectedGymId}>
            Set Availability
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

export default SetDateSpecificAvailability
