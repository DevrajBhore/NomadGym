// routes/bookingRoutes.js
import express from "express";
import {
  initiateBooking,
  verifyBookingPayment,
  getBookingsByUser,
  getAllBookings,
  cancelBooking,
  verifyOtpBooking,
  getBookingsByGym,
} from "../controllers/bookingController.js";

import {
  verifyToken,
  verifyAdmin,
  verifyGymOwner,
} from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();
// verifyToken
// Initiate Razorpay Order & booking slot reservation
bookingRouter.post("/initiate", verifyToken, initiateBooking);

// Verify Razorpay Payment & finalize booking + payout
bookingRouter.post("/confirm", verifyToken, verifyBookingPayment);

// User's own bookings
bookingRouter.get("/my-bookings", verifyToken, getBookingsByUser);

// Admin can see all
bookingRouter.get("/all", verifyToken, verifyAdmin, getAllBookings);

// owner can see bookings for their gyms
bookingRouter.get("/all-bookings", verifyToken, verifyGymOwner, getBookingsByGym)

// Cancel a booking
bookingRouter.delete("/:id", verifyToken, cancelBooking);

// OTP Verification by Gym Owner
bookingRouter.post(
  "/verify-booking-otp",
  verifyToken,
  verifyGymOwner,
  verifyOtpBooking
);

export default bookingRouter;
