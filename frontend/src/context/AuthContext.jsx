import { createContext, useState, useContext, useEffect } from "react"
import API from "../api/axiosConfig"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function to check if user is authenticated (e.g., by verifying token)
  const checkAuth = async () => {
    try {
      // In a real app, you might have a /me endpoint or similar
      // For now, we'll assume if a token exists in cookies, user is logged in
      // The backend's verifyToken middleware will handle actual token validation
      const response = await API.get("/v1/auth/check-status") // A new endpoint we'll add to backend
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

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await API.post("/v1/auth/login", { email, password } , {withCredentials: true })
      if (response.status === 200) {
        // Assuming the backend returns user data upon successful login
        // For simplicity, we'll just set a placeholder user or refetch
        await checkAuth() // Re-check auth status to get user data
        return { success: true, message: response.data.message }
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message)
      return { success: false, message: error.response?.data?.message || "Login failed" }
    }
  }

  const logout = async () => {
    try {
      await API.post("/v1/auth/logout")
      setUser(null)
      return { success: true, message: "Logged out successfully" }
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message)
      return { success: false, message: error.response?.data?.message || "Logout failed" }
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
