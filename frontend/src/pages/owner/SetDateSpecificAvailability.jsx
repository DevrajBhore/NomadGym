// owner/SetDateSpecificAvailability.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../../api/axiosConfig"
import Loader from "../../components/Loader"
import "../../styles/SetDateSpecificAvailability.css"
import DatePicker from "react-multi-date-picker"
import moment from "moment"

const SetDateSpecificAvailability = () => {
  const navigate = useNavigate()
  const [gyms, setGyms] = useState([])
  const [selectedGymId, setSelectedGymId] = useState("")
  const [selectedDates, setSelectedDates] = useState([]) // Keep as DateObject[]
  const [startTime, setStartTime] = useState("09:00 AM")
  const [endTime, setEndTime] = useState("05:00 PM")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchOwnerGyms = async () => {
      try {
        const response = await API.get("/gyms/my-gyms")
        if (response.status === 200) {
          setGyms(response.data.gyms)
          if (response.data.gyms.length > 0) {
            setSelectedGymId(response.data.gyms[0]._id)
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

    if (!selectedGymId || selectedDates.length === 0 || !startTime || !endTime) {
      setError("Please select a gym, at least one date, and time slots.")
      return
    }

    try {
      const formattedDates = selectedDates.map((dateObj) =>
        moment(dateObj.toDate()).format("YYYY-MM-DD")
      )

      await Promise.all(
        formattedDates.map((date) =>
          API.post("/availability/set", {
            gymId: selectedGymId,
            date,
            startTime,
            endTime,
          })
        )
      )

      setSuccessMessage(
        `Availability set for ${formattedDates.length} date(s) at ${
          gyms.find((g) => g._id === selectedGymId)?.name
        }!`
      )
    } catch (err) {
      console.error("Set availability error:", err.response?.data || err.message)
      setError(err.response?.data?.message || "Failed to set availability.")
    }
  }

  if (loading) return <Loader />
  if (error && gyms.length === 0) return <div className="error-message-center">{error}</div>

  return (
    <div className="admin-set-date-availability-container">
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
              <p className="no-content-message">
                No gyms available to set availability for. Please add a gym first.
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Select Multiple Dates:</label>
            <DatePicker
              multiple
              value={selectedDates}
              onChange={setSelectedDates}
              minDate={new Date()}
              portal
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
