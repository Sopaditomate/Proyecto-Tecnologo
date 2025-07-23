//recetaRoutes.js
import express from 'express';
import RecetaController from '../controllers/RecetaController.js';
//import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();


//router.use(verifyToken, isAdmin);

router.get('/:id(\\d+)', RecetaController.getRecetas);
router.get('/materia/:id(\\d+)', RecetaController.getMaterias);

router.post('/:id_product(\\d+)/:id_material(\\d+)', RecetaController.AddRecetas); 
router.put('/:id_product(\\d+)/:id_material(\\d+)', RecetaController.UpdateRecetas);
router.delete('/:id_product(\\d+)/:id_material(\\d+)', RecetaController.DeleteRecetas); 

export default router;