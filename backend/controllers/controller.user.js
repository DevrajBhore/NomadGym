// controllers/controller.user.js
import User from "../models/Users.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendEmail from "../utils/sendEmail.js";
dotenv.config();

const userRegistration = async (req, res) => {
  try {
    const {
      name,
      password,
      email,
      isVerified = false, // Default to false if not provided
      resetPasswordToken = null, // Default to null if not provided
      resetPasswordExpires = null, // Default to null if not provided
    } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    user = new User({
      name,
      email,
      password: hashPassword,
      isVerified,
      resetPasswordToken,
      resetPasswordExpires,
      verificationToken,
    });

    await user.save();

    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    const emailContent = `
     <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>Email verification</h2>
        <p>Click the button below to veify your email:</p>
        <p>
          <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;" target="_blank">
           veify your Email
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>— NomadGym Support</p>
      </div>
    `;

    await sendEmail(user.email, "Email Verification", emailContent);

    // const { password: _, ...userData } = user._doc;

    return res
      .status(201)
      .json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Include role and _id in the JWT payload
    const payload = {
      userId: user._id,
      role: user.role,         // this is what verifyGymOwner checks
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Send token in secure HTTP-only cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true, // set to true in production with HTTPS
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      })
      .status(200)
      .json({
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};


const userPasswordForgot = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your NomadGym account.</p>
    <p>Click the link below to reset your password:</p>
    <p>
      <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;" target="_blank">
        Reset Password
      </a>
    </p>
    <p>Or copy and paste this URL into your browser:</p>
    <p style="word-break: break-all;"><a href="${resetLink}" target="_blank">${resetLink}</a></p>
    <p>This link will expire in <strong>1 hour</strong>.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>— NomadGym Support</p>
      </div>
    `;

    await sendEmail(user?.email, "Password Reset", emailContent);

    return res.status(200).json({
      message: "Password reset link sent to your email",
      resetToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const userPasswordReset = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res
      .status(200)
      .json({ message: "Password reset successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const userVerifyEmail = async (req, res) => {
  try {
    // const { token } = req.query;
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      isVerified: false,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: "Email verified successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const userLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, // Set to true if using HTTPS
      sameSite: "none",
    });

    res.status(200).json({ message: "LogOut successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export {
  userRegistration,
  userLogin,
  userPasswordForgot,
  userPasswordReset,
  userVerifyEmail,
  userLogout
};
