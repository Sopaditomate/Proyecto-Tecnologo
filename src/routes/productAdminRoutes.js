import express from "express";
import ProductAdminController from "../controllers/ProductAdminController.js";
//import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();
import multer from 'multer';
const upload = multer();
//router.use(verifyToken, isAdmin);

router.get("/", ProductAdminController.getProductos);
router.put("/:id(\\d+)", ProductAdminController.UpdateProductos);
router.delete("/product/:id(\\d+)", ProductAdminController.DeleteProductos);
router.post("/", ProductAdminController.AddProductos);
router.post("/cart", ProductAdminController.AddProductosToCart);
router.put("/activate/:id(\\d+)", ProductAdminController.ActivateProducto);
router.post('/cargar/product', upload.single('file'), ProductAdminController.CargarMasivaProductos);
export default router;
