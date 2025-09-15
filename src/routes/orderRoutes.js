import express from "express";
import OrderController from "../controllers/OrderController.js";
import { verifyToken, isClient } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación y rol de cliente
router.use(verifyToken, isClient);

router.post("/", OrderController.createOrder);
router.get("/", OrderController.getClientOrders);
router.get("/:id", OrderController.getOrderDetails);

export default router;
