// routes/productionRoutes.js
import express from "express";
import ProductionController from "../controllers/ProductionController.js";

const router = express.Router();

// Obtener todos los estados de producción (no se porque no funciona)
router.get("/production/status", ProductionController.getAllStatuses);

// Obtener todas las producciones activas
router.get("/production", ProductionController.getActiveProductions);

// Obtener detalles de una producción específica
router.get("/production/:id", ProductionController.getProductionDetails);

// Crear una nueva producción
router.post("/production", ProductionController.createProduction);

// Agregar un detalle a una producción específica
router.post("/production/:id/add-detail", ProductionController.addProductionDetail);

// Cambiar el estado de una producción específica
router.put("/production/:id/change-status", ProductionController.updateProductionStatus);

// Eliminar un detalle de una producción (borrado lógico)
router.delete("/production/:id/detail/:productId", ProductionController.deleteProductionDetail);

export default router;
