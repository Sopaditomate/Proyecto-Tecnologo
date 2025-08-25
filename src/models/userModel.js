import pool from "../config/db.js";
import bcrypt from "bcrypt";

class UserModel {
  // Verifica si ya hay un admin logueado
  async isAdminLoggedIn() {
    const [[rows]] = await pool.query(
      "SELECT COUNT(*) AS count FROM usuarios WHERE ID_ROL = 100001 AND is_logged_in = TRUE"
    );
    return rows[0].count > 0;
  }

  // Marca al admin como logueado
  async setAdminLoggedIn(userId, value) {
    await pool.query(
      "UPDATE usuarios SET is_logged_in = ? WHERE ID_USUARIO = ?",
      [value, userId]
    );
  }

  async findByEmail(email) {
    const [[rows]] = await pool.query("CALL sp_find_user_by_email(?)", [email]);
    return rows[0];
  }

  async create({
    email,
    password,
    rolId,
    nombres,
    apellidos,
    direccion,
    telefono,
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [[rows]] = await pool.query(
      "CALL sp_create_user(?, ?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, rolId, nombres, apellidos, direccion, telefono]
    );
    return rows[0]?.userId;
  }

  async getUserInfo(userId) {
    const [[rows]] = await pool.query("CALL sp_get_user_info(?)", [userId]);
    return rows[0] || null;
  }

  //para el modulo de usuarios del admin

  async getAllUsersInfo() {
    const [rows] = await pool.query("CALL sp_get_users_info()");
    return rows[0] || [];
  }

  async updateStateUser(id_user) {
    try {
      // Llamar al stored procedure pasándole el parámetro
      const [result] = await pool.query("CALL sp_toggle_user_state(?)", [
        id_user,
      ]);

      return result[0]; // Retornamos el primer conjunto de resultados que devuelve el SP
      console.log("Cambio exitoso");
    } catch (error) {
      console.error("Error al cambiar el estado del usuario:", error);
      throw error; // Lanza el error para manejarlo a un nivel superior si es necesario
    }
  }

  //////////////////////////////////////////////////////////////////////////

  async getClientId(userId) {
    const [[rows]] = await pool.query("CALL sp_get_client_id(?)", [userId]);
    return rows.length ? rows[0].ID_CLIENTE : null;
  }

  async findById(userId) {
    const [[rows]] = await pool.query("CALL sp_get_user_by_id(?)", [userId]);
    return rows[0];
  }

  async saveResetToken(userId, token) {
    await pool.query("CALL sp_save_reset_token(?, ?)", [userId, token]);
  }

  async updatePasswordAndClearToken(userId, hashedPassword) {
    await pool.query("CALL sp_update_password_and_clean_token(?, ?)", [
      userId,
      hashedPassword,
    ]);
  }

  async saveVerifyToken(userId, token) {
    await pool.query("CALL sp_save_verify_token(?, ?)", [userId, token]);
  }

  async verifyUserByToken(token) {
    const [[rows]] = await pool.query("CALL sp_verify_user_by_token(?)", [
      token,
    ]);
    return rows.length && rows[0].verified === 1;
  }
}

export default new UserModel();
