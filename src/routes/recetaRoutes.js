import express from 'express';
import RecetaController from '../controllers/RecetaController.js';
//import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();


//router.use(verifyToken, isAdmin);

router.get('/:id(\\d+)', RecetaController.getRecetas);
router.put('/:id(\\d+)', RecetaController.UpdateRecetas);
router.delete('/:id(\\d+)', RecetaController.DeleteRecetas);
router.post('/:id(\\d+)', RecetaController.AddRecetas); 
export default router;