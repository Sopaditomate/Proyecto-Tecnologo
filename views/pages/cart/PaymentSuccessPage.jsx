// pages/payment/PaymentSuccessPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PaymentService from "../../../src/services/paymentService.js";
import { useCart } from "../../context/CartContext.jsx";
import { CheckCircle } from "lucide-react";
import "./payment-success.css";

export function PaymentSuccessPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState("loading");
  const [paymentId, setPaymentId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // dropdown perfil

  const { clearCart } = useCart();

  const navigateToProfile = (section = "profile") => {
    setProfileOpen(false);
    navigate("/profile", { state: { activeTab: section } });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const collectionId = urlParams.get("collection_id");
    const collectionStatus = urlParams.get("collection_status");

    console.log("PaymentSuccessPage - Parámetros recibidos:", {
      collectionId,
      collectionStatus,
    });

    if (!collectionId && collectionStatus !== "rejected") {
      setStep("error");
      setPaymentError("No se encontró información del pago");
      return;
    }

    if (collectionId) {
      setPaymentId(collectionId);
    }

    if (collectionStatus === "approved") {
      // Mostrar pantalla de carga por 2 segundos antes de crear pedido
      setStep("creating-order");
      setTimeout(() => {
        createOrderFromPayment(collectionId);
      }, 2000);
    } else if (collectionStatus === "pending") {
      setStep("creating-order");
      setTimeout(() => {
        setStep("payment-pending");
      }, 2000);
    } else if (collectionStatus === "rejected") {
      setStep("payment-failed");
      setPaymentError("El pago fue rechazado");
    } else {
      setStep("payment-failed");
      setPaymentError(`Pago ${collectionStatus}`);
    }
  }, []);

  const createOrderFromPayment = async (collectionId) => {
    if (isCreatingOrder) return;

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

      if (createOrderResponse.duplicate) {
        console.log("Pedido duplicado detectado, usando el existente");
      }

      setOrderId(createOrderResponse.orderId);
      setStep("success");

      // **Limpiar carrito remoto usando el context**
      await clearCart();

      // Limpiar carrito manualmente en localStorage
      localStorage.removeItem("cartItems");
      localStorage.removeItem("pendingOrderData");

      // Limpiar URL después de un tiempo
      setTimeout(() => {
        const url = new URL(window.location);
        url.search = "";
        window.history.replaceState({}, document.title, url);
      }, 1000);
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

  const goToHome = () => {
    // Limpiar datos del localStorage y redirigir al catálogo
    localStorage.removeItem("pendingOrderData");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cart"); // También limpiar el key que usa el CartContext

    // Disparar evento personalizado para que el CartContext se entere
    window.dispatchEvent(new CustomEvent("cartCleared"));

    navigate("/catalogo");
  };

  return (
    <div className="payment-success-overlay">
      <div className="payment-success-container">
        {/* Pantalla de carga - Creando pedido */}
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

        {/* Éxito - Pedido creado */}
        {step === "success" && (
          <div className="success-step">
            <div className="step-header">
              <h2>¡Pedido Confirmado!</h2>
            </div>

            <div className="success-content">
              <div
                className="success-details"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <CheckCircle className="success-icon" />
                <h3>Pedido #{orderId}</h3>
                <p className="success-message">
                  Tu pago fue procesado exitosamente y tu pedido ha sido creado.
                  Recibirás un email de confirmación en breve.
                </p>
                <div className="payment-details">
                  <p>
                    <strong>ID de Pago:</strong> {paymentId}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    <span style={{ color: "green" }}>Preparando pedido</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="success-actions">
              <button
                className="finish-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToProfile("orders");
                }}
                style={{ background: "var(--color-amber-700)" }}
              >
                Ir a Pedidos
              </button>
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
                onClick={goToHome}
                style={{ background: "var(--color-amber-600)" }}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}

        {/* Error */}
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
                onClick={goToHome}
                style={{ background: "var(--color-amber-600)" }}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
