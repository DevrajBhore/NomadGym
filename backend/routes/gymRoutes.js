import express from "express";
import upload from "../middleware/upload.js";
import {
  getAllGymsPublic,
  addGym,
  getOwnerGyms,
  getBookingsForGym,
  updatePricePerHour,
  getAllCities,
  getCityGymStats,
  getGymsByCity,
  getAmenities,
  getNearbyGyms,
  getAllGyms,
  getGymDetails,
  getGymById,
} from "../controllers/gymController.js";
import { verifyToken, verifyAdmin, verifyGymOwner } from "../middleware/authMiddleware.js";

const router = express.Router();

// ----------------------
// Static routes (no parameters)
// ----------------------
router.get("/all-public", getAllGymsPublic);
router.get("/my-gyms", verifyToken, verifyGymOwner, getOwnerGyms);
router.get("/cities", getAllCities);
router.get("/city-stats", getCityGymStats);
router.get("/amenities", getAmenities);
router.get("/nearby", getNearbyGyms);
router.get("/search", getNearbyGyms);
router.get("/all-gyms", verifyToken, verifyAdmin, getAllGyms);

// ----------------------
// Dynamic routes with specific paths
// ----------------------
// Add gym route (with upload middleware)
router.post("/add", verifyToken, verifyAdmin, upload.array("images", 8), addGym);

// Bookings for specific gym
router.get("/:gymId/bookings", verifyToken, verifyGymOwner, getBookingsForGym);

// Update price for specific gym
router.patch("/:gymId/update-price", verifyToken, verifyGymOwner, updatePricePerHour);

// Gyms by city
router.get("/city/:city", getGymsByCity);

// ----------------------
// ID-based routes
// ----------------------
router.get("/details/:gymId", getGymDetails);
router.get("/by-id/:id", getGymById);
router.get("/:gymId", getGymDetails);

export default router;