import pool from "../config/db.js";

class PaymentModel {
  // Crear transacción de pago
  async createPaymentTransaction(orderData) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO payment_transaction
         (id_order, payment_method, amount, reference, id_transaction, state, creation_date)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          orderData.orderId,
          orderData.paymentMethod || "MERCADOPAGO",
          orderData.amount,
          orderData.reference,
          orderData.transactionId,
          orderData.state || "PENDING",
        ]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      console.error("Error al crear transacción de pago:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Actualizar estado de transacción
  async updatePaymentTransaction(transactionId, status) {
    try {
      const [result] = await pool.query(
        `UPDATE payment_transaction
         SET state = ?, update_date = NOW()
         WHERE id_transaction = ?`,
        [status, transactionId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al actualizar transacción:", error);
      throw error;
    }
  }

  // Obtener información de transacción por ID
  async getPaymentTransaction(transactionId) {
    try {
      const [rows] = await pool.query(
        `SELECT pt.*, oh.id_user 
         FROM payment_transaction pt
         JOIN order_header oh ON pt.id_order = oh.id_order
         WHERE pt.id_transaction = ? AND pt.id_state = 1`,
        [transactionId]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error al obtener transacción:", error);
      throw error;
    }
  }

  // Obtener transacciones por pedido
  async getPaymentTransactionsByOrder(orderId) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM payment_transaction 
         WHERE id_order = ? AND id_state = 1
         ORDER BY creation_date DESC`,
        [orderId]
      );

      return rows;
    } catch (error) {
      console.error("Error al obtener transacciones del pedido:", error);
      throw error;
    }
  }

  // Actualizar estado del pedido cuando el pago es aprobado
  async updateOrderStatusOnPayment(transactionId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Obtener el pedido asociado a la transacción
      const [orderResult] = await connection.query(
        "SELECT id_order FROM payment_transaction WHERE id_transaction = ?",
        [transactionId]
      );

      if (orderResult.length > 0) {
        const orderId = orderResult[0].id_order;

        // Actualizar estado del pedido a "Confirmado" (asumo 300001)
        await connection.query(
          "UPDATE order_header SET id_order_status = 300001 WHERE id_order = ?",
          [orderId]
        );
      }

      await connection.commit();
      return orderResult.length > 0;
    } catch (error) {
      await connection.rollback();
      console.error("Error al actualizar estado del pedido:", error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new PaymentModel();
