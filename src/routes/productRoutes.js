import express from "express"
import productController from "../controllers/productController.js"

const router = express.Router()

router.get("/", productController.getAllProducts)
router.get("/featured", productController.getFeaturedProducts)
router.get("/categories", productController.getCategories)
router.get("/filter", productController.filterProducts)
router.get("/:id", productController.getProductById)

export default router
