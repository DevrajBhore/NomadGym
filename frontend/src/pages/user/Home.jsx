// user/ Home.jsx
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect} from "react";
import {
  Zap,
  Globe,
  Smartphone,
  MapPin,
  HandCoins,
  ShieldCheck,
} from "lucide-react";
import FeaturesSection from "../../components/FeaturesSection.jsx"
import "../../styles/Home.css";

const heroImages = [
  "/images/hero4.png",
  "/images/hero1.avif",
  "/images/hero2.png",
  "/images/hero3.png",
];

const Home = () => {
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
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Fitness that moves with you</h1>
          <p>
            Anytime, anywhere, just hit and quit. Pay per hour, stay strong,
            stay fit. This is fitness on your terms.
          </p>

          {/* Add search bar */}
          {user?.role === "user" && (
            <div className="hero-search">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search gyms or cities..."
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

      <FeaturesSection />

      <section id="contact" className="contact section">
        <div className="container">
          <div className="contact-content">
            <h2 className="contact-title">Contact Us</h2>
            <a href="tel:+91 9372981202" className="contact-phone">
              +91 9372981202
            </a>
          </div>
        </div>
      </section>

      <section className="cta-sectionn">
        <div className="cta-contentt">
          <h2 id="h22">Ready to get started?</h2>
          <p>
            Join thousands of fitness enthusiasts finding their perfect workout
            spot with NomadGym.
          </p>
          {user?.role === "user" && (
            <Link to="/explore" className="cta-button">
              Find a Gym Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
