import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();//activa dotenv y permite acceder al contenido de .env

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  //ssl: { rejectUnauthorized: false },
};

// Crear pool de conexiones a la base de datos
const pool = mysql.createPool(dbConfig);

// Manejador de eventos de error del pool
//para el evento connection
pool.on("connection", (connection) => {
  console.log("Nueva conexión establecida con la base de datos");
//para el evento error
  connection.on("error", (err) => {
    console.error("Error en la conexión a la base de datos:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("Reconectando a la base de datos...");
    } else {
      throw err;
    }
  });
});

// Función para probar la conexión
async function testConnection() {
  try {
    console.log("🔍 Testing database connection with config:", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    const connection = await pool.getConnection();
    console.log("✅ Database connection successful!");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

export { testConnection };
export default pool; //se usa para hacer las consultas en otros archivos
