// middleware/authMiddleware.js
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/Users.js"
dotenv.config()

export const verifyToken = async (req, res, next) => {
  try {
    // Accept token from either cookie or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Unauthorized access, token not found" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Token verification failed:", error.message)
    return res.status(403).json({ message: "Forbidden, invalid token", error: error.message })
  }
}

export const verifyGymOwner = (req, res, next) => {
  if (!req.user || req.user.role !== "gym_owner") {
    return res.status(403).json({ message: "Access denied: Gym Owner only" })
  }
  next()
}

export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" })
  }
  next()
}

export const verifyUser = (req, res, next) => {
  if (req.user?.role !== "user") {
    return res.status(403).json({ message: "Access denied: Users only" })
  }
  next()
}
