import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import API from "../../api/axiosConfig"
import "../../styles/AuthForms.css"

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      const response = await API.post(`/v1/auth/reset-password/${token}`, { password })
      if (response.status === 200) {
        setMessage(response.data.message)
        setTimeout(() => navigate("/login"), 3000)
      }
    } catch (err) {
      console.error("Reset password error:", err.response?.data || err.message)
      setError(err.response?.data?.message || "Failed to reset password. Invalid or expired token.")
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form reset-password-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <div className="form-group">
          <label htmlFor="password">New Password:</label>
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
          <label htmlFor="confirmPassword">Confirm New Password:</label>
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
          Reset Password
        </button>
        <p className="form-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </div>
  )
}

export default ResetPassword
