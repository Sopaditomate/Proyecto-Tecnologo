import NequiService from "../services/nequiService.js";
import OrderModel from "../models/OrderModel.js";
import pool from "../config/db.js";

class PaymentController {
  /**
   * Inicia un pago con Nequi
   */
  async initiateNequiPayment(req, res) {
    try {
      const { phoneNumber, orderId } = req.body;
      const clientId = req.user.clientId;

      if (!clientId) {
        return res
          .status(400)
          .json({ message: "ID de cliente no encontrado en el token" });
      }

      if (!phoneNumber || !orderId) {
        return res
          .status(400)
          .json({
            message: "Número de teléfono y ID de pedido son requeridos",
          });
      }

      // Obtener detalles del pedido
      const orderDetails = await OrderModel.getOrderDetails(orderId);

      if (!orderDetails) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }

      // Verificar que el pedido pertenezca al cliente autenticado
      if (orderDetails.order.ID_CLIENTE !== clientId) {
        return res
          .status(403)
          .json({ message: "No tienes permisos para pagar este pedido" });
      }

      // Iniciar pago con Nequi
      const paymentData = {
        phoneNumber,
        amount: orderDetails.order.TOTAL_PAGAR,
        reference: `ORD-${orderId}`,
      };

      const paymentResult = await NequiService.initiatePayment(paymentData);

      if (!paymentResult.success) {
        return res.status(400).json({
          message: "Error al iniciar pago con Nequi",
          error: paymentResult.error,
        });
      }

      // Guardar información de la transacción en la base de datos
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        await connection.query(
          `INSERT INTO transaccion_pago
           (ID_PEDIDO, METODO_PAGO, MONTO, REFERENCIA, ID_TRANSACCION, ESTADO, FECHA_CREACION)
           VALUES (?, 'NEQUI', ?, ?, ?, ?, NOW())`,
          [
            orderId,
            orderDetails.order.TOTAL_PAGAR,
            paymentResult.transactionId || `ORD-${orderId}`,
            paymentResult.transactionId || null,
            paymentResult.status || "PENDING",
          ]
        );

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

      res.json({
        success: true,
        message: "Pago iniciado correctamente",
        transactionId: paymentResult.transactionId,
        qrCode: paymentResult.qrCode,
      });
    } catch (error) {
      console.error("Error al iniciar pago:", error);
      res.status(500).json({
        message: "Error al procesar el pago",
        error: error.message,
      });
    }
  }

  /**
   * Genera un código QR para pago con Nequi
   */
  async generateNequiQR(req, res) {
    try {
      const { orderId } = req.params;
      const clientId = req.user.clientId;

      if (!clientId) {
        return res
          .status(400)
          .json({ message: "ID de cliente no encontrado en el token" });
      }

      // Obtener detalles del pedido
      const orderDetails = await OrderModel.getOrderDetails(orderId);

      if (!orderDetails) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }

      // Verificar que el pedido pertenezca al cliente autenticado
      if (orderDetails.order.ID_CLIENTE !== clientId) {
        return res
          .status(403)
          .json({ message: "No tienes permisos para este pedido" });
      }

      // Generar QR para pago
      const qrData = {
        amount: orderDetails.order.TOTAL_PAGAR,
        reference: `ORD-${orderId}`,
      };

      const qrResult = await NequiService.generateQRCode(qrData);

      if (!qrResult.success) {
        return res.status(400).json({
          message: "Error al generar código QR",
          error: qrResult.error,
        });
      }

      // Guardar información de la transacción en la base de datos
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Verificar si ya existe una transacción para este pedido
        const [existingTransaction] = await connection.query(
          "SELECT ID_TRANSACCION_PAGO FROM transaccion_pago WHERE ID_PEDIDO = ? AND METODO_PAGO = 'NEQUI'",
          [orderId]
        );

        if (existingTransaction.length === 0) {
          // Si no existe, crear una nueva transacción
          await connection.query(
            `INSERT INTO transaccion_pago
             (ID_PEDIDO, METODO_PAGO, MONTO, REFERENCIA, ID_TRANSACCION, ESTADO, FECHA_CREACION)
             VALUES (?, 'NEQUI', ?, ?, ?, 'PENDING', NOW())`,
            [
              orderId,
              orderDetails.order.TOTAL_PAGAR,
              `ORD-${orderId}`,
              qrResult.transactionId || null,
            ]
          );
        } else {
          // Si existe, actualizar la transacción existente
          await connection.query(
            `UPDATE transaccion_pago
             SET ID_TRANSACCION = ?, FECHA_ACTUALIZACION = NOW()
             WHERE ID_PEDIDO = ? AND METODO_PAGO = 'NEQUI'`,
            [qrResult.transactionId || null, orderId]
          );
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

      res.json({
        success: true,
        qrImage: qrResult.qrImage,
        qrCode: qrResult.qrCode,
        transactionId: qrResult.transactionId,
      });
    } catch (error) {
      console.error("Error al generar QR:", error);
      res.status(500).json({
        message: "Error al generar código QR",
        error: error.message,
      });
    }
  }

  /**
   * Verifica el estado de un pago
   */
  async checkPaymentStatus(req, res) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({ message: "ID de transacción requerido" });
      }

      const statusResult = await NequiService.checkPaymentStatus(transactionId);

      if (!statusResult.success) {
        return res.status(400).json({
          message: "Error al consultar estado del pago",
          error: statusResult.error,
        });
      }

      // Si el pago fue exitoso, actualizar el estado en la base de datos
      if (statusResult.status === "APPROVED") {
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();

          // Actualizar la transacción
          await connection.query(
            `UPDATE transaccion_pago
             SET ESTADO = ?, FECHA_ACTUALIZACION = NOW()
             WHERE ID_TRANSACCION = ?`,
            [statusResult.status, transactionId]
          );

          // Obtener el ID del pedido asociado a esta transacción
          const [orderResult] = await connection.query(
            "SELECT ID_PEDIDO FROM transaccion_pago WHERE ID_TRANSACCION = ?",
            [transactionId]
          );

          if (orderResult.length > 0) {
            const orderId = orderResult[0].ID_PEDIDO;

            // Actualizar el estado del pedido a "Preparando" (ID 300001)
            await connection.query(
              "UPDATE pedido SET ID_ESTADO = 300001 WHERE ID_PEDIDO = ?",
              [orderId]
            );
          }

          await connection.commit();
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
      }

      res.json({
        success: true,
        status: statusResult.status,
        statusDescription: statusResult.statusDescription,
      });
    } catch (error) {
      console.error("Error al verificar estado del pago:", error);
      res.status(500).json({
        message: "Error al verificar estado del pago",
        error: error.message,
      });
    }
  }

  /**
   * Recibe notificaciones de pago de Nequi (webhook)
   */
  async handleNequiCallback(req, res) {
    try {
      console.log(
        "Recibida notificación de Nequi:",
        JSON.stringify(req.body, null, 2)
      );

      const { transactionId, status, reference } = req.body;

      if (!transactionId || !status) {
        return res
          .status(400)
          .json({ message: "Datos incompletos en la notificación" });
      }

      // Actualizar el estado de la transacción en la base de datos
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Actualizar la transacción
        await connection.query(
          `UPDATE transaccion_pago
           SET ESTADO = ?, FECHA_ACTUALIZACION = NOW()
           WHERE ID_TRANSACCION = ? OR REFERENCIA = ?`,
          [status, transactionId, reference]
        );

        // Si el pago fue aprobado, actualizar el estado del pedido
        if (status === "APPROVED") {
          // Obtener el ID del pedido asociado a esta transacción
          const [orderResult] = await connection.query(
            "SELECT ID_PEDIDO FROM transaccion_pago WHERE ID_TRANSACCION = ? OR REFERENCIA = ?",
            [transactionId, reference]
          );

          if (orderResult.length > 0) {
            const orderId = orderResult[0].ID_PEDIDO;

            // Actualizar el estado del pedido a "Preparando" (ID 300001)
            await connection.query(
              "UPDATE pedido SET ID_ESTADO = 300001 WHERE ID_PEDIDO = ?",
              [orderId]
            );
          }
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

      // Responder a Nequi con éxito
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error al procesar notificación de Nequi:", error);
      res.status(500).json({
        message: "Error al procesar notificación",
        error: error.message,
      });
    }
  }

  //prueba
  async initiateNequiPaymentMock(req, res) {
    return res.json({
      success: true,
      data: {
        ResponseMessage: {
          ResponseBody: {
            any: {
              PaymentResponse: {
                TransactionID: "TX123456789",
                Status: "PENDING",
                QRCode: "https://fake.qr.code/image.png",
              },
            },
          },
        },
      },
      transactionId: "TX123456789",
      status: "PENDING",
      qrCode: "https://fake.qr.code/image.png",
    });
  }
}

export default new PaymentController();


