import express from "express"
import ProductController from "../controllers/ProductController.js"

const router = express.Router()

router.get("/", ProductController.getAllProducts)
router.get("/featured", ProductController.getFeaturedProducts)
router.get("/categories", ProductController.getCategories)
router.get("/filter", ProductController.filterProducts)
router.get("/:id", ProductController.getProductById)

export default router
