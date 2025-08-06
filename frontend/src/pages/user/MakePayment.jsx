import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import API from "../../api/axiosConfig"
import Loader from "../../components/Loader"
import "../../styles/MakePayment.css"

const MakePayment = () => {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [bookingDetails, setBookingDetails] = useState(null)
  const [razorpayOrder, setRazorpayOrder] = useState(null)

  useEffect(() => {
    if (location.state && location.state.order) {
      setRazorpayOrder(location.state.order)
      setBookingDetails({
        _id: bookingId,
        amount: location.state.order.amount / 100, // Convert paise to rupees
      })
      setLoading(false)
    } else {
      const fetchBookingDetails = async () => {
        try {
          const response = await API.get("/bookings/my-bookings")
          const foundBooking = response.data.bookings.find((b) => b._id === bookingId)
          if (foundBooking) {
            setBookingDetails(foundBooking)
            setError("Payment order details missing. Please re-initiate booking from gym details page.")
          } else {
            setError("Booking details not found.")
          }
        } catch (err) {
          console.error("Error fetching booking details:", err)
          setError("Failed to load booking details. Please go back and try again.")
        } finally {
          setLoading(false)
        }
      }
      fetchBookingDetails()
    }
  }, [bookingId, location.state])

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const displayRazorpay = async () => {
    setError("")
    const res = await loadRazorpayScript()

    if (!res) {
      setError("Razorpay SDK failed to load. Are you online?")
      return
    }

    if (!razorpayOrder || !bookingDetails) {
      setError("Payment order or booking details are missing. Please re-initiate booking.")
      return
    }

    const options = {
      key: import.meta.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "NomadGym",
      description: "Gym Booking Payment",
      order_id: razorpayOrder.id,
      handler: async (response) => {
        try {
          const verifyResponse = await API.post("/bookings/confirm", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: bookingId,
          })

          if (verifyResponse.status === 200) {
            navigate(`/confirmation/${bookingId}`, { state: { success: true } })
          } else {
            setError("Payment verification failed. Please contact support.")
          }
        } catch (err) {
          console.error("Payment verification error:", err.response?.data || err.message)
          setError(err.response?.data?.error || "Payment verification failed. Please try again.")
        }
      },
      prefill: {
        name: "User Name",
        email: "user@example.com",
        contact: "9999999999",
      },
      notes: {
        booking_id: bookingId,
      },
      theme: {
        color: "#007AFF",
      },
    }

    const paymentObject = new window.Razorpay(options)
    paymentObject.open()
  }

  if (loading) {
    return <Loader />
  }

  if (error && !bookingDetails) {
    return <div className="error-message-center">{error}</div>
  }

  if (!bookingDetails) {
    return <div className="error-message-center">Booking details not found.</div>
  }

  return (
    <div className="make-payment-container">
      <div className="payment-card card-base">
        <h2>Complete Your Booking Payment</h2>
        {error && <p className="error-message">{error}</p>}
        {bookingDetails && (
          <div className="payment-summary">
            <p>
              Booking ID: <strong>{bookingDetails._id.substring(0, 8)}...</strong>
            </p>
            <p>
              Amount to Pay: <strong className="amount-display">₹{bookingDetails.amount}</strong>
            </p>
          </div>
        )}
        <button onClick={displayRazorpay} className="pay-button button-primary">
          Pay Now with Razorpay
        </button>
        <p className="payment-note">You will be redirected to a secure payment gateway.</p>
      </div>
    </div>
  )
}

export default MakePayment
