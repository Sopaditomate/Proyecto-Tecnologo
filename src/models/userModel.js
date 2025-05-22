import pool from "../config/db.js";
import bcrypt from "bcrypt";

class UserModel {
  // Buscar usuario por email
  async findByEmail(email) {
    try {
      console.log("Buscando usuario con email:", email);
      const [rows] = await pool.query(
        "SELECT * FROM usuario_sys WHERE USUARIO = ?",
        [email]
      );
      if (rows.length) {
        console.log("Usuario encontrado");
        return rows[0];
      }
      console.log("Usuario no encontrado");
      return null;
    } catch (error) {
      console.error("Error al buscar usuario por email:", error);
      throw error;
    }
  }

  // Crear un nuevo usuario
  async create({
    email,
    password,
    rolId,
    nombres,
    apellidos,
    direccion,
    telefono,
  }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar en la tabla usuario_sys
      const [userResult] = await connection.query(
        "INSERT INTO usuario_sys (ID_ROL, USUARIO, PASSWORD, LOGIN) VALUES (?, ?, ?, ?)",
        [rolId, email, hashedPassword, email]
      );

      const userId = userResult.insertId;

      // Insertar en la tabla datos_usuario
      await connection.query(
        "INSERT INTO datos_usuario (ID_USUARIO, NOMBRES, APELLIDOS, DIRECCION, TELEFONO) VALUES (?, ?, ?, ?, ?)",
        [userId, nombres, apellidos, direccion, telefono]
      );

      // Insertar en las tablas adicionales según el rol
      if (rolId === 100000) {
        // Cliente
        await connection.query("INSERT INTO cliente (ID_USUARIO) VALUES (?)", [
          userId,
        ]);
      } else if (rolId === 100001) {
        // Administrador
        await connection.query(
          "INSERT INTO administrador_negocio (ID_USUARIO) VALUES (?)",
          [userId]
        );
      }

      await connection.commit();
      return userId;
    } catch (error) {
      await connection.rollback();
      console.error("Error al crear usuario:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener información completa del usuario
  async getUserInfo(userId) {
    try {
      const [rows] = await pool.query(
        `SELECT u.ID_USUARIO, u.ID_ROL, u.USUARIO, r.NOMBRE as ROL_NOMBRE, 
                d.NOMBRES, d.APELLIDOS, d.DIRECCION, d.TELEFONO 
         FROM usuario_sys u
         JOIN rol r ON u.ID_ROL = r.ID_ROL
         JOIN datos_usuario d ON u.ID_USUARIO = d.ID_USUARIO
         WHERE u.ID_USUARIO = ?`,
        [userId]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error("Error al obtener información del usuario:", error);
      throw error;
    }
  }

  // Obtener ID de cliente a partir de ID de usuario
  async getClientId(userId) {
    try {
      const [rows] = await pool.query(
        "SELECT ID_CLIENTE FROM cliente WHERE ID_USUARIO = ?",
        [userId]
      );
      return rows.length ? rows[0].ID_CLIENTE : null;
    } catch (error) {
      console.error("Error al obtener ID de cliente:", error);
      throw error;
    }
  }

  // Obtener usuario por ID
  async findById(userId) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM usuario_sys WHERE ID_USUARIO = ?",
        [userId]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error("Error al buscar usuario por ID:", error);
      throw error;
    }
  }
}

export default new UserModel();
