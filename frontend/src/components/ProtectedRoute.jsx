// components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Loader from "./Loader"

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
