import pool from "../config/db.js";

class OrderModel {
  // Crear un nuevo pedido
  async createOrder(clientId, items) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insertar el pedido en la tabla PEDIDO (estado inicial: Recepción = 300000)
      // Llamar al procedimiento para insertar el pedido y obtener el ID
      const [orderResult] = await connection.query(
          "CALL sp_insert_order_header(?, 300000, @orderId); SELECT @orderId AS orderId;",//aqui se captura el id de la ultima order
          [clientId]
      );

      orderId = orderResult[0][0].orderId; // Obtener el ID del pedido

      // Insertar los detalles del pedido
      for (const item of items) {
        await connection.query(
          "CALL sp_insert_order_detail(?, ?, ?)",
          [orderId, item.id, item.cantidad]
        );
      }

      // El trigger trg_actualizar_totales_pedido_insert actualizará los totales
      // de eso ya nada

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      console.error("Error al crear pedido:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener pedidos de un cliente
  async getClientOrders(clientId) {
    try {
      const [rows] = await pool.query(
        `CALL sp_get_client_orders(?)`,
        [clientId]
      );

      return rows;
    } catch (error) {
      console.error("Error al obtener pedidos del cliente:", error);
      throw error;
    }
  }

  // Obtener detalles de un pedido específico
  async getOrderDetails(orderId) {
    try {
      // Obtener información del pedido
      const [orderInfo] = await pool.query(
        `CALL sp_get_order_details(?)`,
        [orderId]
      );

      if (!orderInfo.length) return null;

      // Obtener detalles de los productos en el pedido
      const [items] = await pool.query(
        `CALL sp_get_order_items(?)`,
        [orderId]
      );

      return {
        order: orderInfo[0],// Retorna la información del pedido
        items,// Retorna los detalles de los productos
      };
    } catch (error) {
      console.error("Error al obtener detalles del pedido:", error);
      throw error;
    }
  }
}

export default new OrderModel();
