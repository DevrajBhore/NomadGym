// owner/VerifyBooking.jsx
import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import API from "../../api/axiosConfig"
import "../../styles/VerifyBooking.css"

const VerifyBooking = () => {
  const [searchParams] = useSearchParams()
 // const [bookingId, setBookingId] = useState(searchParams.get("bookingId") || "")
  const [otp, setOtp] = useState(searchParams.get("otp") || "")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Auto-fill form if URL parameters are present
  useEffect(() => {
    // const urlBookingId = searchParams.get("bookingId")
    const urlOtp = searchParams.get("otp")

   // if (urlBookingId) setBookingId(urlBookingId)
    if (urlOtp) setOtp(urlOtp)
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setLoading(true)

    if (!otp) {
      setError("Please enter OTP.")
      setLoading(false)
      return
    }

    try {
      const response = await API.post("/bookings/verify-booking-otp", {
        // bookingId,
        otp: Number(otp),
      })

      if (response.status === 200) {
        setMessage(response.data.message)
        // Clear form after successful verification
        setTimeout(() => {
          // setBookingId("")
          setOtp("")
          setMessage("")
        }, 3000)
      }
    } catch (err) {
      console.error("OTP verification error:", err.response?.data || err.message)
      setError(err.response?.data?.error || "Failed to verify OTP. Please check the details.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verify-booking-container">
      <form className="verify-booking-form card-base" onSubmit={handleSubmit}>
        <h2>Verify Booking OTP</h2>
        <p className="form-description">Enter OTP shown by the customer to verify their booking.</p>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        {/* <div className="form-group">
          <label htmlFor="bookingId">Booking ID:</label>
          <input
            type="text"
            id="bookingId"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            required
            placeholder="Enter booking ID"
            className="input-base"
          />
        </div> */}

        <div className="form-group">
          <label htmlFor="otp">OTP:</label>
          <input
            type="number"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            placeholder="Enter 6-digit OTP"
            className="input-base"
            maxLength="6"
          />
        </div>

        <button type="submit" className="verify-button button-primary" disabled={loading}>
          {loading ? "Verifying..." : "Verify Booking"}
        </button>

        <div className="help-text">
          <p>
            <strong>Note:</strong> The customer should show you their booking confirmation with the OTP code. Enter OTP to complete the verification.
          </p>
        </div>
      </form>
    </div>
  )
}

export default VerifyBooking
