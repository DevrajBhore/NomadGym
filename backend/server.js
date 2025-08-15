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
import "../backend/utils/cleanupOldAvailability.js";

const app = express();
const PORT = process.env.PORT || 2000; 

app.use(cors({
  origin: [
    process.env.CLIENT_URL || "https://nomadgym.xyz",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
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
