// models/GymAvailability.js
import mongoose from "mongoose";

const gymAvailabilitySchema = new mongoose.Schema(
  {
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    date: {
      type: String, // e.g., "2025-07-18"
      required: true,
    },
    availableSlots: [
      {
        type: String, // e.g., "09:00-10:00"
        required: true,
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.model("GymAvailability", gymAvailabilitySchema);
