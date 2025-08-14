// routes/gymRoutes.js
import express from "express";
import upload from "../middleware/upload.js"; // adjust if your upload middleware path differs
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
import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyAdmin, verifyGymOwner } from "../middleware/roleMiddleware.js"; // adjust if combined elsewhere

const router = express.Router();

// ----------------------
// Static & specific routes (NO params)
// ----------------------
router.get("/all-public", getAllGymsPublic);
router.post("/add", verifyToken, verifyGymOwner, upload.array("images", 8), addGym);

// Optional guard so accidental GET /add doesn't fall into :gymId
router.get("/add", (_req, res) =>
  res.status(405).json({ success: false, error: "METHOD_NOT_ALLOWED", message: "Use POST /api/gyms/add" })
);

router.get("/my-gyms", verifyToken, verifyGymOwner, getOwnerGyms);
router.get("/cities", getAllCities);
router.get("/city-stats", getCityGymStats);
router.get("/amenities", getAmenities);
router.get("/nearby", getNearbyGyms);
router.get("/search", getNearbyGyms); // if this is truly the same handler by design

// Admin-only list of all gyms
router.get("/all-gyms", verifyToken, verifyAdmin, getAllGyms);

// Bookings for a specific gym (must come BEFORE generic :gymId)
router.get("/:gymId([0-9a-fA-F]{24})/bookings", verifyToken, verifyGymOwner, getBookingsForGym);

// Update price by gym (specific, still param — keep before generic catch-alls)
router.patch("/update-price/:gymId([0-9a-fA-F]{24})", verifyToken, verifyGymOwner, updatePricePerHour);

// City-specific listing (named param that is NOT an ObjectId — keep before :gymId)
router.get("/city/:city", getGymsByCity);

// ----------------------
// ID-based routes (param constrained to 24-hex ObjectId)
// ----------------------
router.get("/details/:gymId([0-9a-fA-F]{24})", getGymDetails);
router.get("/by-id/:id([0-9a-fA-F]{24})", getGymById);

// Final generic ID route (leave LAST)
router.get("/:gymId([0-9a-fA-F]{24})", getGymDetails);

export default router;
