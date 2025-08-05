import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "../../styles/AuthForms.css" 

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }

    const { success, message } = await login(email, password)
    if (success) {
      setSuccessMessage(message)
      navigate("/")
    } else {
      setError(message)
    }
  }

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
        <p className="form-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p className="form-footer">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
