import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const CLIENT_URL = process.env.CLIENT_URL;

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  },
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

export default {
  async createPayment({
    amount,
    description,
    orderId,
    items = [],
    additionalItems = [],
  }) {
    try {
      console.log("Datos recibidos en MercadoPago service:", {
        amount,
        orderId,
        items,
        additionalItems,
      });

      let preferenceItems = [];

      // Add main product items
      if (items.length > 0) {
        preferenceItems = items.map((item) => {
          const unitPrice = Number.parseFloat(
            item.unit_price || item.price || item.final_price || 0
          );
          const quantity = Number.parseInt(item.quantity || item.cantidad || 1);

          console.log("Procesando item:", {
            title: item.title || item.nameProduct || item.product_name,
            unitPrice,
            quantity,
            originalItem: item,
          });

          return {
            title:
              item.title ||
              item.nameProduct ||
              item.product_name ||
              `Producto ${item.id}`,
            unit_price: unitPrice,
            quantity: quantity,
            currency_id: "COP",
            description: item.description || "",
          };
        });
      }

      if (additionalItems.length > 0) {
        additionalItems.forEach((item) => {
          preferenceItems.push({
            title: item.title,
            unit_price: Number.parseFloat(item.unit_price),
            quantity: item.quantity || 1,
            currency_id: "COP",
            description: item.description || "",
          });
        });
      }

      // Fallback if no items provided
      if (preferenceItems.length === 0) {
        preferenceItems = [
          {
            title: description || `Pedido ${orderId}`,
            unit_price: Number.parseFloat(amount || 0),
            quantity: 1,
            currency_id: "COP",
          },
        ];
      }

      // Validar que todos los precios sean válidos
      for (const item of preferenceItems) {
        if (item.unit_price <= 0) {
          throw new Error(
            `Precio inválido para el item: ${item.title}. Precio: ${item.unit_price}`
          );
        }
      }

      console.log("Items preparados para MercadoPago:", preferenceItems);

      const preference = {
        items: preferenceItems,
        back_urls: {
          success: `${CLIENT_URL}/payments/mercado-pago/success`,
          failure: `${CLIENT_URL}/payments/mercado-pago/failure`,
          pending: `${CLIENT_URL}/payments/mercado-pago/pending`,
        },
        auto_return: "approved",
        external_reference: orderId.toString(),
        notification_url: `${CLIENT_URL}/payments/mercado-pago/webhook`,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        payment_methods: {
          excluded_payment_types: [],
          installments: 12, // Permitir hasta 12 cuotas
        },
        shipments: {
          cost: 0, // Shipping cost is included in items
          mode: "not_specified",
        },
        payer: {
          name: "Cliente",
          surname: "LoveBites",
          email: "cliente@lovebites.com",
        },
      };

      console.log(
        "Preferencia enviada a MercadoPago:",
        JSON.stringify(preference, null, 2)
      );

      const result = await preferenceClient.create({ body: preference });

      const isDev = process.env.NODE_ENV;

      return {
        success: true,
        preferenceId: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.init_point,
      };
    } catch (error) {
      console.error("Error al crear preferencia de Mercado Pago:", error);
      return {
        success: false,
        error: error.message,
        details: error.cause || error,
      };
    }
  },

  async getPaymentStatus(paymentId) {
    try {
      const result = await paymentClient.get({ id: paymentId });

      return {
        success: true,
        status: result.status,
        statusDetail: result.status_detail,
        amount: result.transaction_amount,
        currency: result.currency_id,
        paymentMethod: result.payment_method_id,
        paymentType: result.payment_type_id,
        dateCreated: result.date_created,
        dateApproved: result.date_approved,
        externalReference: result.external_reference,
        merchantOrder: result.merchant_order_id,
      };
    } catch (error) {
      console.error("Error al obtener el estado del pago:", error);
      return {
        success: false,
        error: error.message,
        details: error.cause || error,
      };
    }
  },

  async searchPaymentsByExternalReference(externalReference) {
    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${externalReference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.results && data.results.length > 0) {
        return {
          success: true,
          payments: data.results,
        };
      }

      return {
        success: false,
        error: "No payments found for this external reference",
      };
    } catch (error) {
      console.error("Error searching payments:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Método para procesar notificaciones de webhook
  async processWebhookNotification(notificationData) {
    try {
      const { action, data, type } = notificationData;

      if (
        type === "payment" &&
        (action === "payment.created" || action === "payment.updated")
      ) {
        const paymentId = data.id;

        // Obtener información completa del pago
        const paymentInfo = await this.getPaymentStatus(paymentId);

        if (paymentInfo.success) {
          return {
            success: true,
            paymentId: paymentId,
            status: paymentInfo.status,
            statusDetail: paymentInfo.statusDetail,
            amount: paymentInfo.amount,
            externalReference: paymentInfo.externalReference,
          };
        }
      }

      return {
        success: false,
        error: "Notification type not supported or payment not found",
      };
    } catch (error) {
      console.error("Error processing webhook notification:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
