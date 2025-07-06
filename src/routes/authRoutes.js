import express from "express";
import authController from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/check", verifyToken, authController.checkAuth);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/validate-reset-token", authController.validateResetToken); 

export default router;
