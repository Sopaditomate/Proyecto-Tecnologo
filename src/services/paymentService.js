import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:44070/api"

/**
 * Servicio para gestionar pagos
 */
export const PaymentService = {
  /**
   * Inicia un pago con Nequi
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} - Resultado del inicio de pago
   */
  initiateNequiPayment: async (paymentData) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token de autenticación")
      }

      const response = await axios.post(`${API_URL}/payments/nequi/initiate`, paymentData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    } catch (error) {
      console.error("Error al iniciar pago con Nequi:", error)
      throw error
    }
  },

  /**
   * Genera un código QR para pago con Nequi
   * @param {string} orderId - ID del pedido
   * @returns {Promise<Object>} - Datos del QR generado
   */
  generateNequiQR: async (orderId) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token de autenticación")
      }

      const response = await axios.get(`${API_URL}/payments/nequi/qr/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    } catch (error) {
      console.error("Error al generar QR para Nequi:", error)
      throw error
    }
  },

  /**
   * Verifica el estado de un pago
   * @param {string} transactionId - ID de la transacción
   * @returns {Promise<Object>} - Estado del pago
   */
  checkPaymentStatus: async (transactionId) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No hay token de autenticación")
      }

      const response = await axios.get(`${API_URL}/payments/nequi/status/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    } catch (error) {
      console.error("Error al verificar estado del pago:", error)
      throw error
    }
  },
}

export default PaymentService

