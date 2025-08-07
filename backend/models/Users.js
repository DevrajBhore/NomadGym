// models/Users.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: function () {
        // only required if not logging in with Google
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "gym_owner", "admin"],
      default: "user", // 👈 default is regular user
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
