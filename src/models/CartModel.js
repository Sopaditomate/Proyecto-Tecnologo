import pool from "../config/db.js";

class CartModel {
  async getCartByUserId(userId) {
    const [rows] = await pool.query(
      "SELECT * FROM carrito WHERE id_usuario = ?",
      [userId]
    );
    return rows[0] || null;
  }

  async saveCart(userId, items) {
    // items debe ser un array de productos
    const itemsJson = JSON.stringify(items);
    const [existing] = await pool.query(
      "SELECT id FROM carrito WHERE id_usuario = ?",
      [userId]
    );
    if (existing.length) {
      await pool.query("UPDATE carrito SET items = ? WHERE id_usuario = ?", [
        itemsJson,
        userId,
      ]);
    } else {
      await pool.query(
        "INSERT INTO carrito (id_usuario, items) VALUES (?, ?)",
        [userId, itemsJson]
      );
    }
  }

  async clearCart(userId) {
    await pool.query("DELETE FROM carrito WHERE id_usuario = ?", [userId]);
  }
}

export default new CartModel();
