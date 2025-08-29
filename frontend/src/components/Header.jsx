// components/Headers.jsx
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Home.css";

const heroImages = [
  "/images/hero4.png",
  "/images/hero1.avif",
  "/images/hero3.png",
  "/images/hero2.png",
];

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigate(`/explore?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <header className="hero-section">
      <div className="hero-content">
        <h1>Fitness that moves with you</h1>
        <p>
          Anytime, anywhere, just hit and quit. Pay per hour, stay strong, stay
          fit. This is fitness on your terms.
        </p>

        {/* Add search bar */}
        {user?.role === "user" && (
          <div className="hero-search">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search gyms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>
        )}

        {!user && (
          <div className="hero-actions">
            <Link to="/register" className="hero-button primary">
              Get Started
            </Link>
            <Link to="/login" className="hero-button secondary">
              Log In
            </Link>
          </div>
        )}
        {user && (
          <div className="hero-actions">
            <p className="welcome-message">Welcome back, {user.name}!</p>
            {user.role === "user" && (
              <Link to="/explore" className="hero-button primary">
                Explore
              </Link>
            )}
            {user.role === "gym_owner" && (
              <Link to="/owner/dashboard" className="hero-button owner">
                Go to Dashboard
              </Link>
            )}
            {user.role === "admin" && (
              <Link to="/admin/dashboard" className="hero-button admin">
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
      <img
        src={heroImages[currentIndex]}
        alt="Modern gym with equipment"
        className="hero-background-image"
        loading="lazy"
      />
      <div className="hero-overlay"></div>
    </header>
  );
};

export default Header;
