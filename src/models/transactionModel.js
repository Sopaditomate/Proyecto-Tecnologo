import pool from "../config/db.js";

class TransactionModel {
  /**
   * Crea una nueva transacción de pago
   */
  async createTransaction(transactionData) {
    const { orderId, paymentMethod, amount, reference, transactionId, status } =
      transactionData;

    try {
      const [result] = await pool.query(
        `INSERT INTO transaccion_pago
         (ID_PEDIDO, METODO_PAGO, MONTO, REFERENCIA, ID_TRANSACCION, ESTADO, FECHA_CREACION)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [orderId, paymentMethod, amount, reference, transactionId, status]
      );

      return result.insertId;
    } catch (error) {
      console.error("Error al crear transacción:", error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de una transacción
   */
  async updateTransactionStatus(transactionId, status) {
    try {
      await pool.query(
        `UPDATE transaccion_pago
         SET ESTADO = ?, FECHA_ACTUALIZACION = NOW()
         WHERE ID_TRANSACCION = ?`,
        [status, transactionId]
      );

      return true;
    } catch (error) {
      console.error("Error al actualizar estado de transacción:", error);
      throw error;
    }
  }

  /**
   * Obtiene una transacción por su ID
   */
  async getTransactionById(transactionId) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM transaccion_pago WHERE ID_TRANSACCION = ?`,
        [transactionId]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error al obtener transacción:", error);
      throw error;
    }
  }

  /**
   * Obtiene las transacciones de un pedido
   */
  async getTransactionsByOrderId(orderId) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM transaccion_pago WHERE ID_PEDIDO = ? ORDER BY FECHA_CREACION DESC`,
        [orderId]
      );

      return rows;
    } catch (error) {
      console.error("Error al obtener transacciones del pedido:", error);
      throw error;
    }
  }
}

export default new TransactionModel();
