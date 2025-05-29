import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { testConnection } from "./config/db.js";

dotenv.config();

const app = express();

const allowedOrigins = ["http://127.0.0.1:53885/", "http://localhost:5173"];

// Configuración de CORS
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware de CORS
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Probar la conexión al inicio
const initializeDatabase = async () => {
  console.log("🔌 Testing database connection...");
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error(
      "❌ Failed to connect to the database. Please check your connection settings in .env"
    );
    process.exit(1);
  }
};

// Inicializar la base de datos
initializeDatabase().catch(console.error);

// Middleware de registro de solicitudes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("Error en el servidor:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.use(express.json());
app.use(cookieParser());

// Rutas
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);


//productos
import productAdminRoutes from './routes/productAdminRoutes.js';
app.use("/api/productos_crud", productAdminRoutes);

//recetas
import recetaRoutes from './routes/recetaRoutes.js'
app.use("/api/recetas_crud", recetaRoutes);

app.get("/", (req, res) => {
  res.send("API is running!");
});






const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin}`);
});
