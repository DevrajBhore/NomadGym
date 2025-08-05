// models/RecurringAvailability.js
import mongoose from "mongoose";

const recurringAvailabilitySchema = new mongoose.Schema(
  {
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    dayOfWeek: {
      type: String, // e.g., "Monday"
      required: true,
    },
    startTime: {
      type: String, // e.g., "05:00 AM"
      required: true,
    },
    endTime: {
      type: String, // e.g., "10:00 PM"
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RecurringAvailability", recurringAvailabilitySchema);
