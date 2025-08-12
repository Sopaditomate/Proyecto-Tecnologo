import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

// Configuración de la API de Nequi
const NEQUI_API_URL = process.env.NEQUI_API_URL || "https://api.sandbox.nequi.com/payments/v2"
const NEQUI_API_KEY = process.env.NEQUI_API_KEY
const NEQUI_SECRET_KEY = process.env.NEQUI_SECRET_KEY
const NEQUI_CALLBACK_URL = process.env.NEQUI_CALLBACK_URL || "https://tu-dominio.com/api/payments/nequi/callback"

// Configuración del cliente HTTP para Nequi
const nequiClient = axios.create({
  baseURL: NEQUI_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`${NEQUI_API_KEY}:${NEQUI_SECRET_KEY}`).toString("base64")}`,
  },
})

class NequiService {
  /**
   * Inicia un pago con Nequi
   * @param {Object} paymentData - Datos del pago
   * @param {string} paymentData.phoneNumber - Número de teléfono del cliente
   * @param {number} paymentData.amount - Monto a pagar
   * @param {string} paymentData.reference - Referencia del pago (ID del pedido)
   * @returns {Promise<Object>} - Respuesta de la API de Nequi
   */
  async initiatePayment(paymentData) {
    try {
      const { phoneNumber, amount, reference } = paymentData

      // Validar datos
      if (!phoneNumber || !amount || !reference) {
        throw new Error("Datos de pago incompletos")
      }

      // Formatear el número de teléfono (eliminar espacios y caracteres especiales)
      const formattedPhone = phoneNumber.replace(/\D/g, "")

      // Si el número no comienza con 57 (código de Colombia), agregarlo
      const fullPhoneNumber = formattedPhone.startsWith("57") ? formattedPhone : `57${formattedPhone}`

      // Crear la solicitud de pago
      const payload = {
        RequestMessage: {
          RequestHeader: {
            Channel: "PNP04-C001",
            RequestDate: new Date().toISOString(),
            MessageID: `${Date.now()}`,
            ClientID: NEQUI_API_KEY,
          },
          RequestBody: {
            any: {
              PaymentRequest: {
                Phone: fullPhoneNumber,
                Code: "1", // Código de la transacción (1 para pagos)
                Amount: amount,
                Reference: reference,
                CallbackURL: NEQUI_CALLBACK_URL,
              },
            },
          },
        },
      }

      console.log("Iniciando pago con Nequi:", JSON.stringify(payload, null, 2))

      // Enviar solicitud a Nequi
      const response = await nequiClient.post("/transactions", payload)

      console.log("Respuesta de Nequi:", JSON.stringify(response.data, null, 2))

      return {
        success: true,
        data: response.data,
        transactionId: response.data?.ResponseMessage?.ResponseBody?.any?.PaymentResponse?.TransactionID || null,
        status: response.data?.ResponseMessage?.ResponseBody?.any?.PaymentResponse?.Status || null,
        qrCode: response.data?.ResponseMessage?.ResponseBody?.any?.PaymentResponse?.QRCode || null,
      }
    } catch (error) {
      console.error("Error al iniciar pago con Nequi:", error)

      return {
        success: false,
        error: error.message,
        details: error.response?.data || null,
      }
    }
  }

  /**
   * Consulta el estado de un pago
   * @param {string} transactionId - ID de la transacción
   * @returns {Promise<Object>} - Estado del pago
   */
  async checkPaymentStatus(transactionId) {
    try {
      if (!transactionId) {
        throw new Error("ID de transacción no proporcionado")
      }

      const payload = {
        RequestMessage: {
          RequestHeader: {
            Channel: "PNP04-C001",
            RequestDate: new Date().toISOString(),
            MessageID: `${Date.now()}`,
            ClientID: NEQUI_API_KEY,
          },
          RequestBody: {
            any: {
              GetStatusRequest: {
                TransactionID: transactionId,
              },
            },
          },
        },
      }

      const response = await nequiClient.post("/transactions/status", payload)

      return {
        success: true,
        data: response.data,
        status: response.data?.ResponseMessage?.ResponseBody?.any?.GetStatusResponse?.Status || null,
        statusDescription: response.data?.ResponseMessage?.ResponseBody?.any?.GetStatusResponse?.StatusDesc || null,
      }
    } catch (error) {
      console.error("Error al consultar estado de pago:", error)

      return {
        success: false,
        error: error.message,
        details: error.response?.data || null,
      }
    }
  }

  /**
   * Genera un código QR para pago
   * @param {Object} qrData - Datos para el QR
   * @param {number} qrData.amount - Monto a pagar
   * @param {string} qrData.reference - Referencia del pago
   * @returns {Promise<Object>} - Datos del QR generado
   */
  async generateQRCode(qrData) {
    try {
      const { amount, reference } = qrData

      if (!amount || !reference) {
        throw new Error("Datos incompletos para generar QR")
      }

      const payload = {
        RequestMessage: {
          RequestHeader: {
            Channel: "PNP04-C001",
            RequestDate: new Date().toISOString(),
            MessageID: `${Date.now()}`,
            ClientID: NEQUI_API_KEY,
          },
          RequestBody: {
            any: {
              GenerateQRRequest: {
                Amount: amount,
                Reference: reference,
              },
            },
          },
        },
      }

      const response = await nequiClient.post("/qr/generate", payload)

      return {
        success: true,
        data: response.data,
        qrImage: response.data?.ResponseMessage?.ResponseBody?.any?.GenerateQRResponse?.QRImage || null,
        qrCode: response.data?.ResponseMessage?.ResponseBody?.any?.GenerateQRResponse?.QRCode || null,
        transactionId: response.data?.ResponseMessage?.ResponseBody?.any?.GenerateQRResponse?.TransactionID || null,
      }
    } catch (error) {
      console.error("Error al generar código QR:", error)

      return {
        success: false,
        error: error.message,
        details: error.response?.data || null,
      }
    }
  }
}

export default new NequiService()

