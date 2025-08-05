// controllers/bookingController.js
import Booking from "../models/Booking.js";
import Gym from "../models/Gym.js";
import GymAvailability from "../models/GymAvailability.js";
import moment from "moment";
import razorpay from "../utils/razorpay.js";
import crypto from "crypto";

// Step 1: Initiate booking and Razorpay order
export const initiateBooking = async (req, res) => {
  try {
    const { gymId, bookingDate, timeSlot } = req.body;
    const userId = req.user.id;

    const now = moment();
    const today = now.clone().startOf("day");
    const lastAllowedDate = now.clone().add(2, "days").endOf("day");
    const bookingMoment = moment(bookingDate, "YYYY-MM-DD");

    if (!bookingMoment.isValid()) {
      return res.status(400).json({ error: "Invalid booking date format" });
    }

    if (!bookingMoment.isBetween(today, lastAllowedDate, undefined, "[]")) {
      return res.status(400).json({
        error: "Booking allowed for today and next 2 days only",
      });
    }

    if (bookingMoment.isSame(today, "day")) {
      const timeMoment = moment(timeSlot, ["h:mm A", "hh:mm A"]);
      if (!timeMoment.isValid()) {
        return res.status(400).json({ error: "Invalid time format" });
      }
      const nowTime = now.clone().startOf("minute");
      if (timeMoment.isBefore(nowTime)) {
        return res
          .status(400)
          .json({ error: "Cannot book past time slot today" });
      }
    }

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    const availability = await GymAvailability.findOne({
      gym: gymId,
      date: bookingDate,
    });
    if (!availability) {
      return res
        .status(404)
        .json({ error: "No availability for selected date" });
    }

    const normalize = (s) =>
      moment(s.trim(), ["h:mm A", "hh:mm A"]).format("hh:mm A");
    const slotMatch = availability.availableSlots.some(
      (slot) => normalize(slot) === normalize(timeSlot)
    );
    if (!slotMatch) {
      return res
        .status(400)
        .json({ error: "Selected slot is not available for this day" });
    }

    const amount = gym.pricePerHour || 500;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.status(200).json({
      message: "Booking initiated",
      order,
      tempBookingDetails: {
        userId,
        gymId: gym._id,
        date: bookingDate,
        timeSlot,
        amount,
      },
    });
  } catch (error) {
    console.error("Initiate Booking Error:", error.message);
    res.status(500).json({ error: "Failed to initiate booking" });
  }
};

// Step 2: Confirm payment and finalize booking
export const verifyBookingPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("gym");
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Bypass Razorpay signature check in test/dev
    const isLocalDev = process.env.NODE_ENV === "development" || process.env.TEST_MODE === "true";

    if (!isLocalDev) {
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ error: "Invalid Razorpay signature" });
      }
    } else {
      console.log("Running in TEST MODE. Skipping Razorpay signature verification.");
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const startMoment = moment(`${booking.date} ${booking.timeSlot}`, "YYYY-MM-DD hh:mm A");
    const expiryTime = moment(startMoment).add(1, "hour");

    booking.razorpayPaymentId = razorpay_payment_id || "test_payment_id";
    booking.otp = otp;
    booking.otpExpiry = expiryTime.toDate();
    booking.isVerified = false;
    booking.isPaid = true;

    // ⚠️ Skip actual Razorpay transfer in test
    if (!isLocalDev && booking.gym.razorpayAccountId) {
      const platformFee = Math.round(booking.amount * 0.30);
      const gymShare = booking.amount - platformFee;

      await razorpay.transfers.create({
        account: booking.gym.razorpayAccountId,
        amount: gymShare * 100,
        currency: "INR",
        notes: { bookingId: booking._id.toString() },
      });
    }

    await booking.save();

    res.status(200).json({
      message: isLocalDev ? "Test payment simulated & OTP generated" : "Booking confirmed",
      booking,
      otp: isLocalDev ? otp : undefined,
    });
  } catch (error) {
    console.error("Payment verification error:", error.message);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};


export const getBookingsByUser = async (req, res) => {
  try {
    console.log("User ID:", req.user._id); // Debug log

    const bookings = await Booking.find({ user: req.user._id })
      .populate("gym", "name city address") // Populate gym details
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log("Found bookings:", bookings.length); // Debug log

    res.status(200).json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error("Error in getBookingsByUser:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("gym", "name city");
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all bookings" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findByIdAndDelete(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error during cancellation" });
  }
};

export const verifyOtpBooking = async (req, res) => {
  try {
    const { bookingId, otp } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.isVerified)
      return res.status(400).json({ error: "OTP already verified" });
    if (booking.otpExpiry < new Date())
      return res.status(400).json({ error: "OTP expired" });
    if (booking.otp !== Number(otp))
      return res.status(400).json({ error: "Invalid OTP" });

    booking.isVerified = true;
    await booking.save();

    res.status(200).json({ message: "Booking verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// gym owner gets its gym bookings
export const getBookingsByGym = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Correct field is ownerId, not owner
    const gyms = await Gym.find({ ownerId }).select("_id");

    if (!gyms || gyms.length === 0) {
      return res.status(404).json({ message: "No gyms found for this owner" });
    }

    const gymIds = gyms.map((g) => g._id);

    const bookings = await Booking.find({ gym: { $in: gymIds } })
      .populate("user", "name email")
      .populate("gym", "name city address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error("Error in getBookingsByGym:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};
