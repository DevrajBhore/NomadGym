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
  getAdminGymAvailability,
} from "../controllers/gymController.js";
import { verifyToken, verifyAdmin, verifyGymOwner } from "../middleware/authMiddleware.js";

const gymRoutes = express.Router();

// Correct route order:
gymRoutes.post("/add", verifyToken, verifyAdmin, upload.array("images", 8), addGym); // This FIRST

// Then add this to prevent GET /add conflicts
// gymRoutes.get("/add", (req, res) => res.status(405).send("Use POST method"));

// ----------------------
// Static routes (no parameters)
// ----------------------
gymRoutes.get("/all-public", getAllGymsPublic);
gymRoutes.get("/my-gyms", verifyToken, verifyGymOwner, getOwnerGyms);
gymRoutes.get("/cities", getAllCities);
gymRoutes.get("/city-stats", getCityGymStats);
gymRoutes.get("/amenities", getAmenities);
gymRoutes.get("/nearby", getNearbyGyms);
gymRoutes.get("/all-gyms", verifyToken, verifyAdmin, getAllGyms);

// ----------------------
// Dynamic routes with specific paths
// ----------------------
// Add gym route (with upload middleware)
// gymRoutes.post("/add", verifyToken, verifyAdmin, upload.array("images", 8), addGym);

// Bookings for specific gym
gymRoutes.get("/:gymId/bookings", verifyToken, verifyGymOwner, getBookingsForGym);

// Update price for specific gym
gymRoutes.patch("/:gymId/update-price", verifyToken, verifyGymOwner, updatePricePerHour);

// Gyms by city
gymRoutes.get("/city/:city", getGymsByCity);

// ----------------------
// Gym details by ID (single route)
// ----------------------
gymRoutes.get("/:gymId", getGymDetails);
gymRoutes.get("/availability/admin/:gymId/all", verifyToken, verifyAdmin, getAdminGymAvailability);

export default gymRoutes;