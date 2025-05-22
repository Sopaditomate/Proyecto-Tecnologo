// Convertir a clase
import OrderModel from "../models/orderModel.js";

class OrderController {
  // Crear un nuevo pedido
  async createOrder(req, res) {
    try {
      const { items } = req.body;
      const clientId = req.user.clientId;

      if (!clientId) {
        return res
          .status(400)
          .json({ message: "ID de cliente no encontrado en el token" });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ message: "Se requieren productos para crear un pedido" });
      }

      // Validar estructura de los ítems
      for (const item of items) {
        if (!item.id || !item.cantidad || item.cantidad <= 0) {
          return res
            .status(400)
            .json({ message: "Formato de productos inválido" });
        }
      }

      const orderId = await OrderModel.createOrder(clientId, items);

      res.status(201).json({
        success: true,
        orderId,
        message: "Pedido creado correctamente",
      });
    } catch (error) {
      console.error("Error al crear pedido:", error);
      res
        .status(500)
        .json({ message: "Error al crear pedido", error: error.message });
    }
  }

  // Obtener pedidos del cliente autenticado
  async getClientOrders(req, res) {
    try {
      const clientId = req.user.clientId;

      if (!clientId) {
        return res
          .status(400)
          .json({ message: "ID de cliente no encontrado en el token" });
      }

      const orders = await OrderModel.getClientOrders(clientId);

      res.json(orders);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      res
        .status(500)
        .json({ message: "Error al obtener pedidos", error: error.message });
    }
  }

  // Obtener detalles de un pedido específico
  async getOrderDetails(req, res) {
    try {
      const { id } = req.params;
      const clientId = req.user.clientId;

      if (!clientId) {
        return res
          .status(400)
          .json({ message: "ID de cliente no encontrado en el token" });
      }

      const orderDetails = await OrderModel.getOrderDetails(id);

      if (!orderDetails) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }

      // Verificar que el pedido pertenezca al cliente autenticado
      if (orderDetails.order.ID_CLIENTE !== clientId) {
        return res
          .status(403)
          .json({ message: "No tienes permisos para ver este pedido" });
      }

      res.json(orderDetails);
    } catch (error) {
      console.error("Error al obtener detalles del pedido:", error);
      res
        .status(500)
        .json({
          message: "Error al obtener detalles del pedido",
          error: error.message,
        });
    }
  }
}

export default new OrderController();
