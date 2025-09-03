import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { testConnection } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config(); //para unar .env

const app = express();
// Redirigir HTTP a HTTPS en producción
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] === "http") {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://proyecto-tecnologo-lovebites.up.railway",
  "https://proyecto-tecnologo-lovebites.up.railway.app",
  "proyecto-tecnologo-production-e65d.up.railway.app"
];

// Configuración de CORS
const corsOptions = {
  origin: allowedOrigins, //origenes permitidos
  credentials: true, //se aceptan cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], //se permiten estos metodos comunes https
  allowedHeaders: ["Content-Type", "Authorization"], //se aceptan ciertos encabezados en las peticiones
};

// Middleware de CORS, en este caso una instancia de express
app.use(cors(corsOptions)); //aplica cors a todas las rutas
app.options("*", cors(corsOptions));

// Probar la conexión al inicio
const initializeDatabase = async () => {
  console.log("🔌 Testing database connection...");
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error(
      "❌ Failed to connect to the database. Please check your connection settings in .env"
    );
    process.exit(1); //detiene el proceso si falla
  }
};

// Inicializar la base de datos
initializeDatabase().catch(console.error); //es un catch para los errores sin el try

// Middleware de registro de solicitudes
app.use((req, res, next) => {
  const start = Date.now(); // Mueve esta línea aquí para que `start` esté disponible en el ámbito

  console.log(
    `[${new Date().toISOString()}] Solicitud: ${req.method} ${req.url}`
  );

  res.on("finish", () => {
    const duration = Date.now() - start; // Aquí `start` es accesible
    console.log(`Respuesta: ${res.statusCode} en ${duration}ms`);
  });

  next();
});

app.use(express.json()); // permite interpretar el cuerpo de las peticiones como JSON.
app.use(cookieParser()); // permite leer cookies que se envían con las peticiones.

// Rutas de las APIS
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import productAdminRoutes from "./routes/productAdminRoutes.js";
import product_pdf from "../views/pages/admin/products/product_pdf.js";

import recetaRoutes from "./routes/recetaRoutes.js";
import receta_pdf from "../views/pages/admin/receta/receta_pdf.js";

import inventario_pdf from "../views/pages/admin/inventory/inventario_pdf.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";

import GraficRoutes from "./routes/GraficRoutes.js";
import orderAdminRoutes from "./routes/orderAdminRoutes.js";

import productionRoutes from "./routes/productionRoutes.js";
import production_pdf from "../views/pages/admin/production/production_pdf.js";



app.use("/api/grafic",GraficRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/productos_crud", productAdminRoutes);

//esto hay que actualizarlo en otros archivos para no tener errores de colision:
// app.use("/api/export/products", product_pdf);
// app.use("/api/export/inventory", inventario_pdf);
// app.use("/api/export/recipes", receta_pdf);

app.use("/api/export/", product_pdf);
app.use("/api/export/", inventario_pdf);
app.use("/api/export/", receta_pdf);
app.use("/api/export/", production_pdf);

app.use("/api/user", userProfileRoutes);
app.use("/api/recetas_crud", recetaRoutes);
app.use("/api/inventario", inventoryRoutes);
app.use("/api/pedidos", orderAdminRoutes);
// a probar esta
app.use("/api/produccion", productionRoutes);

// Configurar Express para servir archivos estáticos del frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
})


// Manejo de errores
app.use((err, req, res, next) => {
  console.error("Error en el servidor:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

//inicializador del servidor
const PORT = process.env.PORT || 44070;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin}`);
});
