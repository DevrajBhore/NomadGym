// components/GymCard.jsx
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "../styles/GymCard.css"; // import custom styles

const GymCard = ({ gym }) => {
  return (
    <div className="card-base">
      <div className="gymcard-image-wrapper">
        <Swiper spaceBetween={0} slidesPerView={1} className="gymcard-swiper">
          {(gym.imageUrls?.length ? gym.imageUrls : ["/placeholder.svg"]).map(
            (url, i) => (
              <SwiperSlide key={i}>
                <img
                  src={url}
                  alt={`Gym ${gym.name} - ${i + 1}`}
                  className="gymcard-image"
                />
              </SwiperSlide>
            )
          )}
        </Swiper>
      </div>

      <div className="gymcard-content">
        <h3 className="gymcard-name">{gym.name}</h3>
        <p className="gymcard-address">{gym.address}, {gym.city}</p>
        <p className="gymcard-price">₹{gym.pricePerHour} / hour</p>
        <Link to={`/gym/${gym._id}`} className="gymcard-button">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default GymCard;
