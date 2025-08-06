// routes/authRoutes.js
import express from "express";
import {
  userRegistration,
  userLogin,
  userPasswordForgot,
  userPasswordReset,
  userVerifyEmail,
  userLogout,
  googleCallbackController,
} from "../controllers/controller.user.js";
import passport from "passport";
import { verifyToken } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

// Step 1: Redirect user to Google
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Google calls this route after login
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
  }),
  googleCallbackController
);
authRouter.post("/register", userRegistration);
authRouter.post("/login", userLogin);
authRouter.get("/check-status", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user })
})
authRouter.post("/forget-password", userPasswordForgot);
authRouter.post("/reset-password/:token", userPasswordReset);
authRouter.get("/verify-email/:token", userVerifyEmail);
authRouter.post("/logout", verifyToken, userLogout);

export default authRouter;
