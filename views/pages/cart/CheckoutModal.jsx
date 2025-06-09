"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext.jsx";
import PaymentService from "../../../src/services/paymentService.js";
import "./checkout-modal.css";

export function CheckoutModal({
  onClose,
  cartItems,
  subtotal,
  shipping,
  taxes,
  total,
  address,
}) {
  const { clearCart, closeCart } = useCart();

  // Estados para el proceso de checkout
  const [step, setStep] = useState("confirmation"); // confirmation, payment, success
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Estados para la dirección y envío
  const [addressData, setAddress] = useState(address || "");
  const [coordinates, setCoordinates] = useState(null);
  const [shippingCost, setShipping] = useState(shipping);
  // Asumimos que la dirección ya es válida si viene del primer paso
  const [isValidAddress, setIsValidAddress] = useState(!!address);

  // Estados para el pago con Nequi
  const [phoneNumber, setPhoneNumber] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [orderId, setOrderId] = useState(
    `ORD-${Math.floor(Math.random() * 10000)}`
  );
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  // Truncar descripción
  const truncateDescription = (text, maxLength = 30) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Manejar confirmación del pedido
  const handleConfirmOrder = () => {
    setStep("payment");
    generateQRCode();
  };

  // Manejar cancelación del pedido
  const handleCancelOrder = () => {
    onClose();
  };

  // Generar código QR para pago con Nequi
  const generateQRCode = async () => {
    try {
      setIsProcessing(true);
      setPaymentError(null);

      // Simular la creación de un pedido (en producción, esto vendría del backend)
      // En un entorno real, primero crearías el pedido y luego generarías el QR con el ID real

      // Generar QR para el pago
      const qrResponse = await PaymentService.generateNequiQR(orderId);

      if (qrResponse.success) {
        setQrCode(qrResponse.qrImage || qrResponse.qrCode);
        setTransactionId(qrResponse.transactionId);

        // Iniciar verificación periódica del estado del pago
        startPaymentStatusCheck(qrResponse.transactionId);
      } else {
        setPaymentError("No se pudo generar el código QR para el pago");
      }
    } catch (error) {
      console.error("Error al generar QR:", error);
      setPaymentError(
        "Error al generar el código QR: " +
          (error.message || "Error desconocido")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Iniciar verificación periódica del estado del pago
  const startPaymentStatusCheck = (txId) => {
    // Limpiar cualquier intervalo existente
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }

    // Crear nuevo intervalo para verificar el estado cada 5 segundos
    const interval = setInterval(async () => {
      try {
        const statusResponse = await PaymentService.checkPaymentStatus(txId);

        if (statusResponse.success) {
          setPaymentStatus(statusResponse.status);

          // Si el pago fue aprobado, avanzar al paso de éxito
          if (statusResponse.status === "APPROVED") {
            clearInterval(interval);
            handlePaymentComplete();
          }
          // Si el pago fue rechazado o cancelado, mostrar error
          else if (
            ["REJECTED", "CANCELED", "FAILED"].includes(statusResponse.status)
          ) {
            clearInterval(interval);
            setPaymentError(
              `Pago ${
                statusResponse.statusDescription ||
                statusResponse.status.toLowerCase()
              }`
            );
          }
        }
      } catch (error) {
        console.error("Error al verificar estado del pago:", error);
      }
    }, 5000); // Verificar cada 5 segundos

    setStatusCheckInterval(interval);
  };

  // Limpiar intervalo al desmontar el componente
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Manejar pago completado
  const handlePaymentComplete = () => {
    setIsProcessing(false);
    setStep("success");
    clearCart();
  };

  // Manejar cierre después de completar el pedido
  const handleFinish = () => {
    closeCart();
    onClose();
  };

  // Formatear fecha estimada de entrega (30 minutos desde ahora)
  const getEstimatedDelivery = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal">
        <button className="close-modal-btn" onClick={onClose}>
          ×
        </button>

        {step === "confirmation" && (
          <div className="confirmation-step">
            <h2>Confirmar Pedido</h2>

            <div className="order-summary">
              <h3>Resumen del pedido</h3>

              <div className="order-items">
                {cartItems.map((item) => (
                  <div className="order-item" key={item.id}>
                    <div className="order-item-name">
                      <span>{item.cantidad}x</span> {item.nameProduct}
                      <small
                        style={{
                          display: "block",
                          color: "#666",
                          fontSize: "0.8rem",
                        }}
                      >
                        {truncateDescription(item.description)}
                      </small>
                    </div>
                    <div className="order-item-price">
                      ${(item.price * item.cantidad).toFixed(3)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="order-total-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(3)}</span>
                </div>
                <div className="order-total-row">
                  <span>Envío</span>
                  <span>
                    {shippingCost === 0
                      ? "Gratis"
                      : `$${shippingCost.toFixed(0)}`}
                  </span>
                </div>
                <div className="order-total-row">
                  <span>IVA (19%)</span>
                  <span>${taxes.toFixed(3)}</span>
                </div>
                <div className="order-total-row total">
                  <span>Total</span>
                  <span>${total.toFixed(3)}</span>
                </div>
              </div>
            </div>

            <div className="delivery-info">
              <h3>Información de entrega</h3>

              {/* Usamos directamente la dirección del primer paso sin verificación adicional */}
              <div className="selected-address-info">
                <p>
                  <strong>Dirección de entrega:</strong> {addressData}
                </p>
              </div>
            </div>

            <div className="confirmation-actions">
              <button className="cancel-order-btn" onClick={handleCancelOrder}>
                Cancelar
              </button>
              <button
                className="confirm-order-btn"
                onClick={handleConfirmOrder}
                disabled={!isValidAddress || !addressData}
              >
                {!isValidAddress && addressData
                  ? "Dirección inválida"
                  : "Confirmar Pedido"}
              </button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="payment-step">
            <h2>Pago con Nequi</h2>

            <div className="payment-qr-container">
              <div className="qr-code">
                {isProcessing ? (
                  <div className="loading-spinner">Generando código QR...</div>
                ) : qrCode ? (
                  <img
                    src={qrCode || "/placeholder.svg"}
                    alt="Código QR de Nequi"
                    className="nequi-qr-code"
                  />
                ) : (
                  <div className="qr-placeholder">
                    <p>No se pudo cargar el código QR</p>
                  </div>
                )}
              </div>
              <div className="payment-instructions">
                <h3>Instrucciones:</h3>
                <ol>
                  <li>Abre la app de Nequi en tu celular</li>
                  <li>Selecciona la opción "Pagar"</li>
                  <li>Escanea el código QR</li>
                  <li>Confirma el pago de ${total.toFixed(3)}</li>
                </ol>

                {paymentStatus === "PENDING" && (
                  <div className="payment-status pending">
                    <p>Esperando confirmación del pago...</p>
                    <div className="loading-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                  </div>
                )}

                {paymentError && (
                  <div className="payment-error">
                    <p>{paymentError}</p>
                    <button
                      className="retry-payment-btn"
                      onClick={generateQRCode}
                      disabled={isProcessing}
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="payment-actions">
              <button
                className="cancel-payment-btn"
                onClick={() => setStep("confirmation")}
                disabled={isProcessing}
              >
                Volver
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="success-step">
            <div className="success-icon">✓</div>
            <h2>¡Pedido Confirmado!</h2>

            <div className="order-details">
              <p className="order-id">Pedido #{orderId}</p>
              <p className="estimated-delivery">
                Entrega estimada: <strong>{getEstimatedDelivery()}</strong>
              </p>
              <p className="delivery-address">
                Se entregará en: <strong>{addressData}</strong>
              </p>
            </div>

            <p className="thank-you-message">
              Gracias por tu compra. Puedes seguir el estado de tu pedido en la
              sección "Mis Pedidos".
            </p>

            <button className="finish-btn" onClick={handleFinish}>
              Finalizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
