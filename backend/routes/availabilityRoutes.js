// routes/availabilityRoutes.js
import express from "express"
import {
  setAvailability,
  getAvailability,
  getOwnerGymAvailability, // Import new controller
  getUserGymAvailability, // Import new controller
} from "../controllers/availabilityController.js"
import { verifyToken, verifyGymOwner, verifyAdmin } from "../middleware/authMiddleware.js" // Import verifyAdmin

const router = express.Router()

// Only authenticated gym owners can set availability
router.post("/set", verifyToken, verifyGymOwner, setAvailability)

// Anyone can view gym availability for a specific date
router.get("/get/:gymId", getAvailability)

// Owner gets all availability (date-specific and recurring) for their gym
router.get("/owner/:gymId/all", verifyToken, verifyGymOwner, getOwnerGymAvailability)

// User gets all availability (date-specific and recurring) for a gym (public)
router.get("/user/:gymId/all", getUserGymAvailability)

// New: Admin gets all availability (date-specific and recurring) for any gym
router.get("/admin/:gymId/all", verifyToken, verifyAdmin, getOwnerGymAvailability) // Reusing owner controller with admin middleware

export default router
