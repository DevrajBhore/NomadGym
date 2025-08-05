// components/GymInfoCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/GymInfoCard.css";
import { MapPin, Phone, Mail, LandPlot, Dumbbell, Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

const GymInfoCard = ({ gym, onClose }) => {
  if (!gym) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          <Star size={24} />
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          <Star size={24} />
        </span>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">
          <Star size={24} />
        </span>
      );
    }

    return stars;
  };

  // Safe image fallback
  const getGymImage = (url) =>
    url && url.trim() !== ""
      ? url
      : "https://source.unsplash.com/400x300/?gym,fitness,workout";

  return (
    <div className="gym-card-backdrop" onClick={handleBackdropClick}>
      <div className="gym-card-container">
        <button className="gym-card-close" onClick={onClose}>
          ×
        </button>

        <div className="gym-card-image-container">
          <Swiper
            spaceBetween={10}
            slidesPerView={1}
            className="mapcard-swiper"
            style={{ borderRadius: "8px" }}
          >
            {(gym.imageUrls?.length ? gym.imageUrls : ["/placeholder.svg"]).map(
              (url, i) => (
                <SwiperSlide key={i}>
                  <img
                    src={url}
                    alt={`Image ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </SwiperSlide>
              )
            )}
          </Swiper>

          <div className="gym-card-distance">
            <MapPin size={24} /> {gym.distance}km away
          </div>
        </div>

        <div className="gym-card-content">
          <h3 className="gym-card-title">{gym.name}</h3>

          <div className="gym-card-rating">
            <div className="stars">
              {gym.averageRating > 0 ? (
                renderStars(gym.averageRating)
              ) : (
                <span className="no-rating">No ratings yet</span>
              )}
            </div>
            {gym.averageRating > 0 && (
              <span className="rating-text">
                {gym.averageRating.toFixed(1)} ({gym.totalRatings} review
                {gym.totalRatings !== 1 ? "s" : ""})
              </span>
            )}
          </div>

          <p className="gym-card-address">
            {" "}
            <LandPlot size={24} />
            {gym.address}, {gym.city}
          </p>

          <div className="gym-card-price">
            <span className="price-label">Price:</span>
            <span className="price-value">₹{gym.pricePerHour}/hr</span>
          </div>

          <div className="gym-card-capacity">
            <span className="capacity-label">Capacity:</span>
            <span className="capacity-value">{gym.capacity} people</span>
          </div>

          {gym.amenities && gym.amenities.length > 0 && (
            <div className="gym-card-amenities">
              <span className="amenities-label">Amenities:</span>
              <div className="amenities-list">
                {gym.amenities.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="amenity-tag">
                    {amenity}
                  </span>
                ))}
                {gym.amenities.length > 3 && (
                  <span className="amenity-tag more">
                    +{gym.amenities.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="gym-card-actions">
            <Link
              to={`/gym/${gym.id}`}
              className="gym-card-button primary"
              onClick={onClose}
            >
              <Dumbbell size={24} /> Book Now
            </Link>
            <Link
              to={`/gym/${gym.id}`}
              className="gym-card-button secondary"
              onClick={onClose}
            >
              View Details
            </Link>
          </div>

          <div className="gym-card-contact">
            <span className="contact-info">
              <Phone size={24} /> {gym.contactNumber}
            </span>
            {gym.email && (
              <span className="contact-info">
                <Mail size={24} /> {gym.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymInfoCard;
