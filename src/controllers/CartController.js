import CartModel from "../models/CartModel.js";

class CartController {
  async getCart(req, res) {
    console.log("getCart para userId:", req.user.userId);
    const cart = await CartModel.getCartByUserId(req.user.userId);
    console.log(
      "Valor real de cart.items:",
      cart ? cart.items : "NO HAY CARRITO"
    );

    let items = [];
    if (cart && cart.items) {
      if (typeof cart.items === "string") {
        try {
          items = JSON.parse(cart.items);
          if (!Array.isArray(items)) items = [];
        } catch (e) {
          items = [];
        }
      } else if (Array.isArray(cart.items)) {
        // Ya es un array (MySQL JSON column)
        items = cart.items;
      } else {
        items = [];
      }
    }
    res.json({ items });
  }

  async saveCart(req, res) {
    const userId = req.user.userId;
    const { items } = req.body;
    await CartModel.saveCart(userId, items);
    res.json({ success: true });
  }

  async clearCart(req, res) {
    const userId = req.user.userId;
    await CartModel.clearCart(userId);
    res.json({ success: true });
  }
}

export default new CartController();
