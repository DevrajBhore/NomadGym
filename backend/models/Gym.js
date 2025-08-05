// models/Gym.js
import mongoose from "mongoose"

const gymSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    pricePerHour: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    amenities: [
      {
        type: String,
      },
    ],
    imageUrls: {
      type: [String],
      default: [],
    },    
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Fixed: Changed from owner to ownerId to match the backend usage
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // isApproved: {
    //   type: Boolean,
    //   default: false,
    // },
    isActive: {
      type: Boolean,
      default: true,
    },
    razorpayAccountId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Create 2dsphere index for geospatial queries
gymSchema.index({ location: "2dsphere" })

// Index for text search
gymSchema.index({
  name: "text",
  city: "text",
  address: "text",
  description: "text",
})

// Pre-save middleware to set location coordinates
gymSchema.pre("save", function (next) {
  if (this.latitude && this.longitude) {
    this.location = {
      type: "Point",
      coordinates: [Number.parseFloat(this.longitude), Number.parseFloat(this.latitude)],
    }
  }
  next()
})

export default mongoose.model("Gym", gymSchema)
