// components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import "../styles/Navbar.css";
import logo from "/images/logo1.png"

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    const { success, message } = await logout();
    if (success) {
      alert(message);
      navigate("/login");
      setShowMobileMenu(false);
    } else {
      alert(message);
    }
  };

  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);
  const closeMobileMenu = () => setShowMobileMenu(false);

  return (
    <nav className="navbar">
      <div className="brand">
        <Link to="/" onClick={closeMobileMenu}>
          {/* <h1 className="brand-name">NOMAD GYM</h1> */}
          <img src={logo} alt="logo" />
        </Link>
      </div>

      <button
        className={`hamburger-menu ${showMobileMenu ? "open" : ""}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      <ul className={`navbar-links ${showMobileMenu ? "active" : ""}`}>
        {!user && (
          <>
            <li>
              <Link to="/login" onClick={closeMobileMenu}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" onClick={closeMobileMenu}>
                Register
              </Link>
            </li>
          </>
        )}

        {user?.role === "user" && (
          <>
            {/* <li>
              <Link to="/" onClick={closeMobileMenu}>
                Home
              </Link>
            </li> */}
            <li>
              <Link to="/explore" onClick={closeMobileMenu}>
                Explore
              </Link>
            </li>
            <li>
              <Link to="/find-gyms" onClick={closeMobileMenu}>
                Find Nearby Gyms
              </Link>
            </li>
            {/* <li>
              <Link to="/search" onClick={closeMobileMenu}>
                Search
              </Link>
            </li> */}
            <li>
              <Link to="/my-bookings" onClick={closeMobileMenu}>
                My Bookings
              </Link>
            </li>
          </>
        )}

        {user?.role === "gym_owner" && (
          <>
            {/* <li>
              <Link to="/" onClick={closeMobileMenu}>
                Home
              </Link>
            </li> */}
            <li>
              <Link to="/owner/dashboard" onClick={closeMobileMenu}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/owner/verify-booking" onClick={closeMobileMenu}>
                Verify Bookings
              </Link>
            </li>
            <li>
              <Link to="/owner/bookings" onClick={closeMobileMenu}>
                View All Bookings
              </Link>
            </li>
          </>
        )}

        {user?.role === "admin" && (
          <>
            {/* <li>
              <Link to="/" onClick={closeMobileMenu}>
                Home
              </Link>
            </li> */}
            <li>
              <Link to="/admin/dashboard" onClick={closeMobileMenu}>
                Admin Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/add-gym" onClick={closeMobileMenu}>
                Add Gym
              </Link>
            </li>
          </>
        )}

        {user && (
          <li>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </li>
        )}
      </ul>

      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
};

export default Navbar;
