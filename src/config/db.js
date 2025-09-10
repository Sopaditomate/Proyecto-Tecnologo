import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
};

// Crear pool de conexiones a la base de datos
const pool = mysql.createPool(dbConfig);

// Manejador de eventos del pool
pool.on("connection", (connection) => {
  console.log("✅ Nueva conexión establecida con la base de datos");

  connection.on("error", (err) => {
    console.error("❌ Error en la conexión a la base de datos:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("🔄 Intentando reconectar a la base de datos...");
    } else {
      console.error("⚠️ Error no manejado:", err.message);
    }
  });
});

// Mantener la conexión viva con un ping cada 4 minutos
setInterval(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("🟢 Ping exitoso a la base de datos");
  } catch (err) {
    console.error("🔴 Error en el ping a la base de datos:", err.message);
  }
}, 240000); // 4 minutos

// Función para probar la conexión
async function testConnection() {
  try {
    console.log("🔍 Probando conexión a la base de datos con config:", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    const connection = await pool.getConnection();
    console.log("✅ Conexión a la base de datos exitosa");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Falló la conexión a la base de datos:", error.message);
    return false;
  }
}

export { testConnection };
export default pool;
