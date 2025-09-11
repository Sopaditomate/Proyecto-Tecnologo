import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const PaymentService = {
  /**
   * Crear una preferencia de MercadoPago sin crear el pedido
   */
  createMercadoPagoPreference: async (paymentData) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/mercado-pago/create-preference`,
        paymentData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear preferencia de pago:", error);
      throw {
        message:
          error.response?.data?.message || "Error al crear preferencia de pago",
        status: error.response?.status,
        data: error.response?.data,
      };
    }
  },

  /**
   * Crear un pedido después de que el pago sea exitoso
   */
  createOrderAfterPayment: async (orderData) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/create-order-after-payment`,
        orderData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear pedido después del pago:", error);
      throw {
        message:
          error.response?.data?.message ||
          "Error al crear pedido después del pago",
        status: error.response?.status,
        data: error.response?.data,
      };
    }
  },

  /**
   * Crear un pedido en el backend antes de iniciar el pago (método legacy)
   */
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/create-order`,
        orderData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear pedido:", error);
      throw {
        message: error.response?.data?.message || "Error al crear pedido",
        status: error.response?.status,
        data: error.response?.data,
      };
    }
  },

  /**
   * Inicia un pago con Mercado Pago (método legacy)
   */
  initiateMercadoPagoPayment: async (paymentData) => {
    try {
      const response = await axios.post(
        `${API_URL}/payments/mercado-pago/initiate`,
        paymentData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al iniciar pago con Mercado Pago:", error);
      throw {
        message:
          error.response?.data?.message ||
          "Error al iniciar pago con Mercado Pago",
        status: error.response?.status,
        data: error.response?.data,
      };
    }
  },

  /**
   * Verifica el estado de un pago con Mercado Pago
   */
  checkMercadoPagoStatus: async (paymentId) => {
    try {
      const response = await axios.get(
        `${API_URL}/payments/mercado-pago/status/${paymentId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error al verificar estado del pago con Mercado Pago:",
        error
      );
      throw {
        message:
          error.response?.data?.message || "Error al verificar estado del pago",
        status: error.response?.status,
        data: error.response?.data,
      };
    }
  },

  /**
   * Método utilitario para manejar respuestas de Mercado Pago desde URL
   */
  handleMercadoPagoReturn: (urlParams) => {
    const paymentId =
      urlParams.get("collection_id") || urlParams.get("payment_id");
    const status =
      urlParams.get("collection_status") || urlParams.get("status");
    const orderId = urlParams.get("external_reference");

    return {
      paymentId,
      status,
      orderId,
      isSuccess: status === "approved",
      isPending: status === "pending" || status === "in_process",
      isFailure: status === "rejected" || status === "cancelled",
    };
  },
};

export default PaymentService;
