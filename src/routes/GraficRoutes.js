import express from "express";
import GraficController from "../controllers/GraficController.js";

const router = express.Router();


router.get("/", GraficController.getProductosByPrice);
router.get("/Rating", GraficController.getProductosByRating);
router.get("/state", GraficController.getProductosByState);



export default router;