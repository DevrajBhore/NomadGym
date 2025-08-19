// context/AuthContext.js
import { createContext, useState, useContext, useEffect } from "react"
import API from "../api/axiosConfig"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check auth status (via cookie-based token)
  const checkAuth = async () => {
    try {
      const response = await API.get("/v1/auth/check-status", {
        withCredentials: true, // 🔥 Required for secure cookies
      })
      if (response.status === 200 && response.data.user) {
        setUser(response.data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
  await checkAuth()
}

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await API.post(
        "/v1/auth/login",
        { email, password },
        { withCredentials: true }
      )
      if (response.status === 200) {
        await checkAuth() // Refresh user info
        return { success: true, message: response.data.message }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  }

  const logout = async () => {
    try {
      await API.post("/v1/auth/logout", {}, { withCredentials: true })
      setUser(null)
      return { success: true, message: "Logged out successfully" }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Logout failed",
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, refreshUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext)
}
