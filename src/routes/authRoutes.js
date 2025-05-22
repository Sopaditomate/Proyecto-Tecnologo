import express from "express";
import authController from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/check", verifyToken, authController.checkAuth);

export default router;
