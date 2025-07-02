import pool from "../config/db.js";

class CartModel {
  async getCartByUserId(userId) {
    const [rows] = await pool.query("CALL sp_get_cart_by_user(?)", [userId]);
    if (!rows[0] || !rows[0][0]) return null;
    const cartRow = rows[0][0];
    return {
      ...cartRow,
      items: cartRow.items ? JSON.parse(cartRow.items) : [],
    };
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
