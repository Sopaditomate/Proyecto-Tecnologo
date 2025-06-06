import express from "express"
import orderController from "../controllers/OrderController.js" //se corrigio la ruta
import { verifyToken, isClient } from "../middleware/authMiddleware.js"

const router = express.Router()

// Todas las rutas requieren autenticación y rol de cliente
router.use(verifyToken, isClient)

router.post("/", orderController.createOrder)
router.get("/", orderController.getClientOrders)
router.get("/:id", orderController.getOrderDetails)

export default router
