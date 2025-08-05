// user/ContactUs.jsx
import { Phone, Mail, MessageCircleMore } from "lucide-react";
import "../../styles/ContactUs.css";

const ContactUs = () => {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p className="contact-intro">
        Need help or want to get in touch? We're here to support you.
      </p>

      <div className="contact-details">
        <p>
          <Mail size={28} /> Email us:{" "}
          <a href="mailto:nomadgym95@gmail.com">nomadgym95@gmail.com</a>
        </p>
        <p>
          <Phone size={28} /> Call us:{" "}
          <a href="tel:+91 9372981202">+91 9372981202</a>
        </p>
        <p>
          <MessageCircleMore size={28} /> WhatsApp:{" "}
          <a
            href="https://wa.me/919372981202?text=Hi%20NomadGym%2C%20I%27m%20interested%20in%20partnering."
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat Now
          </a>
        </p>
        <p className="note-text">(Available Mon-Sat, 10 AM to 6 PM IST)</p>
      </div>
    </div>
  );
};

export default ContactUs;
