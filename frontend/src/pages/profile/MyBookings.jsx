// profile/MyBookings.jsx
import { useState, useEffect } from "react";
import API from "../../api/axiosConfig";
import Loader from "../../components/Loader";
import "../../styles/MyBookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        console.log("Fetching bookings..."); // Debug log
        const response = await API.get("/bookings/my-bookings");
        console.log("Response:", response); // Debug log

        if (response.status === 200 && response.data) {
          console.log("Bookings data:", response.data); // Debug log
          setBookings(response.data.bookings || []);
        } else {
          console.log("No bookings data received");
          setBookings([]);
        }
      } catch (err) {
        console.error("Error fetching my bookings:", err);
        console.error("Error response:", err.response); // Debug log
        setError("Failed to load your bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        const response = await API.delete(`/bookings/${bookingId}`);
        if (response.status === 200) {
          setCancelMessage("Booking cancelled successfully!");
          setBookings(bookings.filter((booking) => booking._id !== bookingId));
          // Clear message after 3 seconds
          setTimeout(() => setCancelMessage(""), 3000);
        }
      } catch (err) {
        console.error("Error cancelling booking:", err);
        setCancelMessage(
          err.response?.data?.message || "Failed to cancel booking."
        );
        // Clear message after 5 seconds
        setTimeout(() => setCancelMessage(""), 5000);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="error-message-center">{error}</div>;
  }

  return (
    <div className="my-bookings-container">
      <h2>My Bookings</h2>
      {cancelMessage && (
        <p className="info-message success-message">{cancelMessage}</p>
      )}

      {bookings.length === 0 ? (
        <div className="no-content-message">
          <p>You have no bookings yet.</p>
          <p>Start by exploring gyms and making your first booking!</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card card-base">
              <div>
                <h3>{booking.gym?.name || "Gym Name Not Available"}</h3>
                <p>
                  <strong>Date:</strong> {booking.date}
                </p>
                <p>
                  <strong>Time:</strong> {booking.timeSlot}
                </p>
                <p>
                  <strong>Amount:</strong>{" "}
                  <span className="booking-amount">₹{booking.amount}</span>
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`booking-status ${
                      booking.isVerified ? "verified" : "pending"
                    }`}
                  >
                    {booking.isVerified ? "Verified" : "Pending Verification"}
                  </span>
                </p>
                {booking.otp && (
                  <>
                    <p>
                      <strong>OTP:</strong>{" "}
                      <span className="booking-otp">{booking.otp}</span>
                    </p>
                    <p className="otp-note">
                      Show this OTP to the gym owner upon arrival.
                    </p>
                  </>
                )}
                <p>
                  <strong>Booking ID:</strong> {booking._id}
                </p>
                <button
                  onClick={() => {
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                    const lat = booking.gym?.latitude;
                    const lng = booking.gym?.longitude;
                    const address = booking.gym?.address;

                    const url =
                      lat && lng
                        ? isIOS
                          ? `http://maps.apple.com/?daddr=${lat},${lng}`
                          : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
                        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            address
                          )}`;

                    window.open(url, "_blank");
                  }}
                  className="direction-button"
                >
                 Get Directions
                </button>
              </div>
              <button
                onClick={() => handleCancelBooking(booking._id)}
                className="cancel-button button-danger"
                disabled={booking.isVerified}
              >
                {booking.isVerified ? "Already Verified" : "Cancel Booking"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
