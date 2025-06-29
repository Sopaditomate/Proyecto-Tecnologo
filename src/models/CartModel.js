import pool from "../config/db.js";

  class CartModel {
    async getCartByUserId(userId) {
      const [rows] = await pool.query(
        "CALL sp_get_cart_by_user(?)",
        [userId]
      );
      return rows[0] || null;
    }

    async saveCart(userId, items) {
      const itemsJson = JSON.stringify(items);
      await pool.query("CALL sp_save_cart(?, ?)", [userId, itemsJson]);
    }

    async clearCart(userId) {
      await pool.query("CALL sp_clear_cart(?)", [userId]);
    }
  }

export default new CartModel();

