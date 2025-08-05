import { useState } from "react"
import { Link } from "react-router-dom"
import API from "../../api/axiosConfig"
import "../../styles/AuthForms.css"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")

    if (!email) {
      setError("Please enter your email address.")
      return
    }

    try {
      const response = await API.post("/v1/auth/forget-password", { email })
      if (response.status === 200) {
        setMessage(response.data.message)
      }
    } catch (err) {
      console.error("Forgot password error:", err.response?.data || err.message)
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.")
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form forgot-password-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
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
        <button type="submit" className="button-primary auth-button">
          Send Reset Link
        </button>
        <p className="form-footer">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default ForgotPassword
