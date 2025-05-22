import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Crear pool de conexiones a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lovebites",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Función para probar la conexión
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Conexión a la base de datos establecida correctamente");
    connection.release();
    return true;
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    return false;
  }
}

export default pool;
