import OrderModelAdmin from "../models/OrderModelAdmin.js";
import { sendOrderUpdateEmail } from "../services/orderEmailService.js";

class OrderControllerAdmin {
  // Obtener todas las órdenes activas
  async getActiveOrders(req, res) {
    try {
      const orders = await OrderModelAdmin.getActiveOrders();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener órdenes activas",
        error: error.message,
      });
    }
  }

  // Obtener detalles de una orden por ID de usuario
  async getAllOrdersAndDetailsByUserId(req, res) {
    const userId = req.params.userId;
    try {
      const orders = await OrderModelAdmin.getAllOrdersAndDetailsByUserId(
        userId
      );
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener órdenes por ID de usuario",
        error: error.message,
      });
    }
  }

  // Obtener detalles de una orden por ID de orden
  async getOrderDetailsByOrderId(req, res) {
    const orderId = req.params.orderId;
    try {
      const orderDetails = await OrderModelAdmin.getOrderDetailsByOrderId(
        orderId
      );
      res.status(200).json(orderDetails);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener detalles de la orden",
        error: error.message,
      });
    }
  }

  // Cambiar el estado de una orden
  async updateOrderStatus(req, res) {
    const { orderId, statusId } = req.body;
    try {
      const success = await OrderModelAdmin.updateOrderStatus(
        orderId,
        statusId
      );
      if (success) {
        res
          .status(200)
          .json({ message: "Estado de la orden actualizado con éxito" });
      } else {
        res
          .status(404)
          .json({ message: "Orden no encontrada o no se pudo actualizar" });
      }
      // Enviar email de notificación
      await sendOrderUpdateEmail(orderId, statusId);
    } catch (error) {
      res.status(500).json({
        message: "Error al actualizar el estado de la orden",
        error: error.message,
      });
    }
  }

  // Obtener todos los estados de órdenes activos
  async getOrderStatus(req, res) {
    try {
      const statuses = await OrderModelAdmin.getOrderStatus();
      res.status(200).json(statuses);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener estados de órdenes",
        error: error.message,
      });
    }
  }
}

export default new OrderControllerAdmin();
