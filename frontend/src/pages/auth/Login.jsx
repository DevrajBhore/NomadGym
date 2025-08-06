import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AuthForms.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const { success, message } = await login(email, password);
    if (success) {
      setSuccessMessage(message);
      navigate("/");
    } else {
      setError(message);
    }
  };

  const handleGoogleLogin = () => {
    const api = import.meta.env.VITE_URL_API;
    window.open(`${api}/v1/auth/google`, "_self");
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login to NomadGym</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-base"
          />
        </div>

        <button type="submit" className="button-primary auth-button">
          Login
        </button>

        {/* Google Login Button */}
        <div className="google-login-wrapper">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="google-login-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 48 48"
              style={{ marginRight: "8px" }}
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.37 0 5.6 1.46 6.89 2.68l5.06-4.91C32.65 4.05 28.74 2 24 2 14.81 2 7.37 8.09 4.74 16h6.92c1.41-4.01 5.22-6.5 9.44-6.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24.5c0-1.63-.14-2.82-.44-4.06H24v7.68h12.84c-.26 1.71-1.65 4.3-4.76 6.04l7.3 5.68c4.23-3.9 6.12-9.66 6.12-15.34z"
              />
              <path
                fill="#FBBC05"
                d="M10.15 28.62C9.39 26.72 9 24.66 9 22.5s.39-4.22 1.15-6.12L2.74 11.1C1.08 14.38 0 18.26 0 22.5s1.08 8.12 2.74 11.4l7.41-5.28z"
              />
              <path
                fill="#34A853"
                d="M24 44c5.84 0 10.74-1.93 14.33-5.26l-7.3-5.68c-2.02 1.36-4.72 2.17-7.03 2.17-4.22 0-8.03-2.49-9.44-6.5h-6.92c2.63 7.91 10.07 14 19.36 14z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="form-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p className="form-footer">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
