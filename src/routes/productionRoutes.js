// routes/productionRoutes.js
import express from "express";
import ProductionController from "../controllers/ProductionController.js";

const router = express.Router();

// Obtener todos los estados de producción (no se porque no funciona)
router.get("/production/status", ProductionController.getAllStatuses);

// Obtener todas las producciones activas
router.get("/production", ProductionController.getActiveProductions);

// Obtener productos que tienen receta
router.get("/production/recipe", ProductionController.getProductsWithRecipe);

// Obtener detalles de una producción específica
router.get("/production/:id", ProductionController.getProductionDetails);

router.get(
  "/production/max-production/:productId",
  ProductionController.getMaxProduction
);

// Crear una nueva producción
router.post("/production", ProductionController.createProduction);

// Agregar un detalle a una producción específica
router.post(
  "/production/:id/add-detail",
  ProductionController.addProductionDetail
);

//faltan ids o no se como probarlo
router.post("/production/validate", ProductionController.validateProduction);

// Cambiar el estado de una producción específica
router.put(
  "/production/:id/change-status",
  ProductionController.updateProductionStatus
);

// Eliminar un detalle de una producción (borrado lógico)
router.delete(
  "/production/:id/detail/:productId",
  ProductionController.deleteProductionDetail
);

// Borrar una producción (lógico)
router.delete("/production/:id", ProductionController.deleteProduction);

export default router;
