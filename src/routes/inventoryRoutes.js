import express from 'express';
import InventoryController from '../controllers/InventoryController.js';
//import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
//router.use(verifyToken, isAdmin);

// Obtener información del inventario
router.get('/', InventoryController.getInventario);
router.get('/tipos', InventoryController.getTiposMateria);
router.get('/unidades', InventoryController.getUnidades);
router.get("/historial", InventoryController.getHistorialInventario);
router.get("/resumen", InventoryController.getResumenInventario);

// Operaciones CRUD
router.post("/nuevo", InventoryController.agregarNuevoInsumo);
router.put('/:id(\\d+)', InventoryController.updateCantidad);
router.put('/materia/:id(\\d+)', InventoryController.updateMateriaPrimaPorInventario);
router.delete('/:id(\\d+)', InventoryController.deleteInventario);

export default router;