// views/pages/userProfile/OrderDetailModal.jsx
import React from "react";
import "./OrderDetailModal.css";
import { useCart } from "../../context/CartContext.jsx";
const OrderDetailModal = ({
  show,
  onHide,
  order,
  formatDate,
  formatPrice,
  getStatusClass,
}) => {
  const { cart } = useCart();
  if (!show || !order) return null;

  const dateInfo = formatDate(order.fecha);

  // Calcular subtotales y totales
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );
  const discount = order.items.reduce(
    (sum, item) =>
      sum +
      (Number(item.descuento) > 0
        ? Number(item.precio) *
          Number(item.cantidad) *
          (Number(item.descuento) / 100)
        : 0),
    0
  );
  const shipping = order.envio || 0;
  const finalTotal = order.total;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  return (
    <div className="order-modal-backdrop" onClick={handleBackdropClick}>
      <div className="order-modal">
        <div className="order-modal-header">
          <div className="modal-header-content">
            <h3>Detalles del Pedido</h3>
            <p className="order-date">
              {dateInfo.primary} - {dateInfo.secondary}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onHide}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="order-modal-body">
          {/* Estado del pedido */}
          <div className="order-status-section">
            <h4>Estado del Pedido</h4>
            <span
              className={`order-status-badge ${getStatusClass(order.estado)}`}
            >
              {order.estado}
            </span>

            {/* Barra de progreso del pedido */}
            <div className="order-progress">
              <div className="progress-steps">
                <div
                  className={`progress-step ${
                    [
                      "recepción",
                      "preparando",
                      "empaquetado",
                      "envio",
                      "entregado",
                    ].indexOf(order.estado.toLowerCase()) >= 0
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="step-circle">1</div>
                  <span>Recepción</span>
                </div>
                <div
                  className={`progress-step ${
                    ["preparando", "empaquetado", "envio", "entregado"].indexOf(
                      order.estado.toLowerCase()
                    ) >= 0
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="step-circle">2</div>
                  <span>Preparando</span>
                </div>
                <div
                  className={`progress-step ${
                    ["empaquetado", "envio", "entregado"].indexOf(
                      order.estado.toLowerCase()
                    ) >= 0
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="step-circle">3</div>
                  <span>Empaquetado</span>
                </div>
                <div
                  className={`progress-step ${
                    ["envio", "entregado"].indexOf(
                      order.estado.toLowerCase()
                    ) >= 0
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="step-circle">4</div>
                  <span>Envío</span>
                </div>
                <div
                  className={`progress-step ${
                    order.estado.toLowerCase() === "entregado"
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="step-circle">5</div>
                  <span>Entregado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="order-items-section">
            <h4>Productos Pedidos</h4>
            <div className="order-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="modal-order-item">
                  <div className="item-image-container">
                    <img
                      src={item.imagen || "/placeholder.svg?height=60&width=60"}
                      alt={item.nombre}
                      className="modal-item-image"
                    />
                  </div>
                  <div className="modal-item-details">
                    <h5>{item.nombre}</h5>
                    <p className="item-description">
                      {item.descripcion || "Delicioso producto artesanal"}
                    </p>
                    <span className="unit-price">
                      Precio unitario: {formatPrice(item.precio)}
                      {Number(item.descuento) > 0 && (
                        <span className="discount-badge">
                          &nbsp;-{item.descuento}% OFF
                        </span>
                      )}
                    </span>
                    <div className="item-quantity-price"></div>
                  </div>
                  <div className="item-quantity-price">
                    <span className="item-subtotal">
                      {formatPrice(item.precio * item.cantidad)}
                    </span>
                    <span
                      className="quantity"
                      style={{ background: "var(--color-amber-600)" }}
                    >
                      Cantidad: {item.cantidad}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de costos */}
          <div className="order-summary-section">
            <h4>Resumen del Pedido</h4>
            <div className="cost-breakdown">
              <div className="cost-row">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="cost-row discount">
                  <span>Descuento:</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              {shipping > 0 && (
                <div className="cost-row">
                  <span>Envío:</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
              )}
              <div className="cost-row total">
                <span>Total Final:</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          {order.notas && (
            <div className="order-notes-section">
              <h4>Notas del Pedido</h4>
              <p className="order-notes">{order.notas}</p>
            </div>
          )}
        </div>

        <div className="order-modal-footer">
          <button
            className="btn-modal-close"
            onClick={onHide}
            style={{ background: "var(--color-amber-600)" }}
          >
            Cerrar
          </button>
          {order.estado.toLowerCase() !== "entregado" && (
            <div className="order-help-text">
              <p style={{ fontWeight: "bold" }}>
                ¿Tienes alguna pregunta sobre tu pedido? Contáctanos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(OrderDetailModal);
