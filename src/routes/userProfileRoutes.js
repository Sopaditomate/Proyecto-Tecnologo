import express from "express";
import * as UserProfileController from "../controllers/UserProfileController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { changePassword } from "../controllers/UserProfileController.js";

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.post(
  "/verify-email/confirm",
  UserProfileController.confirmEmailVerification
);

//de momento dejare mi ruta aqui, aunque despues habra que ver como utilizar la autenticacion:
router.get("/info", UserProfileController.getUsersInfo);

router.put("/state/:id(\\d+)", UserProfileController.updateUserState);

// Rutas protegidas (requieren autenticación)
router.use(verifyToken);

router.get("/profile", UserProfileController.getProfile);
router.put("/profile", UserProfileController.updateProfile);

// Cambiar contraseña
router.post("/change-password", changePassword);

// Rutas de verificación de teléfono
router.post("/verify-phone/send", UserProfileController.sendPhoneVerification);
router.post(
  "/verify-phone/confirm",
  UserProfileController.confirmPhoneVerification
);

// Rutas de verificación de email
router.post("/verify-email/send", UserProfileController.sendEmailVerification);

// Ruta para obtener pedidos
router.get("/orders", UserProfileController.getUserOrders);

export default router;
