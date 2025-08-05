import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API from "../../api/axiosConfig"
import "../../styles/AuthForms.css"

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      const response = await API.post("/v1/auth/register", { name, email, password })
      if (response.status === 201) {
        setSuccessMessage("Registration successful! Please check your email to verify your account.")
        setTimeout(() => navigate("/login"), 3000)
      }
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message)
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register for NomadGym</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-base"
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input-base"
          />
        </div>
        <button type="submit" className="button-primary auth-button">
          Register
        </button>
        <p className="form-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
