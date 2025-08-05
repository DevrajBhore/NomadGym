// server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import database from "./config/database.js";
import authRouter from "./routes/authRoutes.js";
import gymRoutes from "./routes/gymRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import "../backend/utils/cleanupOldAvailability.js";
dotenv.config();

import cors from "cors";

const allowedOrigins = ["http://localhost:5173", "https://nomadgym.xyz"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // important if you're using cookies or sessions
  })
);
const app = express();
const PORT = process.env.PORT || 2000; // Changed to match your frontend config

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/gyms", gymRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/recurring", recurringRoutes);

app.get("/healthz", (req, res) => res.send("ok"));

app.get("/", (req, res) => {
  res.send(" NomadGym API is running!");
});

app.listen(PORT, async () => {
  await database();
  console.log(`Server running at http://localhost:${PORT}`);
});
