import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import CartController from "../controllers/CartController.js";

const router = express.Router();

router.get("/", verifyToken, CartController.getCart);
router.post("/", verifyToken, CartController.saveCart);
router.delete("/", verifyToken, CartController.clearCart);

export default router;
