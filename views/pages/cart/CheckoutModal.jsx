"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext.jsx";
import PaymentService from "../../../src/services/paymentService.js";
import "./checkout-modal.css";
import { initMercadoPago } from "@mercadopago/sdk-react";

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

  // Estados del flujo
  const [step, setStep] = useState("confirmation");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Estados de dirección
  const [addressData] = useState(address || "");
  const [shippingCost] = useState(shipping);
  const [isValidAddress] = useState(!!address);

  // Estados del pedido
  const [orderId, setOrderId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

  // Control de procesamiento para evitar duplicados
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Función para formatear precios
  const formatCOP = (amount) => {
    let roundedAmount;
    if (amount >= 10000) {
      roundedAmount = Math.round(amount / 100) * 100;
    } else if (amount >= 1000) {
      roundedAmount = Math.round(amount / 10) * 10;
    } else {
      roundedAmount = Math.round(amount);
    }
    return roundedAmount;
  };

  useEffect(() => {
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "es-CO" });
    }
  }, [publicKey]);

  // Procesar retorno de MercadoPago UNA SOLA VEZ
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const collectionId = urlParams.get("collection_id");
    const collectionStatus = urlParams.get("collection_status");
    const showLoading = urlParams.get("show_loading"); // Nuevo parámetro

    if (collectionId && collectionStatus === "approved" && !isCreatingOrder) {
      console.log("Detectado retorno exitoso de MercadoPago...");
      setPaymentId(collectionId);

      // Si viene con show_loading=true, mostrar pantalla de carga primero
      if (showLoading === "true") {
        console.log("Mostrando pantalla de carga antes de crear pedido...");
        setStep("creating-order");

        // Esperar un poco para que se vea la pantalla antes de crear el pedido
        setTimeout(() => {
          createOrderFromStorage(collectionId);
        }, 1500); // 1.5 segundos de pantalla de carga
      } else {
        // Si no tiene el flag, crear pedido directamente (compatibilidad)
        setStep("creating-order");
        createOrderFromStorage(collectionId);
      }
    } else if (
      collectionId &&
      collectionStatus === "pending" &&
      !isCreatingOrder
    ) {
      console.log("Pago pendiente detectado...");
      setPaymentId(collectionId);

      if (showLoading === "true") {
        setStep("creating-order");
        // Para pagos pendientes, también mostrar la pantalla de carga
        setTimeout(() => {
          // Aquí podrías manejar pagos pendientes de forma diferente
          setStep("payment-pending");
          setPaymentError(
            "Tu pago está siendo procesado. Te notificaremos cuando sea confirmado."
          );
        }, 1500);
      }
    } else if (collectionId && collectionStatus !== "approved") {
      console.log(`Pago no exitoso: ${collectionStatus}`);
      setStep("payment-failed");
      setPaymentError(`Pago ${collectionStatus}`);
    }
  }, [isCreatingOrder]);

  // Crear preferencia y redirigir a MercadoPago
  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Guardar datos del carrito en localStorage
      const orderData = {
        items: cartItems.map((item) => ({
          id: item.id,
          price: formatCOP(item.price),
          cantidad: item.cantidad,
          nameProduct: item.nameProduct,
        })),
        deliveryAddress: addressData,
        shippingCost: formatCOP(shippingCost),
      };

      localStorage.setItem("pendingOrderData", JSON.stringify(orderData));

      // Crear solo la preferencia de pago
      const additionalItems = [];

      if (taxes > 0) {
        additionalItems.push({
          title: "IVA (19%)",
          quantity: 1,
          unit_price: formatCOP(taxes),
          description: "Impuesto sobre las ventas",
        });
      }

      if (shippingCost > 0) {
        additionalItems.push({
          title: "Envío",
          quantity: 1,
          unit_price: formatCOP(shippingCost),
          description: "Costo de envío a domicilio",
        });
      }

      const paymentData = {
        items: cartItems.map((item) => ({
          title: item.nameProduct,
          quantity: item.cantidad,
          unit_price: formatCOP(item.price),
          description: item.description || "",
        })),
        additionalItems: additionalItems,
        amount: formatCOP(total),
        description: `Pedido LoveBites Bakery`,
        deliveryAddress: addressData,
      };

      const paymentResponse = await PaymentService.createMercadoPagoPreference(
        paymentData
      );

      if (!paymentResponse.success) {
        throw new Error("Error al crear preferencia de pago");
      }

      // Redirigir a MercadoPago
      if (paymentResponse.init_point) {
        console.log("Redirigiendo a MercadoPago...");
        window.location.href = paymentResponse.init_point;
      } else {
        throw new Error("No se encontró la URL de pago");
      }
    } catch (error) {
      console.error("Error al confirmar pedido:", error);
      setPaymentError(
        error.response?.data?.message ||
          error.message ||
          "Error al procesar el pedido"
      );
      localStorage.removeItem("pendingOrderData");
    } finally {
      setIsProcessing(false);
    }
  };

  // Crear pedido DESPUÉS del pago exitoso - CON PROTECCIÓN CONTRA DUPLICADOS
  const createOrderFromStorage = async (collectionId) => {
    if (isCreatingOrder) {
      console.log("Ya se está creando un pedido, saltando...");
      return;
    }

    setIsCreatingOrder(true);

    try {
      const savedData = localStorage.getItem("pendingOrderData");

      if (!savedData) {
        throw new Error("No se encontraron datos del pedido guardados");
      }

      const orderData = JSON.parse(savedData);
      orderData.paymentId = collectionId;

      console.log("Creando pedido después del pago exitoso:", orderData);

      const createOrderResponse = await PaymentService.createOrderAfterPayment(
        orderData
      );

      if (!createOrderResponse.success) {
        throw new Error(
          createOrderResponse.message || "Error al crear el pedido"
        );
      }

      // Si es duplicado, no es error
      if (createOrderResponse.duplicate) {
        console.log("Pedido duplicado detectado, usando el existente");
      }

      setOrderId(createOrderResponse.orderId);
      setStep("success");
      clearCart();
      localStorage.removeItem("pendingOrderData");

      // Limpiar URL
      const url = new URL(window.location);
      url.search = "";
      window.history.replaceState({}, document.title, url);
    } catch (error) {
      console.error("Error al crear pedido:", error);
      setPaymentError(
        "Error al procesar el pedido después del pago: " + error.message
      );
      setStep("error");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Finalizar y cerrar modal
  const handleFinish = () => {
    clearCart();
    closeCart();
    onClose();
  };

  // Helper para truncar descripción
  const truncateDescription = (text, maxLength = 30) =>
    !text
      ? ""
      : text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal">
        <button className="close-modal-btn" onClick={onClose}>
          ×
        </button>

        {/* Confirmación del pedido */}
        {step === "confirmation" && (
          <div className="confirmation-step">
            <div className="step-header">
              <h2>Confirmar Pedido</h2>
              <p className="step-description">
                Tu pedido se creará solo después del pago exitoso
              </p>
            </div>

            <div className="order-summary">
              <h3>Resumen del pedido</h3>
              <div className="order-items">
                {cartItems.map((item) => (
                  <div className="order-item" key={item.id}>
                    <div className="order-item-name">
                      <span
                        className="quantity"
                        style={{ background: "var(--color-amber-600)" }}
                      >
                        {item.cantidad}x
                      </span>
                      <div>
                        <div className="item-name">{item.nameProduct}</div>
                        <small className="item-description">
                          {truncateDescription(item.description)}
                        </small>
                      </div>
                    </div>
                    <div className="order-item-price">
                      $
                      {formatCOP(item.price * item.cantidad).toLocaleString(
                        "es-CO"
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="order-total-row">
                  <span>Subtotal</span>
                  <span>${formatCOP(subtotal).toLocaleString("es-CO")}</span>
                </div>
                <div className="order-total-row">
                  <span>Envío</span>
                  <span>
                    {shippingCost === 0
                      ? "Gratis"
                      : `$${formatCOP(shippingCost).toLocaleString("es-CO")}`}
                  </span>
                </div>
                <div className="order-total-row">
                  <span>IVA (19%)</span>
                  <span>${formatCOP(taxes).toLocaleString("es-CO")}</span>
                </div>
                <div className="order-total-row total">
                  <span>Total</span>
                  <span>${formatCOP(total).toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>

            <div className="delivery-info">
              <h3>Información de entrega</h3>
              <div className="address-card">
                <div className="address-text">
                  <strong>Dirección de entrega:</strong>
                  <p>{addressData}</p>
                </div>
              </div>
            </div>

            <div className="payment-method-section">
              <h3>Método de pago</h3>
              <div className="payment-method-card selected">
                <img
                  src="https://http2.mlstatic.com/storage/logos-api-admin/0daa1670-5c81-11ec-ae75-df2bef173be2-xl@2x.png"
                  alt="Mercado Pago"
                  className="mp-logo"
                />
                <div>
                  <strong>Mercado Pago</strong>
                  <p>Pago seguro con tarjeta o efectivo</p>
                </div>
              </div>
            </div>

            <div className="confirmation-actions">
              <button
                className="confirm-order-btn"
                onClick={onClose}
                style={{ background: "rgb(230, 6, 6)" }}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                className="confirm-order-btn"
                style={{ background: "var(--color-amber-600)" }}
                onClick={handleConfirmOrder}
                disabled={!isValidAddress || !addressData || isProcessing}
              >
                {isProcessing ? "Procesando..." : "Ir a Pagar"}
              </button>
            </div>

            {paymentError && (
              <div className="payment-error">
                <strong>Error:</strong> {paymentError}
              </div>
            )}
          </div>
        )}

        {/* Creando pedido después del pago */}
        {step === "creating-order" && (
          <div className="payment-step">
            <div className="step-header">
              <h2>¡Pago Exitoso!</h2>
            </div>

            <div className="payment-content">
              <div className="payment-status-card">
                <div className="spinner-large"></div>
                <h3>Creando tu pedido...</h3>
                <p>
                  Tu pago fue procesado exitosamente. Estamos creando tu pedido.
                </p>
                <div className="order-summary-mini">
                  <p>
                    <strong>ID de Pago:</strong> {paymentId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pago pendiente */}
        {step === "payment-pending" && (
          <div className="payment-step">
            <div className="step-header">
              <h2>Pago Pendiente</h2>
            </div>

            <div className="payment-content">
              <div className="payment-status-card">
                <div className="pending-icon">⏳</div>
                <h3>Tu pago está siendo procesado</h3>
                <p>Recibirás una notificación cuando el pago sea confirmado.</p>
                <div className="order-summary-mini">
                  <p>
                    <strong>ID de Pago:</strong> {paymentId}
                  </p>
                </div>
              </div>
            </div>

            <div className="pending-actions">
              <button
                className="finish-btn"
                onClick={handleFinish}
                style={{ background: "var(--color-amber-600)" }}
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Error al procesar */}
        {(step === "error" || step === "payment-failed") && (
          <div className="error-step">
            <div className="step-header">
              <h2>
                {step === "payment-failed"
                  ? "Pago No Exitoso"
                  : "Error al Procesar"}
              </h2>
            </div>

            <div className="error-content">
              <div className="error-message">
                <div className="error-icon">❌</div>
                <h3>
                  {step === "payment-failed"
                    ? "Tu pago no pudo ser procesado"
                    : "Ocurrió un problema"}
                </h3>
                <p>{paymentError}</p>
                {step === "payment-failed" && (
                  <p>No se creó ningún pedido. Puedes intentar nuevamente.</p>
                )}
              </div>
            </div>

            <div className="error-actions">
              <button
                className="retry-btn"
                onClick={() => {
                  setStep("confirmation");
                  setPaymentError(null);
                  localStorage.removeItem("pendingOrderData");
                }}
                style={{ background: "var(--color-amber-600)" }}
              >
                Intentar Nuevamente
              </button>
            </div>
          </div>
        )}

        {/* Éxito */}
        {step === "success" && (
          <div className="success-step">
            <div className="step-header">
              <h2>¡Pedido Confirmado!</h2>
            </div>

            <div className="success-content">
              <div className="success-details">
                <div className="success-icon">✅</div>
                <h3>Pedido #{orderId}</h3>
                <p className="success-message">
                  Tu pago fue procesado exitosamente y tu pedido ha sido creado.
                  Recibirás un email de confirmación en breve.
                </p>

                <div className="delivery-summary">
                  <div className="delivery-item">
                    <div>
                      <strong>Dirección de entrega:</strong>
                      <p>{addressData}</p>
                    </div>
                  </div>

                  <div className="delivery-item">
                    <div>
                      <strong>Estado:</strong>
                      <p style={{ color: "green" }}>Preparando pedido</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="success-actions">
              <button
                className="finish-btn"
                onClick={handleFinish}
                style={{ background: "var(--color-amber-700)" }}
              >
                Finalizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
