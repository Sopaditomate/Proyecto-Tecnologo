import pool from "../config/db.js";
import MercadoPagoService from "../services/mercadoPagoService.js";
import { sendOrderUpdateEmail } from "../services/orderEmailService.js";

class PaymentController {
  /**
   * Crear solo una preferencia de MercadoPago sin crear el pedido
   */
  async createMercadoPagoPreference(req, res) {
    try {
      const { items, additionalItems, amount, description, deliveryAddress } =
        req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          message: "Los items son requeridos",
        });
      }

      if (!deliveryAddress) {
        return res.status(400).json({
          message: "La dirección de entrega es requerida",
        });
      }

      // Crear preferencia temporal con un ID único
      const tempOrderId = `TEMP-${Date.now()}-${req.user.userId}`;

      const paymentData = {
        amount: amount,
        orderId: tempOrderId,
        description: description || `Pedido LoveBites Bakery`,
        items: items,
        additionalItems: additionalItems || [],
      };

      console.log("Creando preferencia de MercadoPago:", paymentData);

      const paymentResult = await MercadoPagoService.createPayment(paymentData);

      if (!paymentResult.success) {
        return res.status(400).json({
          message: "Error al crear preferencia de MercadoPago",
          error: paymentResult.error,
        });
      }

      res.json({
        success: true,
        message: "Preferencia de pago creada correctamente",
        init_point: paymentResult.initPoint,
        sandbox_init_point: paymentResult.sandboxInitPoint,
        preferenceId: paymentResult.preferenceId,
      });
    } catch (error) {
      console.error("Error al crear preferencia de MercadoPago:", error);
      res.status(500).json({
        message: "Error interno al crear preferencia de pago",
        error: error.message,
      });
    }
  }

  /**
   * Crear pedido SOLO después de pago exitoso - CON PREVENCIÓN DE DUPLICADOS
   */
  async createOrderAfterPayment(req, res) {
    try {
      const clientId = req.user.clientId;
      const {
        items,
        deliveryAddress,
        shippingCost = 5000,
        paymentId,
      } = req.body;

      if (!clientId) {
        return res.status(400).json({
          message: "ID de cliente no encontrado en el token",
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          message: "Los items del pedido son requeridos",
        });
      }

      if (!deliveryAddress) {
        return res.status(400).json({
          message: "La dirección de entrega es requerida",
        });
      }

      if (!paymentId) {
        return res.status(400).json({
          message: "ID de pago requerido",
        });
      }

      // Verificar que el pago esté aprobado
      const paymentStatus = await MercadoPagoService.getPaymentStatus(
        paymentId
      );
      if (!paymentStatus.success || paymentStatus.status !== "approved") {
        return res.status(400).json({
          message: `El pago no está aprobado. Estado actual: ${paymentStatus.status}`,
        });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // CRÍTICO: Verificar si ya existe un pedido para este paymentId
        const [existingOrder] = await connection.query(
          `SELECT id_order FROM payment_transaction WHERE id_transaction = ?`,
          [paymentId]
        );

        if (existingOrder.length > 0) {
          await connection.rollback();
          return res.json({
            success: true,
            orderId: existingOrder[0].id_order,
            message: "El pedido ya existe para este pago",
            duplicate: true,
          });
        }

        let subtotal = 0;
        for (const item of items) {
          subtotal += item.price * item.cantidad;
        }
        const tax = subtotal * 0.19; // IVA 19%
        const totalAmount = subtotal + tax + shippingCost;

        console.log(
          `[${paymentId}] Creando pedido después del pago - Subtotal: ${subtotal}, Tax: ${tax}, Shipping: ${shippingCost}, Total: ${totalAmount}`
        );

        // Crear pedido en order_header con estado "Preparando" (300001)
        const [orderResult] = await connection.query(
          `INSERT INTO order_header 
           (id_user, id_order_status, created_at, total_amount, id_state) 
           VALUES (?, 300001, NOW(), ?, 1)`,
          [clientId, totalAmount]
        );

        const orderId = orderResult.insertId;

        // Crear detalles del pedido
        for (const item of items) {
          await connection.query(
            `INSERT INTO order_detail 
             (id_order, id_product, quantity, final_price, id_state) 
             VALUES (?, ?, ?, ?, 1)`,
            [orderId, item.id, item.cantidad, item.price]
          );
        }

        // Crear registro de transacción de pago con estado APPROVED
        await connection.query(
          `INSERT INTO payment_transaction
           (id_order, payment_method, amount, reference, id_transaction, state, creation_date)
           VALUES (?, 'MERCADOPAGO', ?, ?, ?, 'APPROVED', NOW())`,
          [orderId, totalAmount, `ORD-${orderId}`, paymentId]
        );

        // Crear historial del pedido
        await connection.query(
          `INSERT INTO order_history (id_user, id_order, history_datetime, id_state) 
           VALUES (?, ?, NOW(), 1)`,
          [clientId, orderId]
        );

        await connection.commit();

        console.log(`[${paymentId}] Pedido ${orderId} creado exitosamente`);

        res.json({
          success: true,
          orderId,
          subtotal,
          tax,
          shippingCost,
          totalAmount,
          message: "Pedido creado correctamente después del pago",
        });

        // Enviar email de confirmación (no bloquear respuesta)
        setTimeout(async () => {
          try {
            await sendOrderUpdateEmail(orderId, 300001);
          } catch (emailError) {
            console.error(
              `Error enviando email para pedido ${orderId}:`,
              emailError
            );
          }
        }, 100);
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error al crear pedido después del pago:", error);
      res.status(500).json({
        message: "Error al crear el pedido después del pago",
        error: error.message,
      });
    }
  }

  /**
   * Webhook de Mercado Pago - SOLO registra notificaciones, NO crea pedidos
   */
  async handleMercadoPagoWebhook(req, res) {
    try {
      console.log(
        "Webhook MercadoPago recibido:",
        JSON.stringify(req.body, null, 2),
        "Query params:",
        req.query
      );

      let paymentId = null;
      let notificationType = null;

      // Handle different webhook formats
      if (req.body.action && req.body.data && req.body.data.id) {
        paymentId = req.body.data.id;
        notificationType = req.body.action;
      } else if (req.query.id && req.query.topic) {
        paymentId = req.query.id;
        notificationType = req.query.topic;
      } else if (req.query["data.id"]) {
        paymentId = req.query["data.id"];
        notificationType = req.query.type;
      } else if (req.body.resource && req.body.topic === "payment") {
        paymentId = req.body.resource;
        notificationType = "payment";
      }

      console.log(
        `Webhook procesando - Tipo: ${notificationType}, Payment ID: ${paymentId}`
      );

      if (
        paymentId &&
        (notificationType === "payment.created" ||
          notificationType === "payment.updated" ||
          notificationType === "payment")
      ) {
        const statusResult = await MercadoPagoService.getPaymentStatus(
          paymentId
        );
        console.log(`Estado del pago ${paymentId}:`, statusResult.status);

        // WEBHOOK NO CREA PEDIDOS - solo loguea para monitoreo
        if (statusResult.success && statusResult.status === "approved") {
          console.log(
            `✅ Pago ${paymentId} aprobado - Pedido debe ser creado por el frontend`
          );
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Error en webhook Mercado Pago:", error);
      res.status(500).send("Error");
    }
  }

  /**
   * Verifica el estado de un pago con Mercado Pago
   */
  async checkMercadoPagoPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return res.status(400).json({ message: "ID de pago requerido" });
      }

      const statusResult = await MercadoPagoService.getPaymentStatus(paymentId);

      if (!statusResult.success) {
        return res.status(400).json({
          message: "Error al consultar estado del pago con Mercado Pago",
          error: statusResult.error,
        });
      }

      res.json({
        success: true,
        status: statusResult.status,
        statusDetail: statusResult.statusDetail,
        amount: statusResult.amount,
        currency: statusResult.currency,
        externalReference: statusResult.externalReference,
      });
    } catch (error) {
      console.error("Error al verificar estado del pago:", error);
      res.status(500).json({
        message: "Error al verificar estado del pago con Mercado Pago",
        error: error.message,
      });
    }
  }
}

export default new PaymentController();
