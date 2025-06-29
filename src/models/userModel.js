import pool from "../config/db.js";
import bcrypt from "bcrypt";

class UserModel {
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
    

  async getClientId(userId) {
    const [[rows]] = await pool.query("CALL sp_get_client_id(?)", [userId]);
    return rows.length ? rows[0].ID_CLIENTE : null;
  }
   

  async findById(userId) {
    const [[rows]] = await pool.query("CALL sp_find_user_by_id(?)", [userId]);
    return rows[0] || null;
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
