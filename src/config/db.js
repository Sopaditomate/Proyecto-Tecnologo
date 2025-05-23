import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Crear pool de conexiones a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lovebites",
  port: parseInt(process.env.DB_PORT) || 13692,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 segundos de timeout
  ssl: {
    rejectUnauthorized: false // Necesario para conexiones SSL
  }
});

// Función para probar la conexión
async function testConnection() {
  try {
    console.log('🔍 Testing database connection with config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD 
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
export default pool;
