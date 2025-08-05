// routes/gymRoutes.js
import express from "express"
import {
  addGym,
  getOwnerGyms,
  getBookingsForGym,
  updatePricePerHour,
  getAllCities,
  getGymsByCity,
  getCityGymStats,
  getAllGyms,
  getGymDetails,
  getNearbyGyms,
  getGymById,
  getAmenities,
  getAllGymsPublic
} from "../controllers/gymController.js"
import { verifyToken, verifyAdmin, verifyGymOwner } from "../middleware/authMiddleware.js"
import upload from "../middleware/upload.js"

const router = express.Router()

router.get("/all-public", getAllGymsPublic)

// Admin adds a gym
router.post("/add", verifyToken, verifyAdmin, upload.array("images", 8), addGym)

// Gym Owner views their gyms
router.get("/my-gyms", verifyToken, verifyGymOwner, getOwnerGyms)

// Gym Owner views bookings for their specific gym
router.get("/:gymId/bookings", verifyToken, verifyGymOwner, getBookingsForGym)

// Gym Owner updates hourly price
router.patch("/update-price/:gymId", verifyToken, verifyGymOwner, updatePricePerHour)

// Publicly accessible routes
router.get("/cities", getAllCities)
router.get("/city-stats", getCityGymStats)
router.get("/city/:city", getGymsByCity)
router.get("/amenities", getAmenities)

router.get("/nearby", getNearbyGyms)
router.get("/search", getNearbyGyms)

// Admin gets all gyms
router.get("/all-gyms", verifyToken, verifyAdmin, getAllGyms)

// Public gym detail pages (fix route conflicts)
router.get("/details/:gymId", getGymDetails)
router.get("/by-id/:id", getGymById)

// Fix: Add a route to get gym by ID for owner dashboard
router.get("/:gymId", getGymDetails)

export default router
