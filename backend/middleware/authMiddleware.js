// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/Users.js";
dotenv.config();

const getToken = (req) => {
  // Prefer cookie; fall back to Bearer
  if (req.cookies?.token) return req.cookies.token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: "Not authenticated (no token)" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: e.name === "TokenExpiredError" ? "Session expired" : "Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    res.status(500).json({ error: "Auth middleware error" });
  }
};

export const verifyGymOwner = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "gym_owner") return res.status(403).json({ error: "Forbidden: Gym Owner only" });
  next();
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden: Admin only" });
  next();
};

export const verifyUser = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "user") return res.status(403).json({ error: "Forbidden: Users only" });
  next();
};
