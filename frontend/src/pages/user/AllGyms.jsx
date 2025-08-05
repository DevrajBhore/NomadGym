// user/AllGyms.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/axiosConfig";
import GymCard from "../../components/GymCard";
import Loader from "../../components/Loader";
import "../../styles/AllGyms.css";

const AllGyms = () => {
  const { city } = useParams();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await API.get(`/gyms/city/${city}`);
        if (response.status === 200) {
          setGyms(response.data.gyms);
        }
      } catch (err) {
        console.error(`Error fetching gyms for ${city}:`, err);
        setError(`Failed to load gyms for ${city}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchGyms();
    }
  }, [city]);

  const filteredGyms = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return gyms.filter(
      (g) =>
        g.name?.toLowerCase().includes(term) ||
        g.description?.toLowerCase().includes(term) ||
        g.city?.toLowerCase().includes(term)
    );
  }, [gyms, searchTerm]);

  if (loading) return <Loader />;
  if (error) return <div className="error-message-center">{error}</div>;

  return (
    <div className="all-gyms-container">
      <h2>Gyms in {city}</h2>

      {/* Search bar */}
      <div className="gym-search-bar">
        <input
          type="text"
          placeholder="Search gyms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredGyms.length === 0 ? (
        <p className="no-content-message">No gyms match your search.</p>
      ) : (
        <div className="gym-grid">
          {filteredGyms.map((gym) => (
            <GymCard key={gym._id} gym={gym} />
          ))}
        </div>
      )}

      <div className="back-to-explore">
        <Link to="/explore" className="button-secondary">
          ← Back to Explore Cities
        </Link>
      </div>
    </div>
  );
};

export default AllGyms;
