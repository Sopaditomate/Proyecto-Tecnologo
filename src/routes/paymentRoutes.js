import express from "express"
import PaymentController from "../controllers/PaymentController.js"
import { verifyToken } from "../middleware/authMiddleware.js"

const router = express.Router()

// Rutas protegidas (requieren autenticación)
router.post("/nequi/initiate", verifyToken, PaymentController.initiateNequiPayment)
router.get("/nequi/qr/:orderId", verifyToken, PaymentController.generateNequiQR)
router.get("/nequi/status/:transactionId", verifyToken, PaymentController.checkPaymentStatus)

// Webhook para recibir notificaciones de Nequi (no requiere autenticación)
router.post("/nequi/callback", PaymentController.handleNequiCallback)

export default router
