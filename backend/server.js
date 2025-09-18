// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./utils/passport.js";
import database from "./config/database.js";
import MongoStore from "connect-mongo";

import authRouter from "./routes/authRoutes.js";
import gymRoutes from "./routes/gymRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import "../backend/utils/cleanupOldAvailability.js"; // runs on server start
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 2000;

// --- Middleware ---
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "https://nomadgym.xyz",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging requests in dev mode
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Session & Passport ---
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use("/api/v1/auth", authRouter);
app.use("/api/gyms", gymRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/recurring", recurringRoutes);

// --- Health & Root ---
app.get("/healthz", (req, res) => res.send("ok"));
app.get("/", (req, res) => res.send("NomadGym API is running!"));

// --- Global Error Handler (must be last middleware) ---
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// --- Start Server with DB ---
(async () => {
  try {
    await database();
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // stop server if DB fails
  }
})();
