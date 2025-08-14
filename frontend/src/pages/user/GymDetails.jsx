// user/GymDetails.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/axiosConfig";
import Loader from "../../components/Loader";
import "../../styles/GymDetails.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Navigation } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation as SwiperNavigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const GymDetails = () => {
  const { id } = useParams();
  const [gym, setGym] = useState(null);
  const [allAvailability, setAllAvailability] = useState({
    dateSpecific: [],
    recurring: [],
  });
  const [selectedDate, setSelectedDate] = useState(null); // ✅ Store Date object
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGymAndAllAvailability = async () => {
      try {
        const gymResponse = await API.get(`/gyms/${id}`);
        if (gymResponse.status === 200) {
          setGym(gymResponse.data.gym);
        } else {
          setError("Gym not found.");
          setLoading(false);
          return;
        }

        const availResponse = await API.get(`/availability/user/${id}/all`);
        if (availResponse.status === 200) {
          setAllAvailability(availResponse.data);
        } else {
          setAllAvailability({ dateSpecific: [], recurring: [] });
        }
      } catch (err) {
        console.error("Error fetching gym details or all availability:", err);
        setError("Failed to load gym details or availability. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGymAndAllAvailability();
  }, [id]);

  useEffect(() => {
    if (selectedDate && allAvailability) {
      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

      const dateSpecific = allAvailability.dateSpecific.find(
        (avail) => avail.date === formattedDate
      );

      if (dateSpecific) {
        setFilteredSlots(dateSpecific.availableSlots);
      } else {
        const dayOfWeek = moment(selectedDate).format("dddd");
        const recurring = allAvailability.recurring.find(
          (rec) => rec.dayOfWeek === dayOfWeek
        );
        if (recurring) {
          const slots = generateTimeSlots(recurring.startTime, recurring.endTime);
          setFilteredSlots(slots);
        } else {
          setFilteredSlots([]);
        }
      }
    } else {
      setFilteredSlots([]);
    }
  }, [selectedDate, allAvailability]);

  const generateTimeSlots = (start, end) => {
    const slots = [];
    const startMoment = moment(start, ["h:mm A", "hh:mm A"]);
    const endMoment = moment(end, ["h:mm A", "hh:mm A"]);

    if (!startMoment.isValid() || !endMoment.isValid()) return slots;
    if (startMoment.isSameOrAfter(endMoment)) return slots;

    const current = startMoment.clone();
    while (current.isBefore(endMoment)) {
      slots.push(current.format("hh:mm A"));
      current.add(1, "hour");
    }
    return slots;
  };

  if (loading) return <Loader />;
  if (error) return <div className="error-message-center">{error}</div>;
  if (!gym) return <div className="error-message-center">Gym details could not be loaded.</div>;

  const upcomingDateSpecific = allAvailability.dateSpecific.filter((avail) =>
    moment(avail.date).isSameOrAfter(moment(), "day")
  );

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleDirections = () => {
    const lat = gym.latitude;
    const lng = gym.longitude;
    const address = gym.address;

    const url =
      lat && lng
        ? isIOS
          ? `http://maps.apple.com/?daddr=${lat},${lng}`
          : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

    window.open(url, "_blank");
  };

  return (
    <div className="gym-details-container card-base">
      <div className="gym-details-header">
        {gym.imageUrls && gym.imageUrls.length > 0 ? (
          <Swiper
            modules={[SwiperNavigation]}
            navigation={window.innerWidth > 768}
            spaceBetween={10}
            slidesPerView={1}
            className="gym-carousel"
          >
            {gym.imageUrls.map((img, i) => (
              <SwiperSlide key={i}>
                <img src={img} alt={`Gym ${i + 1}`} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <img src="/placeholder.svg" alt={gym.name} className="gym-details-image" />
        )}
        <h1>{gym.name}</h1>
        <p className="gym-location">
          {gym.address}, {gym.city}
        </p>
        <button onClick={handleDirections} className="direction-button">
          <Navigation size={24} /> Get Directions
        </button>
        <p className="gym-price">₹{gym.pricePerHour} / hour</p>
        <p className="gym-phone">Contact: {gym.ownerPhoneNumber || "N/A"}</p>
      </div>

      <div className="gym-details-section">
        <h2>Description</h2>
        <p>{gym.description || "No description available."}</p>
      </div>

      <div className="gym-details-section">
        <h2>Amenities</h2>
        {gym.amenities && gym.amenities.length > 0 ? (
          <ul className="amenities-list">
            {gym.amenities.map((amenity, index) => (
              <li key={index}>{amenity}</li>
            ))}
          </ul>
        ) : (
          <p>No amenities listed.</p>
        )}
      </div>

      <div className="gym-details-section">
        <h2 className="">Book Your Slot</h2>
        <div className="availability-form">
          <label htmlFor="bookingDate">Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)} 
            minDate={new Date()}
            placeholderText="Select a date"
            className="input-base"
          />
        </div>

        {selectedDate && (
          <div className="availability-slots">
            {filteredSlots.length > 0 ? (
              <>
                <h3>Available Slots for {moment(selectedDate).format("YYYY-MM-DD")}:</h3>
                <div className="slots-grid">
                  {filteredSlots.map((slot, index) => (
                    <Link
                      to={`/book/${gym._id}?date=${moment(selectedDate).format("YYYY-MM-DD")}&time=${encodeURIComponent(slot)}`}
                      key={index}
                      className="slot-button button-primary"
                    >
                      {slot}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-availability-message">
                No availability found for {moment(selectedDate).format("YYYY-MM-DD")}.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="back-link">
        <Link to={`/gyms/${gym.city}`} className="button-secondary">
          ← Back to Gyms in {gym.city}
        </Link>
      </div>
    </div>
  );
};

export default GymDetails;
