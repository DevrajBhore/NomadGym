// components/FeaturesSection.jsx
import "../styles/Home.css";
import {
  Zap,
  Globe,
  Smartphone,
  MapPin,
  HandCoins,
  ShieldCheck,
} from "lucide-react";

const FeaturesSection = ()=> {
    return(
        <section className="features-section">
        <h2>How NomadGym Works</h2>
        <div className="feature-grid">
          <div className="feature-item feature-1">
            <div className="feature-content">
              <div className="feature-icon">
                <MapPin size={24} color="#276EF1" />
              </div>
              <h3>Find Nearby Gyms</h3>
              <p>Discover gyms around you using our location-based search...</p>
            </div>
          </div>

          <div className="feature-item feature-2">
            {" "}
            <div className="feature-content">
              <div className="feature-icon">
                <Zap size={24} color="#276EF1" />
              </div>
              <h3>Instant Booking</h3>
              <p>Reserve a gym instantly with just a few taps...</p>
            </div>
          </div>

          <div className="feature-item feature-3">
            {" "}
            <div className="feature-content">
              <div className="feature-icon">
                <Smartphone size={24} color="#276EF1" />
              </div>
              <h3>Easy Check-In</h3>
              <p>No cards or paperwork needed. Use your phone...</p>
            </div>
          </div>

          <div className="feature-item feature-4">
            {" "}
            <div className="feature-content">
              <div className="feature-icon">
                <Globe size={24} color="#276EF1" />
              </div>
              <h3>Multi-City Access</h3>
              <p>Book gyms in any supported city...</p>
            </div>
          </div>

          <div className="feature-item feature-5">
            <div className="feature-content">
              <div className="feature-icon">
                <HandCoins size={24} color="#276EF1" />
                <h3>No Subscriptions</h3>
                <p>Pay only when you work out...</p>
              </div>
            </div>
          </div>

          <div className="feature-item feature-6">
            <div className="feature-content">
              <div className="feature-icon">
                <ShieldCheck size={24} color="#276EF1" />
              </div>
              <h3>Verified Gyms</h3>
              <p>Every gym on our platform is verified...</p>
            </div>
          </div>
        </div>
      </section>
    )
}

export default FeaturesSection