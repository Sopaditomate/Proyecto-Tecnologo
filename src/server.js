import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { testConnection } from "./config/db.js";

dotenv.config(); //para unar .env

const app = express();

const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];


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
    process.exit(1);//detiene el proceso si falla
  }
};

// Inicializar la base de datos
initializeDatabase().catch(console.error);//es un catch para los errores sin el try


// Middleware de registro de solicitudes
app.use((req, res, next) => {
  const start = Date.now(); // Mueve esta línea aquí para que `start` esté disponible en el ámbito

  console.log(`[${new Date().toISOString()}] Solicitud: ${req.method} ${req.url}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start; // Aquí `start` es accesible
    console.log(`Respuesta: ${res.statusCode} en ${duration}ms`);
  });

  next();
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("Error en el servidor:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.use(express.json());// permite interpretar el cuerpo de las peticiones como JSON.
app.use(cookieParser());// permite leer cookies que se envían con las peticiones.

// Rutas de las APIS
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
//Se importan las nuevas rutas para inventario, los endpoints de la api
import inventoryRoutes from "./routes/inventoryRoutes.js";
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/inventario", inventoryRoutes);

app.get("/", (req, res) => {
  res.send("API is running!");
});

//inicializador del servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin}`);
});
