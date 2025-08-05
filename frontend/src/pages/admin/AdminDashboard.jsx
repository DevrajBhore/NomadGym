import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link
import API from "../../api/axiosConfig";
import Loader from "../../components/Loader";
import "../../styles/AdminDashboard.css";
// Add Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

const AdminDashboard = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [allGyms, setAllGyms] = useState([]); // New state for gyms
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      let bookingsError = "";
      let gymsError = "";

      // Fetch all bookings
      try {
        const bookingsResponse = await API.get("/bookings/all");
        if (bookingsResponse.status === 200) {
          setAllBookings(bookingsResponse.data.bookings);
        }
      } catch (err) {
        console.error("Error fetching all bookings for admin:", err);
        bookingsError = "Failed to load all bookings. Please try again.";
      }

      // Fetch all gyms
      try {
        const gymsResponse = await API.get("/gyms/all-gyms"); // New endpoint
        if (gymsResponse.status === 200) {
          setAllGyms(gymsResponse.data.gyms);
        }
      } catch (err) {
        console.error("Error fetching all gyms for admin:", err);
        gymsError = "Failed to load all gyms. Please try again.";
      } finally {
        setLoading(false);
        if (bookingsError || gymsError) {
          setError(
            bookingsError +
              (bookingsError && gymsError ? " | " : "") +
              gymsError
          );
        }
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="error-message-center">{error}</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <h2>Admin Dashboard</h2>

      {/* All Bookings Section */}
      <h3>All Bookings</h3>
      {allBookings.length === 0 ? (
        <p className="no-content-message">No bookings found in the system.</p>
      ) : (
        <div className="admin-bookings-list">
          {allBookings.map((booking) => (
            <div key={booking._id} className="admin-booking-card card-base">
              <h4>Booking ID: {booking._id.substring(0, 8)}...</h4>
              <p>
                <strong>User:</strong> {booking.user?.name || "N/A"} (
                {booking.user?.email || "N/A"})
              </p>
              <p>
                <strong>Gym:</strong> {booking.gym?.name || "N/A"} (
                {booking.gym?.city || "N/A"})
              </p>
              <p>
                <strong>Date:</strong> {booking.date}
              </p>
              <p>
                <strong>Time Slot:</strong> {booking.timeSlot}
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
              <p>
                <strong>OTP:</strong>{" "}
                <span className="booking-otp-display">{booking.otp}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* All Registered Gyms Section */}
      <h3 className="section-heading-top-margin">All Registered Gyms</h3>
      {allGyms.length === 0 ? (
        <p className="no-content-message">
          No gyms registered in the system yet.
        </p>
      ) : (
        <div className="admin-gyms-list">
          {allGyms.map((gym) => (
            <div key={gym._id} className="admin-gym-card card-base">
              <h4>{gym.name}</h4>
              {Array.isArray(gym.imageUrls) && gym.imageUrls.length > 0 ? (
                <Swiper
                  modules={[Navigation]}
                  navigation
                  spaceBetween={10}
                  slidesPerView={1}
                  className="gym-dashboard-swiper"
                >
                  {gym.imageUrls.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={img}
                        alt={`Gym ${i + 1}`}
                        className="dashboard-gym-image"
                        onError={(e) => (e.target.src = "/placeholder.svg")}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <img
                  src="/placeholder.svg"
                  alt="No images"
                  className="dashboard-gym-image"
                />
              )}
              <p>
                <strong>City:</strong> {gym.city}
              </p>
              <p>
                <strong>Address:</strong> {gym.address}
              </p>
              <strong>Owner:</strong>{" "}
              {gym?.ownerId?.name && gym?.ownerId?.email
                ? `${gym.ownerId.name} (${gym.ownerId.email})`
                : "N/A"}
              <p>
                <strong>Price/Hour:</strong> ₹{gym.pricePerHour}
              </p>
              <div className="gym-actions">
                <Link
                  to={`/admin/gym/${gym._id}/all-availability`}
                  className="action-button button-secondary"
                >
                  View Availability
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
