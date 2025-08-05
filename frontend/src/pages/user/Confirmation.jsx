import { useState, useEffect } from "react"
import { useParams, useLocation, Link } from "react-router-dom"
import API from "../../api/axiosConfig"
import Loader from "../../components/Loader"
import "../../styles/Confirmation.css"

const Confirmation = () => {
  const { bookingId } = useParams()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [status, setStatus] = useState("pending") // 'pending', 'success', 'error'
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await API.get("/bookings/my-bookings")
        const foundBooking = response.data.bookings.find((b) => b._id === bookingId)

        if (foundBooking) {
          setBookingDetails(foundBooking)
          if (location.state?.success || foundBooking.isVerified) {
            setStatus("success")
            setMessage("Your booking has been successfully confirmed!")
          } else {
            setStatus("error")
            setMessage("Booking status could not be confirmed. Please check your bookings list.")
          }
        } else {
          setStatus("error")
          setMessage("Booking details not found.")
        }
      } catch (err) {
        console.error("Error fetching booking details for confirmation:", err)
        setStatus("error")
        setMessage("Failed to load booking details. Please check your bookings list.")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId, location.state])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card card-base">
        {status === "success" && (
          <>
            <div className="icon-success">✓</div>
            <h2>Booking Confirmed!</h2>
            <p className="confirmation-message">{message}</p>
            {bookingDetails && (
              <div className="booking-summary">
                <p>
                  <strong>Gym:</strong> {bookingDetails.gym?.name || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong> {bookingDetails.date}
                </p>
                <p>
                  <strong>Time:</strong> {bookingDetails.timeSlot}
                </p>
                <p>
                  <strong>Amount Paid:</strong> <span className="amount-paid">₹{bookingDetails.amount}</span>
                </p>
                <p>
                  <strong>Your OTP:</strong> <span className="otp-code">{bookingDetails.otp}</span>
                </p>
                <p className="otp-note">Show this OTP to the gym owner upon arrival.</p>
              </div>
            )}
            <div className="confirmation-actions">
              <Link to="/my-bookings" className="view-bookings-button button-primary">
                View My Bookings
              </Link>
              <Link to="/explore" className="explore-more-button button-secondary">
                Explore More Gyms
              </Link>
            </div>
          </>
        )}
        {status === "error" && (
          <>
            <div className="icon-error">✗</div>
            <h2>Booking Failed / Not Confirmed</h2>
            <p className="confirmation-message error">{message}</p>
            <div className="confirmation-actions">
              <Link to="/my-bookings" className="view-bookings-button button-primary">
                Check My Bookings
              </Link>
              <Link to="/explore" className="explore-more-button button-secondary">
                Try Booking Again
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Confirmation
