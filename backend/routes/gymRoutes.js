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

const gymRoutes = express.gymRoutes();

// ----------------------
// Static routes (no parameters)
// ----------------------
gymRoutes.get("/all-public", getAllGymsPublic);
gymRoutes.get("/my-gyms", verifyToken, verifyGymOwner, getOwnerGyms);
gymRoutes.get("/cities", getAllCities);
gymRoutes.get("/city-stats", getCityGymStats);
gymRoutes.get("/amenities", getAmenities);
gymRoutes.get("/nearby", getNearbyGyms);
gymRoutes.get("/search", getNearbyGyms);
gymRoutes.get("/all-gyms", verifyToken, verifyAdmin, getAllGyms);

// ----------------------
// Dynamic routes with specific paths
// ----------------------
// Add gym route (with upload middleware)
gymRoutes.post("/add", verifyToken, verifyAdmin, upload.array("images", 8), addGym);

// Bookings for specific gym
gymRoutes.get("/:gymId/bookings", verifyToken, verifyGymOwner, getBookingsForGym);

// Update price for specific gym
gymRoutes.patch("/:gymId/update-price", verifyToken, verifyGymOwner, updatePricePerHour);

// Gyms by city
gymRoutes.get("/city/:city", getGymsByCity);

// ----------------------
// ID-based routes
// ----------------------
gymRoutes.get("/details/:gymId", getGymDetails);
gymRoutes.get("/by-id/:id", getGymById);
gymRoutes.get("/:gymId", getGymDetails);

export default gymRoutes;