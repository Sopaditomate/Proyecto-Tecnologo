import CartModel from "../models/CartModel.js";

class CartController {
  async getCart(req, res) {
    console.log("getCart para userId:", req.user.userId);
    //se definio con let para usarla en el bloque posterior e implementar manejo de errores
    let cart
    try {
      cart = await CartModel.getCartByUserId(req.user.userId);
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    
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

  //Se añadieron validaciones para el guardado del carrito y el tipo para arrays
  async saveCart(req, res) {
    const userId = req.user.userId;
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Los items deben ser un array" });
    }
    try {
      await CartModel.saveCart(userId, items);
      res.json({ success: true });
    } catch (error) {
      console.error("Error al guardar el carrito:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    
  }

  async clearCart(req, res) {
    const userId = req.user.userId;
    await CartModel.clearCart(userId);
    res.json({ success: true });
  }
}

export default new CartController();
