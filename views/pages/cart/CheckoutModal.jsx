"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext.jsx";
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
  };

  // Manejar cancelación del pedido
  const handleCancelOrder = () => {
    onClose();
  };

  // Manejar pago completado
  const handlePaymentComplete = () => {
    setIsProcessing(true);

    // Simular procesamiento de pago
    setTimeout(() => {
      setIsProcessing(false);
      setStep("success");
      clearCart();
    }, 2000);
  };

  // Manejar cierre después de completar el pedido
  const handleFinish = () => {
    closeCart();
    onClose();
  };

  // Generar ID de pedido aleatorio
  const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;

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
                    {shipping === 0 ? "Gratis" : `$${shipping.toFixed(3)}`}
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
              <p>
                <strong>Dirección:</strong> {address}
              </p>
              <p>
                <strong>Tiempo estimado:</strong> 30 minutos
              </p>
            </div>

            <div className="confirmation-actions">
              <button className="cancel-order-btn" onClick={handleCancelOrder}>
                Cancelar
              </button>
              <button
                className="confirm-order-btn"
                onClick={handleConfirmOrder}
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="payment-step">
            <h2>Pago con Nequi</h2>

            <div className="payment-qr-container">
              <div className="qr-code">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png"
                  alt="Código QR de Nequi"
                />
              </div>
              <div className="payment-instructions">
                <h3>Instrucciones:</h3>
                <ol>
                  <li>Abre la app de Nequi en tu celular</li>
                  <li>Selecciona la opción "Pagar"</li>
                  <li>Escanea el código QR</li>
                  <li>Confirma el pago de ${total.toFixed(3)}</li>
                </ol>
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
              <button
                className="complete-payment-btn"
                onClick={handlePaymentComplete}
                disabled={isProcessing}
              >
                {isProcessing ? "Procesando..." : "He completado el pago"}
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
                Se entregará en: <strong>{address}</strong>
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
