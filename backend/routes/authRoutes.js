// routes/authRoutes.js
import express from "express";
import {
  userRegistration,
  userLogin,
  userPasswordForgot,
  userPasswordReset,
  userVerifyEmail,
  userLogout,
} from "../controllers/controller.user.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

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
