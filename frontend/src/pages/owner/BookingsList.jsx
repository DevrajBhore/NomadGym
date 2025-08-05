// owner/BookingsList.jsx
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import API from "../../api/axiosConfig"
import Loader from "../../components/Loader"
import "../../styles/BookingsList.css"

const BookingsList = () => {
  const [bookings, setBookings] = useState([])
  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedGym, setSelectedGym] = useState("all") // Filter by gym
  const [filteredBookings, setFilteredBookings] = useState([])

  useEffect(() => {
    const fetchOwnerBookings = async () => {
      try {
        console.log("Fetching owner bookings...") // Debug log
        const response = await API.get("/bookings/all-bookings")
        console.log("Response:", response) // Debug log

        if (response.status === 200 && response.data.success) {
          const bookingsData = response.data.bookings || []
          setBookings(bookingsData)
          setFilteredBookings(bookingsData)

          // Extract unique gyms from bookings
          const uniqueGyms = bookingsData.reduce((acc, booking) => {
            if (booking.gym && !acc.find((gym) => gym._id === booking.gym._id)) {
              acc.push({
                _id: booking.gym._id,
                name: booking.gym.name,
                city: booking.gym.city,
              })
            }
            return acc
          }, [])
          setGyms(uniqueGyms)
        } else {
          console.log("Response not successful:", response.data)
          setError("Failed to load bookings.")
        }
      } catch (err) {
        console.error("Error fetching gym bookings:", err)
        console.error("Error response:", err.response) // Debug log
        setError(err.response?.data?.message || "Failed to load bookings. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchOwnerBookings()
  }, [])

  // Filter bookings when selectedGym changes
  useEffect(() => {
    if (selectedGym === "all") {
      setFilteredBookings(bookings)
    } else {
      setFilteredBookings(bookings.filter((booking) => booking.gym?._id === selectedGym))
    }
  }, [selectedGym, bookings])

  const handleGymFilter = (gymId) => {
    setSelectedGym(gymId)
  }

  const getBookingStats = () => {
    const totalBookings = filteredBookings.length
    const verifiedBookings = filteredBookings.filter((b) => b.isVerified).length
    const pendingBookings = totalBookings - verifiedBookings
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.amount, 0)

    return { totalBookings, verifiedBookings, pendingBookings, totalRevenue }
  }

  if (loading) return <Loader />
  if (error) return <div className="error-message-center">{error}</div>

  const stats = getBookingStats()

  return (
    <div className="bookings-list-container">
      <h2>All Your Gym Bookings</h2>

      {/* Gym Filter */}
      {gyms.length > 1 && (
        <div className="gym-filter-section">
          <h3>Filter by Gym:</h3>
          <div className="gym-filter-buttons">
            <button
              className={`filter-button ${selectedGym === "all" ? "active" : ""}`}
              onClick={() => handleGymFilter("all")}
            >
              All Gyms ({bookings.length})
            </button>
            {gyms.map((gym) => (
              <button
                key={gym._id}
                className={`filter-button ${selectedGym === gym._id ? "active" : ""}`}
                onClick={() => handleGymFilter(gym._id)}
              >
                {gym.name} ({bookings.filter((b) => b.gym?._id === gym._id).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Booking Statistics */}
      {filteredBookings.length > 0 && (
        <div className="booking-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Bookings</h4>
              <p className="stat-number">{stats.totalBookings}</p>
            </div>
            <div className="stat-card">
              <h4>Verified</h4>
              <p className="stat-number verified">{stats.verifiedBookings}</p>
            </div>
            <div className="stat-card">
              <h4>Pending</h4>
              <p className="stat-number pending">{stats.pendingBookings}</p>
            </div>
            <div className="stat-card">
              <h4>Total Revenue</h4>
              <p className="stat-number revenue">₹{stats.totalRevenue}</p>
            </div>
          </div>
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div className="no-content-message">
          <p>
            {selectedGym === "all"
              ? "No bookings found for your gyms yet."
              : `No bookings found for ${gyms.find((g) => g._id === selectedGym)?.name || "this gym"} yet.`}
          </p>
          <p>They'll appear here as customers start booking.</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="booking-item-card card-base">
              <div className="booking-header">
                <h3>Booking #{booking._id.substring(0, 8)}</h3>
                <span className={`booking-status-badge ${booking.isVerified ? "verified" : "pending"}`}>
                  {booking.isVerified ? "✓ Verified" : "⏳ Pending"}
                </span>
              </div>

              <div className="booking-details">
                <p>
                  <strong>Gym:</strong> {booking.gym?.name || "Unknown"}
                  {booking.gym?.city && <span className="gym-city"> ({booking.gym.city})</span>}
                </p>
                <p>
                  <strong>Customer:</strong> {booking.user?.name || "N/A"}
                  <br />
                  <small>{booking.user?.email || "N/A"}</small>
                </p>
                <p>
                  <strong>Date & Time:</strong> {booking.date} at {booking.timeSlot}
                </p>
                <p>
                  <strong>Amount:</strong> <span className="booking-amount">₹{booking.amount}</span>
                </p>

                {booking.otp && (
                  <div className="otp-section">
                    <p>
                      <strong>OTP:</strong> <span className="booking-otp-display">{booking.otp}</span>
                    </p>
                    <small className="otp-note">Customer should show this OTP upon arrival</small>
                  </div>
                )}

                <p className="booking-date">
                  <strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="booking-actions">
                {!booking.isVerified && booking.otp && (
                  <Link
                    to={`/owner/verify-booking?bookingId=${booking._id}&otp=${booking.otp}`}
                    className="verify-button button-primary"
                  >
                    Verify OTP
                  </Link>
                )}
                {booking.isVerified && (
                  <div className="verified-badge">
                    <span>✓ Verified & Complete</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="back-link">
        <Link to="/owner/dashboard" className="button-secondary">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default BookingsList

