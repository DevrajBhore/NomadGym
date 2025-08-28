// owner/SetDateSpecificAvailability.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axiosConfig";
import Loader from "../../components/Loader";
import "../../styles/SetDateSpecificAvailability.css";
import DatePicker, { Calendar } from "react-multi-date-picker";
import moment from "moment";

const SetDateSpecificAvailability = () => {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [selectedGymId, setSelectedGymId] = useState("");
  // Keep as DateObject[] (from react-multi-date-picker) or Date[]; we normalize later
  const [selectedDates, setSelectedDates] = useState([]);
  // Use 24h "HH:mm" for <input type="time">; convert to backend-friendly on submit if needed
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchOwnerGyms = async () => {
      try {
        const response = await API.get("/gyms/my-gyms");
        if (response.status === 200) {
          setGyms(response.data.gyms || []);
          if ((response.data.gyms || []).length > 0) {
            setSelectedGymId(response.data.gyms[0]._id);
          }
        } else {
          setError("Failed to load your gyms. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching owner's gyms:", err);
        setError("Failed to load your gyms. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerGyms();
  }, []);

  // Normalize any date value from the calendar to "YYYY-MM-DD"
  const formattedDates = useMemo(() => {
    const toISO = (d) => {
      // DateObject from react-multi-date-picker has toDate()
      if (d && typeof d.toDate === "function") {
        return moment(d.toDate()).format("YYYY-MM-DD");
      }
      if (d instanceof Date) {
        return moment(d).format("YYYY-MM-DD");
      }
      if (typeof d === "string") {
        // allow a couple common inputs, then force ISO
        const parsed = moment(d, ["YYYY-MM-DD", "MM/DD/YYYY", moment.ISO_8601], true);
        return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
      }
      return null;
    };

    return (selectedDates || [])
      .map(toISO)
      .filter(Boolean)
      // Remove duplicates just in case
      .filter((v, i, arr) => arr.indexOf(v) === i)
      // Sort ascending for consistency
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }, [selectedDates]);

  // Convert "HH:mm" to "hh:mm A" if your backend expects AM/PM
  const formatToAmPm = (t24) => {
    const m = moment(t24, "HH:mm");
    return m.isValid() ? m.format("hh:mm A") : t24;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!selectedGymId) {
      setError("Please select a gym.");
      return;
    }
    if (formattedDates.length === 0) {
      setError("Please select at least one date.");
      return;
    }
    if (!startTime || !endTime) {
      setError("Please select a valid start and end time.");
      return;
    }

    try {
      const start = formatToAmPm(startTime);
      const end = formatToAmPm(endTime);

      await Promise.all(
        formattedDates.map((date) =>
          API.post("/availability/set", {
            gymId: selectedGymId,
            date,
            startTime: start,
            endTime: end,
          })
        )
      );

      const gymName = gyms.find((g) => g._id === selectedGymId)?.name || "your gym";
      setSuccessMessage(`Availability set for ${formattedDates.length} date(s) at ${gymName}!`);
    } catch (err) {
      console.error("Set availability error:", err?.response?.data || err?.message);
      setError(err?.response?.data?.message || "Failed to set availability.");
    }
  };

  if (loading) return <Loader />;
  if (error && gyms.length === 0)
    return <div className="error-message-center">{error}</div>;

  return (
    <div className="admin-set-date-availability-container">
      <div className="admin-set-date-availability-card card-base">
        <h2>Set Date-Specific Availability (Owner)</h2>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form className="admin-set-date-availability-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="gymSelect">Select Your Gym:</label>
            {gyms.length > 0 ? (
              <select
                id="gymSelect"
                value={selectedGymId}
                onChange={(e) => setSelectedGymId(e.target.value)}
                className="input-base"
                required
              >
                {gyms.map((gym) => (
                  <option key={gym._id} value={gym._id}>
                    {gym.name} ({gym.city})
                  </option>
                ))}
              </select>
            ) : (
              <p className="no-content-message">
                No gyms available to set availability for. Please add a gym first.
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Select Multiple Dates:</label>
            {/* Use Calendar for inline picker; 'render' prop was incorrect */}
            <Calendar
              multiple
              value={selectedDates}
              onChange={setSelectedDates}
              minDate={new Date()}
              format="YYYY-MM-DD"
              weekStartDayIndex={1}
              shadow={false}
              className="inline-calendar"
            />
            {/* Optional: keep a hidden DatePicker to leverage its input parsing if you want */}
            <DatePicker style={{ display: "none" }} />
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start Time:</label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="input-base"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time:</label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="input-base"
            />
          </div>

          <button
            type="submit"
            className="set-button button-primary"
            disabled={!selectedGymId || formattedDates.length === 0}
          >
            Set Availability
          </button>
        </form>

        <div className="back-link">
          <button onClick={() => navigate("/owner/dashboard")} className="button-secondary">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetDateSpecificAvailability;
