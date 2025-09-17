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
   * Crear pedido después de que el pago sea exitoso
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
          message: "El pago no está aprobado",
        });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        let subtotal = 0;
        for (const item of items) {
          subtotal += item.price * item.cantidad;
        }
        const tax = subtotal * 0.19; // IVA 19%
        const totalAmount = subtotal + tax + shippingCost;

        console.log(
          `Creando pedido después del pago - Subtotal: ${subtotal}, Tax: ${tax}, Shipping: ${shippingCost}, Total: ${totalAmount}`
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

        res.json({
          success: true,
          orderId,
          subtotal,
          tax,
          shippingCost,
          totalAmount,
          message: "Pedido creado correctamente después del pago",
        });

        await sendOrderUpdateEmail(orderId, 300001);
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
   * Webhook de Mercado Pago - Recibe notificaciones IPN
   */
  async handleMercadoPagoWebhook(req, res) {
    try {
      console.log(
        "Notificación Mercado Pago:",
        JSON.stringify(req.body, null, 2)
      );
      console.log("Query params:", req.query);

      let paymentId = null;
      let notificationType = null;

      // Handle new webhook format (from logs)
      if (req.body.action && req.body.data && req.body.data.id) {
        paymentId = req.body.data.id;
        notificationType = req.body.action;
      }
      // Handle query parameter format (from logs)
      else if (req.query.id && req.query.topic) {
        paymentId = req.query.id;
        notificationType = req.query.topic;
      }
      // Handle data.id format (from logs)
      else if (req.query["data.id"]) {
        paymentId = req.query["data.id"];
        notificationType = req.query.type;
      }
      // Handle resource URL format
      else if (req.body.resource && req.body.topic === "payment") {
        paymentId = req.body.resource;
        notificationType = "payment";
      }

      console.log(
        `[v1] Processing notification - Type: ${notificationType}, Payment ID: ${paymentId}`
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

        console.log(`[v1] Payment status result:`, statusResult);

        if (statusResult.success) {
          const connection = await pool.getConnection();
          try {
            await connection.beginTransaction();

            if (
              statusResult.status === "approved" &&
              statusResult.externalReference
            ) {
              const orderId = statusResult.externalReference;
              console.log(
                `[v1] Processing approved payment for order: ${orderId}`
              );

              // Solo actualizar si el orderId no es temporal
              if (!orderId.startsWith("TEMP-")) {
                // Update order status to "Preparando" (300001)
                const [orderUpdateResult] = await connection.query(
                  "UPDATE order_header SET id_order_status = 300001 WHERE id_order = ?",
                  [orderId]
                );
                console.log(
                  `[v1] Updated order ${orderId} status. Affected rows: ${orderUpdateResult.affectedRows}`
                );

                if (orderUpdateResult.affectedRows > 0) {
                  const [orderData] = await connection.query(
                    "SELECT id_user FROM order_header WHERE id_order = ?",
                    [orderId]
                  );

                  if (orderData.length > 0) {
                    await connection.query(
                      `INSERT INTO order_history (id_user, id_order, history_datetime, id_state) 
                       VALUES (?, ?, NOW(), 1)`,
                      [orderData[0].id_user, orderId]
                    );
                    console.log(
                      `[v1] Inserted order history record for order ${orderId}`
                    );
                  }
                }

                const [existingTransaction] = await connection.query(
                  "SELECT id_payment_transaction FROM payment_transaction WHERE id_order = ?",
                  [orderId]
                );

                if (existingTransaction.length > 0) {
                  // Update existing transaction with payment ID and approved status
                  const [updateResult] = await connection.query(
                    `UPDATE payment_transaction
                     SET id_transaction = ?, state = 'APPROVED', update_date = NOW()
                     WHERE id_order = ?`,
                    [paymentId, orderId]
                  );
                  console.log(
                    `[v1] Updated payment transaction. Affected rows: ${updateResult.affectedRows}`
                  );
                } else {
                  console.log(
                    `[v1] No payment transaction found for order ${orderId}`
                  );
                }
              } else {
                console.log(
                  `[v1] Skipping webhook processing for temporary order ID: ${orderId}`
                );
              }
            } else {
              console.log(
                `[v1] Payment not approved or missing external reference. Status: ${statusResult.status}`
              );
            }

            await connection.commit();
          } catch (err) {
            await connection.rollback();
            console.error(`[v1] Database error in webhook:`, err);
            throw err;
          } finally {
            connection.release();
          }
        } else {
          console.error(
            `[v1] Failed to get payment status:`,
            statusResult.error
          );
        }
      } else {
        console.log(
          `[v1] Ignoring notification - Type: ${notificationType}, Payment ID: ${paymentId}`
        );
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Error en webhook Mercado Pago:", error);
      res.status(500).send("Error");
    }
  }

  /**
   * Inicia un pago con Mercado Pago (método legacy)
   */
  async initiateMercadoPagoPayment(req, res) {
    try {
      const { orderId } = req.body;
      const clientId = req.user.clientId;

      if (!clientId) {
        return res
          .status(400)
          .json({ message: "ID de cliente no encontrado en el token" });
      }

      if (!orderId) {
        return res.status(400).json({
          message: "ID de pedido requerido",
        });
      }

      // Obtener detalles del pedido desde la base de datos
      const connection = await pool.getConnection();
      let orderDetails;

      try {
        const [orderRows] = await connection.query(
          `SELECT oh.*, up.first_name, up.last_name 
           FROM order_header oh 
           LEFT JOIN user_profile up ON oh.id_user = up.id_user 
           WHERE oh.id_order = ?`,
          [orderId]
        );

        if (orderRows.length === 0) {
          return res.status(404).json({ message: "Pedido no encontrado" });
        }

        const [detailRows] = await connection.query(
          `SELECT od.*, p.name as product_name, p.description 
           FROM order_detail od 
           LEFT JOIN product p ON od.id_product = p.id_product
           WHERE od.id_order = ?`,
          [orderId]
        );

        orderDetails = {
          order: orderRows[0],
          items: detailRows,
        };
      } finally {
        connection.release();
      }

      // Verificar que el pedido pertenezca al usuario autenticado
      if (orderDetails.order.id_user !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "No tienes permisos para pagar este pedido" });
      }

      const subtotal = orderDetails.items.reduce(
        (sum, item) => sum + item.final_price * item.quantity,
        0
      );
      const tax = subtotal * 0.19;
      const shipping = 5000;

      const paymentData = {
        amount: orderDetails.order.total_amount,
        orderId,
        description: `Pedido #${orderId} - LoveBites Bakery`,
        items: orderDetails.items.map((item) => ({
          title: item.product_name || `Producto ${item.id_product}`,
          quantity: item.quantity,
          unit_price: Number.parseFloat(item.final_price),
          description: item.description || "",
        })),
        additionalItems: [
          {
            title: "IVA (19%)",
            quantity: 1,
            unit_price: tax,
            description: "Impuesto sobre las ventas",
          },
          {
            title: "Envío",
            quantity: 1,
            unit_price: shipping,
            description: "Costo de envío a domicilio",
          },
        ],
      };

      const paymentResult = await MercadoPagoService.createPayment(paymentData);

      if (!paymentResult.success) {
        return res.status(400).json({
          message: "Error al iniciar pago con Mercado Pago",
          error: paymentResult.error,
        });
      }

      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        await conn.query(
          `INSERT INTO payment_transaction
           (id_order, payment_method, amount, reference, id_transaction, state, creation_date)
           VALUES (?, 'MERCADOPAGO', ?, ?, ?, 'PENDING', NOW())`,
          [
            orderId,
            orderDetails.order.total_amount,
            `ORD-${orderId}`,
            paymentResult.preferenceId,
          ]
        );

        await conn.commit();
      } catch (dbError) {
        await conn.rollback();
        throw dbError;
      } finally {
        conn.release();
      }

      res.json({
        success: true,
        message: "Pago iniciado correctamente con Mercado Pago",
        init_point: paymentResult.initPoint,
        sandbox_init_point: paymentResult.sandboxInitPoint,
        preferenceId: paymentResult.preferenceId,
      });
    } catch (error) {
      console.error("Error al iniciar pago con Mercado Pago:", error);
      res.status(500).json({
        message: "Error interno al procesar el pago con Mercado Pago",
        error: error.message,
      });
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
