// owner/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axiosConfig";
import Loader from "../../components/Loader";
import "../../styles/OwnerDashboard.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

const OwnerDashboard = () => {
  const [gyms, setGyms] = useState([]);
  const [bookingStats, setBookingStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priceUpdateMessage, setPriceUpdateMessage] = useState("");
  const [newPrice, setNewPrice] = useState({});

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        console.log("Fetching owner data..."); // Debug log

        // Fetch gyms
        const gymsResponse = await API.get("/gyms/my-gyms");
        console.log("Gyms response:", gymsResponse); // Debug log

        if (gymsResponse.status === 200 && gymsResponse.data) {
          const gymsData = gymsResponse.data.gyms || [];
          setGyms(gymsData);

          const initialPrices = {};
          gymsData.forEach((gym) => {
            initialPrices[gym._id] = gym.pricePerHour;
          });
          setNewPrice(initialPrices);
        }

        // Fetch booking statistics
        const bookingsResponse = await API.get("/bookings/all-bookings");
        if (bookingsResponse.status === 200 && bookingsResponse.data.success) {
          const bookings = bookingsResponse.data.bookings || [];
          const gymsData = gyms; // Declare gymsData here

          // Calculate stats per gym
          const stats = {};
          gymsData.forEach((gym) => {
            const gymBookings = bookings.filter(
              (booking) => booking.gym?._id === gym._id
            );
            stats[gym._id] = {
              total: gymBookings.length,
              verified: gymBookings.filter((b) => b.isVerified).length,
              pending: gymBookings.filter((b) => !b.isVerified).length,
              revenue: gymBookings.reduce((sum, b) => sum + b.amount, 0),
            };
          });
          setBookingStats(stats);
        }
      } catch (err) {
        console.error("Error fetching owner data:", err);
        console.error("Error response:", err.response); // Debug log
        setError("Failed to load your data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);

  const handlePriceChange = (gymId, value) => {
    setNewPrice((prev) => ({ ...prev, [gymId]: value }));
  };

  const handleUpdatePrice = async (gymId) => {
    setPriceUpdateMessage("");
    const price = newPrice[gymId];
    if (!price || price < 1) {
      setPriceUpdateMessage("Price must be a positive number.");
      return;
    }

    try {
      const response = await API.patch(`/gyms/update-price/${gymId}`, {
        pricePerHour: price,
      });
      if (response.status === 200) {
        setPriceUpdateMessage(`Price updated successfully!`);
        setGyms(
          gyms.map((gym) =>
            gym._id === gymId ? { ...gym, pricePerHour: price } : gym
          )
        );
        // Clear message after 3 seconds
        setTimeout(() => setPriceUpdateMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error updating price:", err);
      setPriceUpdateMessage(
        err.response?.data?.message || "Failed to update price."
      );
      setTimeout(() => setPriceUpdateMessage(""), 5000);
    }
  };

  const handleDeleteImage = async (gymId, imageUrl) => {
    try {
      const response = await API.patch(`/gyms/${gymId}/delete-image`, { imageUrl });
      if (response.status === 200) {
        setGyms(gyms =>
          gyms.map(gym =>
            gym._id === gymId
              ? { ...gym, imageUrls: gym.imageUrls.filter(url => url !== imageUrl) }
              : gym
          )
        );
      }
    } catch (err) {
      setError("Failed to delete image.");
    }
  };

  const handleAddImages = async (gymId, files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("images", file));
    try {
      const response = await API.patch(`/gyms/${gymId}/add-images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200 && response.data.images) {
        setGyms(gyms =>
          gyms.map(gym =>
            gym._id === gymId
              ? { ...gym, imageUrls: [...gym.imageUrls, ...response.data.images] }
              : gym
          )
        );
      }
    } catch (err) {
      setError("Failed to add images.");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="error-message-center">{error}</div>;
  }

  const totalStats = Object.values(bookingStats).reduce(
    (acc, stats) => ({
      total: acc.total + stats.total,
      verified: acc.verified + stats.verified,
      pending: acc.pending + stats.pending,
      revenue: acc.revenue + stats.revenue,
    }),
    { total: 0, verified: 0, pending: 0, revenue: 0 }
  );

  return (
    <div className="owner-dashboard-container">
      <h2>Your Gym's Dashboard</h2>
      {priceUpdateMessage && (
        <p className="info-message success-message">{priceUpdateMessage}</p>
      )}

      {/* Overall Statistics */}
      {totalStats.total > 0 && (
        <div className="dashboard-stats">
          <h3>Overall Booking Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Bookings</h4>
              <p className="stat-number">{totalStats.total}</p>
            </div>
            <div className="stat-card">
              <h4>Verified</h4>
              <p className="stat-number verified">{totalStats.verified}</p>
            </div>
            <div className="stat-card">
              <h4>Pending</h4>
              <p className="stat-number pending">{totalStats.pending}</p>
            </div>
            <div className="stat-card">
              <h4>Total Revenue</h4>
              <p className="stat-number revenue">₹{totalStats.revenue}</p>
            </div>
          </div>
        </div>
      )}

      {gyms.length === 0 ? (
        <div className="no-content-message">
          <p>You don't have any gyms registered yet.</p>
          <p>Contact an admin to add gyms to your account.</p>
        </div>
      ) : (
        <div className="gyms-list">
          {gyms.map((gym) => {
            const gymStats = bookingStats[gym._id] || {
              total: 0,
              verified: 0,
              pending: 0,
              revenue: 0,
            };

            return (
              <div key={gym._id} className="gym-card-owner card-base">
                <div className="gym-info">
                  {gym.imageUrls && gym.imageUrls.length > 0 ? (
                    <Swiper
                      modules={[Navigation]}
                      navigation={true}
                      spaceBetween={10}
                      slidesPerView={1}
                      className="gym-dashboard-swiper"
                    >
                      {gym.imageUrls.map((img, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={img}
                            alt={`Gym Image ${index + 1}`}
                            className="dashboard-gym-image"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <img
                      src="/placeholder.svg"
                      alt="No image"
                      className="dashboard-gym-image"
                    />
                  )}

                  <h3>{gym.name}</h3>
                  <p>
                    <strong>Location:</strong> {gym.address}, {gym.city}
                  </p>
                  <p>
                    <strong>Current Price:</strong>{" "}
                    <span className="current-price">
                      ₹{gym.pricePerHour} / hour
                    </span>
                  </p>
                  <p>
                    <strong>Contact:</strong> {gym.contactNumber || "N/A"}
                  </p>
                  {/* <p>
                    <strong>Status:</strong>
                    <span
                      className={`gym-status ${
                        gym.isApproved ? "approved" : "pending"
                      }`}
                    >
                      {gym.isApproved ? " Approved" : " Pending Approval"}
                    </span>
                  </p> */}

                  {/* Individual Gym Stats */}
                  {gymStats.total > 0 && (
                    <div className="gym-stats">
                      <h4>Booking Stats:</h4>
                      <div className="gym-stats-row">
                        <span>
                          Total: <strong>{gymStats.total}</strong>
                        </span>
                        <span>
                          Verified:{" "}
                          <strong className="verified">
                            {gymStats.verified}
                          </strong>
                        </span>
                        <span>
                          Pending:{" "}
                          <strong className="pending">
                            {gymStats.pending}
                          </strong>
                        </span>
                        <span>
                          Revenue:{" "}
                          <strong className="revenue">
                            ₹{gymStats.revenue}
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="image-edit-section">
                  <h4>Edit Images</h4>
                  <h3>Only png & jpeg formatted images can be upload</h3>
                  <div className="image-list">
                    {gym.imageUrls.map((img, idx) => (
                      <div key={idx} className="image-edit-item">
                        <img
                          src={img}
                          alt={`Gym Image ${idx + 1}`}
                          className="dashboard-gym-image"
                        />
                        <button
                          className="delete-image-btn"
                          onClick={() => handleDeleteImage(gym._id, img)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleAddImages(gym._id, e.target.files)}
                  />
                </div>

                {/* <div className="price-update-section">
                  <label htmlFor={`price-${gym._id}`}>Set New Price:</label>
                  <div className="price-input-group">
                    <input
                      type="number"
                      id={`price-${gym._id}`}
                      value={newPrice[gym._id] || ""}
                      onChange={(e) => handlePriceChange(gym._id, e.target.value)}
                      min="1"
                      className="input-base"
                      placeholder="Enter new price"
                    />
                    <button onClick={() => handleUpdatePrice(gym._id)} className="update-price-button button-primary">
                      Update
                    </button>
                  </div>
                </div> */}

                <div className="gym-actions">
                  {/* <Link
                    to={`/owner/gym/${gym._id}/set-recurring-availability`}
                    className="action-button button-secondary"
                  >
                    Set Recurring Availability
                  </Link> */}
                  <Link
                    to={`/owner/gym/${gym._id}/all-availability`}
                    className="action-button button-secondary"
                  >
                    View All Availability
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="dashboard-actions">
        <Link
          to="/owner/set-date-availability"
          className="button-secondary action-button"
        >
          Set Date-Specific Availability
        </Link>
      </div>
    </div>
  );
};

export default OwnerDashboard;