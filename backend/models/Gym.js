import mongoose from "mongoose";

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },

    pricePerHour: { type: Number, required: true },
    capacity: { type: Number, required: true },

    amenities: [{ type: String }],
    imageUrls: { type: [String], default: [] },

    // ✅ change to Number
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },

    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: { type: Boolean, default: true },
    razorpayAccountId: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ 2dsphere index for geospatial queries
gymSchema.index({ location: "2dsphere" });

// ✅ Text search index
gymSchema.index({
  name: "text",
  city: "text",
  address: "text",
  description: "text",
});

// ✅ Auto-set location before save
gymSchema.pre("save", function (next) {
  if (this.latitude != null && this.longitude != null) {
    this.location = {
      type: "Point",
      coordinates: [this.longitude, this.latitude],
    };
  }
  next();
});

export default mongoose.model("Gym", gymSchema);
