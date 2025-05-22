import pool from "../config/db.js";

class OrderModel {
  // Crear un nuevo pedido
  async createOrder(clientId, items) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insertar el pedido en la tabla PEDIDO (estado inicial: Recepción = 300000)
      const [orderResult] = await connection.query(
        "INSERT INTO pedido (ID_CLIENTE, ID_ESTADO) VALUES (?, 300000)",
        [clientId]
      );

      const orderId = orderResult.insertId;

      // Insertar los detalles del pedido
      for (const item of items) {
        await connection.query(
          "INSERT INTO detalle_pedido (ID_PEDIDO, ID_PRODUCTO, CANTIDAD) VALUES (?, ?, ?)",
          [orderId, item.id, item.cantidad]
        );
      }

      // El trigger trg_actualizar_totales_pedido_insert actualizará los totales

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
        `
        SELECT p.ID_PEDIDO, p.FECHA_HORA, p.TOTAL_PAGAR, e.NOMBRE as ESTADO
        FROM pedido p
        JOIN estado_pedido e ON p.ID_ESTADO = e.ID_ESTADO
        WHERE p.ID_CLIENTE = ?
        ORDER BY p.FECHA_HORA DESC
      `,
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
        `
        SELECT p.ID_PEDIDO, p.FECHA_HORA, p.TOTAL_DESCUENTO, p.TOTAL_PAGAR, 
               e.NOMBRE as ESTADO, c.ID_CLIENTE, 
               du.NOMBRES, du.APELLIDOS, du.DIRECCION, du.TELEFONO
        FROM pedido p
        JOIN estado_pedido e ON p.ID_ESTADO = e.ID_ESTADO
        JOIN cliente c ON p.ID_CLIENTE = c.ID_CLIENTE
        JOIN usuario_sys us ON c.ID_USUARIO = us.ID_USUARIO
        JOIN datos_usuario du ON us.ID_USUARIO = du.ID_USUARIO
        WHERE p.ID_PEDIDO = ?
      `,
        [orderId]
      );

      if (!orderInfo.length) return null;

      // Obtener detalles de los productos en el pedido
      const [items] = await pool.query(
        `
        SELECT dp.ID_DETALLE_PEDIDO, dp.ID_PRODUCTO, dp.CANTIDAD, dp.PRECIO_FINAL,
               p.NOMBRE as PRODUCTO_NOMBRE, p.DESCRIPCION, p.IMAGEN_URL
        FROM detalle_pedido dp
        JOIN producto p ON dp.ID_PRODUCTO = p.ID_PRODUCTO
        WHERE dp.ID_PEDIDO = ?
      `,
        [orderId]
      );

      return {
        order: orderInfo[0],
        items,
      };
    } catch (error) {
      console.error("Error al obtener detalles del pedido:", error);
      throw error;
    }
  }
}

export default new OrderModel();
