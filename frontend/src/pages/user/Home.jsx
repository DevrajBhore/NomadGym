// user/ Home.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx"
import FeaturesSection from "../../components/FeaturesSection.jsx";
import Contact from "../../components/Contact.jsx";
import Header from "../../components/Header.jsx";
import "../../styles/Home.css";


const Home = () => {

  const { user } = useAuth();

  return (
    <div className="home-container">
      
      <Header />

      <FeaturesSection />

      <Contact />

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
