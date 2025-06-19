import pool from "../config/db.js";

  class CartModel {
    //este no sirve
    async getCartByUserId(userId) {
      const [rows] = await pool.query(
        "SELECT * FROM vw_active_cart_by_user WHERE id_usuario = (?)",
        [userId]
      );
      return rows[0] || null;
    }

    // async getCartByUserId(userId) {
    //   const [rows] = await pool.query(
    //     "CALL sp_get_cart_by_user(?)",
    //     [userId]
    //   );
    //   console.log(rows)
    //   return rows[0] || null;
    // }

    // async getCartByUserId(userId) {
    //   const [rows] = await pool.query(
    //     "SELECT id_cart as id, id_user as id_usuario, items, updated_at as actualizado FROM cart WHERE id_user = ?",
    //     [userId]
    //   );
    //   return rows[0] || null;
    // }

/////////este esta bn
    async saveCart(userId, items) {
      const itemsJson = JSON.stringify(items);
      await pool.query("CALL sp_save_cart(?, ?)", [userId, itemsJson]);
    }
/////////este esta por ver
    async clearCart(userId) {
      await pool.query("CALL sp_clear_cart(?)", [userId]);
    }
  }

export default new CartModel();

