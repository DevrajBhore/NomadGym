// routes/recurringRoutes.js
import express from "express";
import { setRecurringAvailability, getRecurringAvailability } from "../controllers/recurringAvailabilityController.js";
import { verifyToken, verifyGymOwner } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/set", verifyToken, verifyGymOwner, setRecurringAvailability);

// Route to get recurring availability by gymId and dayOfWeek
router.get("/get/:gymId/:dayOfWeek", verifyToken, verifyGymOwner, getRecurringAvailability)

export default router;
