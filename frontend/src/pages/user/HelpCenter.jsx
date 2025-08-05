// user/HelpCenter.jsx
import { User, Dumbbell } from "lucide-react"
import "../../styles/HelpCenter.css";

const HelpCenter = () => {
  return (
    <div className="help-container">
      <h1>Help Center</h1>
      <p className="intro-text">
        Need assistance? You’re in the right place. Whether you’re a user or a gym owner,
        we’re here to help you make the most of NomadGym.
      </p>

      <section className="faq-section">
        <h2><User size={30} /> For Users</h2>
        <div className="faq-item">
          <h3>How do I book a gym?</h3>
          <p>
            Just head to the Explore section or Find Nearby Gym , find a gym near you, pick a time slot, and complete the booking with payment. No membership needed.
          </p>
        </div>
        <div className="faq-item">
          <h3>Do I need an account?</h3>
          <p>
            Yes, you’ll need to sign in with your email or Google to make bookings and view your history.
          </p>
        </div>
        <div className="faq-item">
          <h3>Can I cancel or reschedule my booking?</h3>
          <p>
            Cancellations are allowed before your time slot begins. Refund policies vary by gym—please read each gym’s terms before booking.
          </p>
        </div>
        <div className="faq-item">
          <h3>Is there any joining fee?</h3>
          <p>Nope. You only pay for what you use.</p>
        </div>
      </section>

      <section className="faq-section">
        <h2><Dumbbell size={30} /> For Gym Owners</h2>
        <div className="faq-item">
          <h3>How do I list my gym?</h3>
          <p>
            Fill out the onboarding form from <strong>Join Us</strong> section. We'll reach out within 48 hours to get you set up.
          </p>
        </div>
        <div className="faq-item">
          <h3>Is there a platform fee?</h3>
          <p>
            We take a small commission per booking. There are no fixed costs or subscriptions for gym partners.
          </p>
        </div>
        <div className="faq-item">
          <h3>How do I receive payments?</h3>
          <p>
            You'll get pay right after the booking, the user directly pays you for the gym.
          </p>
        </div>
        <div className="faq-item">
          <h3>Can I update my gym’s availability?</h3>
          <p>
            Yes, you can request availability updates anytime via your admin dashboard or by contacting our support.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
