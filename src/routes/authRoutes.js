import express from "express";
import AuthController from "../controllers/AuthController.js";
import {
  verifyToken,
  optionalVerifyToken,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", verifyToken, AuthController.logout);

// Cambia verifyToken por optionalVerifyToken en /check para evitar 401 si no hay token
router.get("/check", optionalVerifyToken, AuthController.checkAuth);

router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
router.post("/validate-reset-token", AuthController.validateResetToken);

export default router;
