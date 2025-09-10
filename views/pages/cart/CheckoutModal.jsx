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
  initialStep = "confirmation",
  orderId: propOrderId,
}) {
  const { clearCart, closeCart } = useCart();

  // Estados del flujo
  const [step, setStep] = useState(initialStep);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Estados de dirección
  const [addressData] = useState(address || "");
  const [shippingCost] = useState(shipping);
  const [isValidAddress] = useState(!!address);

  // Estados del pedido
  const [orderId, setOrderId] = useState(propOrderId || null);

  // Estados Mercado Pago
  const [preferenceId, setPreferenceId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "es-CO" });
    }
  }, [publicKey]);

  // Verificar si hay parámetros de pago al montar el componente
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const collectionId = urlParams.get("collection_id");
    const paymentReturn = urlParams.get("payment_return");
    const collectionStatus = urlParams.get("collection_status");

    if (collectionId && paymentReturn && collectionStatus === "approved") {
      console.log(
        "Detectado retorno exitoso de MercadoPago, procesando pedido..."
      );

      // Ir directamente al paso de procesamiento y crear el pedido
      setStep("payment");
      setPaymentStatus("approved");

      // Crear el pedido inmediatamente
      createOrderAfterPayment(collectionId);
    } else if (collectionId && paymentReturn && step === "confirmation") {
      // Si hay parámetros pero el pago no está aprobado, ir al paso de pago
      console.log("Detectado retorno de MercadoPago, cambiando a paso de pago");
      setStep("payment");
      startPaymentStatusCheck();
    }
  }, [step]);

  // Crear preferencia de MercadoPago sin crear el pedido aún
  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Guardar datos del carrito temporalmente para el hook detector
      const pendingPaymentData = {
        items: cartItems.map((item) => ({
          id: item.id,
          price: item.price,
          cantidad: item.cantidad,
          nameProduct: item.nameProduct,
        })),
        deliveryAddress: addressData,
        shippingCost: shippingCost,
      };

      localStorage.setItem(
        "pendingPaymentData",
        JSON.stringify(pendingPaymentData)
      );
      console.log("Saved pending payment data:", pendingPaymentData);

      // Crear solo la preferencia de pago con los datos del carrito
      const additionalItems = [];

      // Solo agregar IVA si es mayor a 0
      if (taxes > 0) {
        additionalItems.push({
          title: "IVA (19%)",
          quantity: 1,
          unit_price: taxes,
          description: "Impuesto sobre las ventas",
        });
      }

      // Solo agregar envío si es mayor a 0
      if (shippingCost > 0) {
        additionalItems.push({
          title: "Envío",
          quantity: 1,
          unit_price: shippingCost,
          description: "Costo de envío a domicilio",
        });
      }

      const paymentData = {
        items: cartItems.map((item) => ({
          title: item.nameProduct,
          quantity: item.cantidad,
          unit_price: item.price,
          description: item.description || "",
        })),
        additionalItems: additionalItems,
        amount: total,
        description: `Pedido LoveBites Bakery`,
        deliveryAddress: addressData,
      };

      console.log("Creando preferencia de pago:", paymentData);

      const paymentResponse = await PaymentService.createMercadoPagoPreference(
        paymentData
      );

      if (!paymentResponse.success) {
        throw new Error("Error al crear preferencia de pago");
      }

      setPreferenceId(paymentResponse.preferenceId);

      if (paymentResponse.init_point) {
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

      // Limpiar datos temporales si hay error
      localStorage.removeItem("pendingPaymentData");
    } finally {
      setIsProcessing(false);
    }
  };

  // Monitorear estado del pago y crear pedido cuando se complete
  const startPaymentStatusCheck = () => {
    if (statusCheckInterval) clearInterval(statusCheckInterval);

    const interval = setInterval(async () => {
      try {
        // Verificar si hay un collection_id en la URL (indica que volvió de MercadoPago)
        const urlParams = new URLSearchParams(window.location.search);
        const collectionId = urlParams.get("collection_id");
        const paymentStatus = urlParams.get("collection_status");

        if (collectionId) {
          console.log("Detectado pago:", { collectionId, paymentStatus });

          if (paymentStatus === "approved") {
            clearInterval(interval);
            setPaymentStatus("approved");
            await createOrderAfterPayment(collectionId);
            return;
          }

          // Verificar el estado del pago
          const statusResponse = await PaymentService.checkMercadoPagoStatus(
            collectionId
          );

          if (statusResponse.success) {
            setPaymentStatus(statusResponse.status);

            if (statusResponse.status === "approved") {
              clearInterval(interval);
              await createOrderAfterPayment(collectionId);
            } else if (
              ["rejected", "cancelled", "refunded"].includes(
                statusResponse.status
              )
            ) {
              clearInterval(interval);
              setPaymentError(`Pago ${statusResponse.status}`);
            }
          }
        }
      } catch (error) {
        console.error("Error al verificar estado de pago:", error);
      }
    }, 3000);

    setStatusCheckInterval(interval);
  };

  // Crear pedido después de que el pago sea exitoso
  const createOrderAfterPayment = async (paymentId) => {
    try {
      setIsProcessing(true);
      console.log("Creating order after payment with payment ID:", paymentId);

      // Crear el pedido en el backend
      const orderData = {
        items: cartItems.map((item) => ({
          id: item.id,
          price: item.price,
          cantidad: item.cantidad,
          nameProduct: item.nameProduct,
        })),
        deliveryAddress: addressData,
        shippingCost: shippingCost,
        paymentId: paymentId,
      };

      console.log("Creando pedido después del pago:", orderData);

      const createOrderResponse = await PaymentService.createOrderAfterPayment(
        orderData
      );

      if (!createOrderResponse.success) {
        throw new Error(
          createOrderResponse.message || "Error al crear el pedido"
        );
      }

      console.log("Order created successfully:", createOrderResponse);
      setOrderId(createOrderResponse.orderId);

      handlePaymentComplete();
    } catch (error) {
      console.error("Error al crear pedido después del pago:", error);
      setPaymentError(
        "Error al procesar el pedido después del pago: " + error.message
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Limpiar intervalos
  useEffect(() => {
    return () => {
      if (statusCheckInterval) clearInterval(statusCheckInterval);
    };
  }, [statusCheckInterval]);

  // Pago completado
  const handlePaymentComplete = () => {
    setIsProcessing(false);
    setStep("success");
    clearCart();

    localStorage.removeItem("pendingPaymentData");

    // Limpiar parámetros de la URL
    const url = new URL(window.location);
    url.searchParams.delete("collection_id");
    url.searchParams.delete("collection_status");
    url.searchParams.delete("payment_id");
    url.searchParams.delete("status");
    url.searchParams.delete("external_reference");
    url.searchParams.delete("payment_type");
    url.searchParams.delete("merchant_order_id");
    url.searchParams.delete("preference_id");
    url.searchParams.delete("site_id");
    url.searchParams.delete("processing_mode");
    url.searchParams.delete("merchant_account_id");
    url.searchParams.delete("payment_return");
    window.history.replaceState({}, document.title, url);
  };

  // Finalizar
  const handleFinish = () => {
    clearCart();
    closeCart();
    onClose();
  };

  // Helpers
  const truncateDescription = (text, maxLength = 30) =>
    !text
      ? ""
      : text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;

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

        {/* Paso 1: Confirmación */}
        {step === "confirmation" && (
          <div className="confirmation-step">
            <div className="step-header">
              <h2>Confirmar Pedido</h2>
              <div className="step-indicator">
                <span className="step active">1</span>
                <span className="step">2</span>
                <span className="step">3</span>
              </div>
            </div>

            <div className="order-summary">
              <h3>Resumen del pedido</h3>
              <div className="order-items">
                {cartItems.map((item) => (
                  <div className="order-item" key={item.id}>
                    <div className="order-item-name">
                      <span className="quantity">{item.cantidad}x</span>
                      <div>
                        <div className="item-name">{item.nameProduct}</div>
                        <small className="item-description">
                          {truncateDescription(item.description)}
                        </small>
                      </div>
                    </div>
                    <div className="order-item-price">
                      ${(item.price * item.cantidad).toLocaleString("es-CO")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="order-total-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString("es-CO")}</span>
                </div>
                <div className="order-total-row">
                  <span>Envío</span>
                  <span>
                    {shippingCost === 0
                      ? "Gratis"
                      : `$${shippingCost.toLocaleString("es-CO")}`}
                  </span>
                </div>
                <div className="order-total-row">
                  <span>IVA (19%)</span>
                  <span>${taxes.toLocaleString("es-CO")}</span>
                </div>
                <div className="order-total-row total">
                  <span>Total</span>
                  <span>${total.toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>

            <div className="delivery-info">
              <h3>Información de entrega</h3>
              <div className="address-card">
                <div className="address-icon">📍</div>
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
              <button className="cancel-order-btn" onClick={onClose}>
                Cancelar
              </button>
              <button
                className="confirm-order-btn"
                onClick={handleConfirmOrder}
                disabled={!isValidAddress || !addressData || isProcessing}
              >
                {isProcessing ? (
                  <div className="btn-loading">
                    <div className="spinner"></div>
                    Ir a pagar...
                  </div>
                ) : (
                  "Ir a pagar"
                )}
              </button>
            </div>

            {paymentError && (
              <div className="payment-error">
                <strong>Error:</strong> {paymentError}
              </div>
            )}
          </div>
        )}

        {/* Paso 2: Esperando pago */}
        {step === "payment" && (
          <div className="payment-step">
            <div className="step-header">
              <h2>Procesando Pago</h2>
              <div className="step-indicator">
                <span className="step completed">✓</span>
                <span className="step active">2</span>
                <span className="step">3</span>
              </div>
            </div>

            <div className="payment-content">
              <div className="payment-info">
                <div className="payment-status-card">
                  <div className="payment-icon">
                    {paymentStatus === "approved" ? (
                      <div className="success-icon-large">✅</div>
                    ) : (
                      <div className="spinner-large"></div>
                    )}
                  </div>
                  {paymentStatus === "approved" ? (
                    <>
                      <h3>¡Pago confirmado!</h3>
                      <p>Creando su pedido, por favor espere...</p>
                    </>
                  ) : (
                    <>
                      <h3>Esperando confirmación de pago</h3>
                      <p>
                        Hemos abierto MercadoPago en una nueva pestaña. Complete
                        su pago y regrese aquí.
                      </p>
                    </>
                  )}
                  <div className="order-summary-mini">
                    <p>
                      Total a pagar:{" "}
                      <strong>${total.toLocaleString("es-CO")} COP</strong>
                    </p>
                  </div>
                </div>
              </div>

              {paymentStatus && (
                <div className={`payment-status ${paymentStatus}`}>
                  {paymentStatus === "pending" && (
                    <div className="status-pending">
                      <div className="status-icon">⏳</div>
                      <p>Procesando pago...</p>
                    </div>
                  )}
                  {paymentStatus === "in_process" && (
                    <div className="status-processing">
                      <div className="status-icon">🔄</div>
                      <p>Pago en proceso, por favor espera</p>
                    </div>
                  )}
                  {paymentStatus === "approved" && (
                    <div className="status-success">
                      <div className="status-icon">✅</div>
                      <p>¡Pago aprobado! Creando su pedido...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {paymentError && (
              <div className="payment-error">
                <strong>Error en el pago:</strong> {paymentError}
                <button
                  className="retry-payment-btn"
                  onClick={() => setStep("confirmation")}
                >
                  Intentar nuevamente
                </button>
              </div>
            )}

            <div className="payment-actions">
              <button
                className="back-btn"
                onClick={() => setStep("confirmation")}
              >
                Volver
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Éxito */}
        {step === "success" && (
          <div className="success-step">
            <div className="step-header">
              <h2>¡Pedido Confirmado!</h2>
              <div className="step-indicator">
                <span className="step completed">✓</span>
                <span className="step completed">✓</span>
                <span className="step completed">✓</span>
              </div>
            </div>

            <div className="success-content">
              <div className="success-icon">
                <div className="checkmark">✓</div>
              </div>

              <div className="success-details">
                <h3>Pedido #{orderId}</h3>
                <p className="success-message">
                  Tu pago ha sido procesado exitosamente y tu pedido ha sido
                  creado
                </p>

                <div className="delivery-summary">
                  <div className="delivery-item">
                    <span className="icon">🚚</span>
                    <div>
                      <strong>Entrega estimada:</strong>
                      <p>{getEstimatedDelivery()}</p>
                    </div>
                  </div>

                  <div className="delivery-item">
                    <span className="icon">📍</span>
                    <div>
                      <strong>Dirección:</strong>
                      <p>{addressData}</p>
                    </div>
                  </div>

                  <div className="delivery-item">
                    <span className="icon">💰</span>
                    <div>
                      <strong>Total pagado:</strong>
                      <p>${total.toLocaleString("es-CO")} COP</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="success-actions">
              <button className="finish-btn" onClick={handleFinish}>
                Finalizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
