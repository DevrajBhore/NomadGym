import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";
import "../styles/Footer.css";
import logo from "/images/logo1.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo">
              <Link to="/">
                <img src={logo} alt="NOMADGYM" />
              </Link>
            </div>
            <p>
              Find and book gyms on demand, anywhere. NomadGym is a platform
              that lets you book gyms by the hour, wherever you are. Whether
              you're traveling. NomadGym connects you
              to verified gyms across India with real-time availability,
              transparent pricing, and an easy booking system.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Company</h4>
              <Link to="/aboutus">About Us</Link>
              <Link to="/partnership">Join Us</Link>
            </div>

            <div className="footer-links-column">
              <h4>Support</h4>
              <Link to="/help">Help Center</Link>
              <Link to="/contactus">Contact Us</Link>
            </div>

            {/* <div className="footer-links-column">
              <h4>Legal</h4>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </div> */}
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} NomadGym. All rights reserved.
          </p>
          <div className="footer-social">
            <a
              href="https://www.instagram.com/nomadgym.xyz?igsh=MW5hMTAwYWlsanJqaQ=="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://x.com/NomadGymm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
