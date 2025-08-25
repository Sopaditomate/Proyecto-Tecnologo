import express from "express"
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

// Todas las rutas requieren autenticación y rol de administrador
router.use(verifyToken, isAdmin)

// Ruta de ejemplo para el panel de administrador
router.get("/dashboard", (req, res) => {
  res.json({ message: "Panel de administrador", user: req.user })
})

export default router
