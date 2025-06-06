import express from 'express';
import ProductAdminController from '../controllers/ProductAdminController.js';
//import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();


//router.use(verifyToken, isAdmin);

router.get('/', ProductAdminController.getProductos);
router.put('/:id(\\d+)', ProductAdminController.UpdateProductos);
router.delete('/product/:id(\\d+)', ProductAdminController.DeleteProductos);
router.post('/', ProductAdminController.AddProductos);
export default router;