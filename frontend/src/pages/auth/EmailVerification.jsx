import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import API from "../../api/axiosConfig"
import "../../styles/AuthForms.css"
import Loader from "../../components/Loader"

const EmailVerification = () => {
  const { token } = useParams()
  const [status, setStatus] = useState("verifying")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await API.get(`/v1/auth/verify-email/${token}`)
        if (response.status === 200) {
          setStatus("success")
          setMessage(response.data.message)
        }
      } catch (err) {
        setStatus("error")
        setMessage(err.response?.data?.message || "Email verification failed.")
      }
    }

    if (token) {
      verifyEmail()
    } else {
      setStatus("error")
      setMessage("No verification token provided.")
    }
  }, [token])

  return (
    <div className="auth-container">
      <div className="verification-card">
        {status === "verifying" && (
          <>
            <Loader />
            <h2>Verifying your email...</h2>
            <p>Please wait, this may take a moment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="icon-success">✓</div>
            <h2>Email Verified!</h2>
            <p className="success-message">{message}</p>
            <Link to="/login" className="login-link-button">
              Go to Login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="icon-error">✗</div>
            <h2>Verification Failed</h2>
            <p className="error-message">{message}</p>
            <Link to="/register" className="register-link-button">
              Try Registering Again
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default EmailVerification
