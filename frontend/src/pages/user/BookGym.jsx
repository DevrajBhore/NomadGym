import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import API from "../../api/axiosConfig"
import Loader from "../../components/Loader"
import "../../styles/BookGym.css"

const BookGym = () => {
  const { gymId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const initialDate = queryParams.get("date") || ""
  const initialTime = queryParams.get("time") || ""

  const [gym, setGym] = useState(null)
  const [bookingDate, setBookingDate] = useState(initialDate)
  const [timeSlot, setTimeSlot] = useState(initialTime)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchGymDetails = async () => {
      try {
        const gymResponse = await API.get(`/gyms/${gymId}`)
        if (gymResponse.status === 200) {
          setGym(gymResponse.data.gym)
        } else {
          setError("Gym not found.")
        }
      } catch (err) {
        console.error("Error fetching gym details:", err)
        setError("Failed to load gym details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchGymDetails()
  }, [gymId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!bookingDate || !timeSlot) {
      setError("Please select both date and time slot.")
      return
    }

    try {
      const response = await API.post("/bookings/initiate", {
        gymId,
        bookingDate,
        timeSlot,
      })

      if (response.status === 200) {
        setSuccessMessage("Booking initiated! Redirecting to payment...")
        navigate(`/payment/${response.data.bookingId}`, { state: { order: response.data.order } })
      }
    } catch (err) {
      console.error("Booking initiation error:", err.response?.data || err.message)
      setError(err.response?.data?.error || "Failed to initiate booking. Please try again.")
    }
  }

  if (loading) {
    return <Loader />
  }

  if (error && !gym) {
    return <div className="error-message-center">{error}</div>
  }

  if (!gym) {
    return <div className="error-message-center">Gym not found.</div>
  }

  return (
    <div className="book-gym-container">
      <div className="book-gym-card card-base">
        <h2>Book Slot at {gym.name}</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form className="book-gym-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="gymName">Gym:</label>
            <input type="text" id="gymName" value={gym.name} disabled className="input-base disabled-input" />
          </div>

          <div className="form-group">
            <label htmlFor="bookingDate">Date:</label>
            <input
              type="date"
              id="bookingDate"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="input-base"
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeSlot">Time Slot:</label>
            <input
              type="text"
              id="timeSlot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              placeholder="e.g., 09:00 AM"
              required
              className="input-base"
            />
            <small className="form-hint">Please ensure this slot is available for the selected date.</small>
          </div>

          <div className="form-group">
            <label>Price per hour:</label>
            <p className="price-display">₹{gym.pricePerHour}</p>
          </div>

          <button type="submit" className="book-button button-primary">
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookGym
