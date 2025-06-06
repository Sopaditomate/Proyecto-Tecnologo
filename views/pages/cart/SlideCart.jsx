"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext.jsx";
import { ProductRecommendation } from "./ProductRecommendation";
import { CheckoutModal } from "./CheckoutModal";
import "./slide-cart.css";

// Componente para el botón de disminuir cantidad con hover
function MinusButton({ disabled, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label="Disminuir cantidad"
      disabled={disabled}
      className="minus-btn"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      -
      {disabled && isHovered && (
        <span
          className="minus-btn-disabled-hint"
          title="No puedes disminuir más"
        >
          🚫
        </span>
      )}
    </button>
  );
}

export function SlideCart() {
  const {
    cart,
    isCartOpen,
    closeCart,
    addProductToCart,
    removeProductFromCart,
    deleteProductFromCart,
    clearCart,
    getProductTotal,
    getCartSubtotal,
    getShippingCost,
    getTaxes,
    getCartTotal,
    getRecommendedProducts,
    deliveryAddress,
    setDeliveryAddress,
  } = useCart();

  //Estado para mostrar/ocultar resumen
  const [showSummary, setShowSummary] = useState(true);

  // Estado para el modal de checkout
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Confirmaciones
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Productos recomendados
  const recommendedProducts = getRecommendedProducts(3);

  // Estado para el error de dirección
  const [addressError, setAddressError] = useState("");

  // Estado para descripciones expandibles
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Manejar clic en el botón de checkout
  const handleCheckout = () => {
    if (!deliveryAddress.trim()) {
      setAddressError("Por favor ingresa una dirección de entrega");
      return;
    }
    setAddressError("");
    setShowCheckoutModal(true);
  };

  // Cerrar el modal de checkout
  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
  };

  // Eliminar producto
  const handleDeleteClick = (product) => setConfirmDelete(product.id);
  const handleCancelDelete = () => setConfirmDelete(null);
  const handleConfirmDelete = (product) => {
    deleteProductFromCart(product);
    setConfirmDelete(null);
  };

  // Vaciar carrito
  const handleClearCart = () => setConfirmClear(true);
  const handleCancelClear = () => setConfirmClear(false);
  const handleConfirmClear = () => {
    clearCart();
    setConfirmClear(false);
  };

  // Truncar descripción
  const truncateDescription = (text, maxLength = 60) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <>
      {/* Overlay para cerrar el carrito al hacer clic fuera */}
      <div
        className={`slide-cart-overlay ${isCartOpen ? "active" : ""}`}
        onClick={closeCart}
      ></div>

      {/* Carrito deslizable */}
      <div className={`slide-cart ${isCartOpen ? "open" : ""}`}>
        {/* Encabezado del carrito */}
        <div className="slide-cart-header">
          <h2>Tu Carrito</h2>
          <button className="close-cart-btn" onClick={closeCart}>
            ×
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="slide-cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart-message">
              <img
                src="/assets/shopping-cart-empty.svg"
                alt="Carrito vacío"
                className="empty-cart-icon"
              />
              <p>Tu carrito está vacío</p>
              <button className="browse-products-btn" onClick={closeCart}>
                Explorar productos
              </button>
            </div>
          ) : (
            <div className="cart-items-container">
              {/* Botón para vaciar carrito */}
              <div className="empty-cart-btn-container">
                <button
                  className="empty-cart-btn"
                  onClick={handleClearCart}
                  aria-label="Vaciar carrito"
                >
                  Vaciar carrito
                </button>
              </div>
              {cart.map((item) => {
                const maxDesc = 40;
                const isLongDesc =
                  item.description && item.description.length > maxDesc;
                const shortDesc = isLongDesc
                  ? item.description.slice(0, maxDesc) + "..."
                  : item.description;

                const price = Number(item.price) || 0;
                const discount = Number(item.discount) || 0;

                const minusDisabled =
                  item.cantidad <= 1 || confirmDelete === item.id;

                return (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-image">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.nameProduct}
                      />
                      {discount > 0 && (
                        <span className="discount-badge mini">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <div className="cart-item-details">
                      <h3
                        className="name-product-mini"
                        title={item.nameProduct}
                      >
                        {item.nameProduct}
                      </h3>
                      <p className="cart-item-description">
                        {expandedDescriptions[item.id]
                          ? item.description
                          : shortDesc}
                        {isLongDesc && (
                          <button
                            className="read-more-btn"
                            onClick={() =>
                              setExpandedDescriptions((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }))
                            }
                          >
                            {expandedDescriptions[item.id]
                              ? " Ver menos"
                              : " Ver más"}
                          </button>
                        )}
                      </p>
                      <div className="mini-price-row">
                        <span className="discounted-price mini">
                          $
                          {(discount > 0
                            ? price * (1 - discount / 100) * item.cantidad
                            : price * item.cantidad
                          ).toFixed(3)}
                        </span>
                        {discount > 0 && (
                          <span className="original-price mini">
                            ${(price * item.cantidad).toFixed(3)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <MinusButton
                          disabled={minusDisabled}
                          onClick={() => {
                            if (item.cantidad <= 1) {
                              handleDeleteClick(item);
                            } else {
                              removeProductFromCart(item);
                            }
                          }}
                        />
                        <span>{item.cantidad}</span>
                        <button
                          onClick={() => {
                            addProductToCart(item);
                          }}
                          aria-label="Aumentar cantidad"
                          disabled={confirmDelete === item.id}
                        >
                          +
                        </button>
                      </div>
                      {/* Confirmación para eliminar producto */}
                      {confirmDelete === item.id ? (
                        <div className="delete-confirmation">
                          <p>¿Eliminar producto?</p>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="delete-confirm-btn"
                              onClick={() => handleConfirmDelete(item)}
                            >
                              Sí
                            </button>
                            <button
                              className="delete-cancel-btn"
                              onClick={handleCancelDelete}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="remove-item-btn"
                          onClick={() => handleDeleteClick(item)}
                          aria-label="Eliminar producto"
                          style={{ marginTop: "0.5rem" }}
                        >
                          <img src="/assets/delete.svg" alt="Eliminar" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sección de recomendaciones */}
          {cart.length > 0 && (
            <div className="recommendations-section">
              <h3>Recomendados para ti</h3>
              <div className="recommendations-container">
                {recommendedProducts.map((product) => (
                  <ProductRecommendation
                    key={product.id}
                    product={product}
                    onAdd={() => {
                      addProductToCart(product);
                      // showToast(`${product.nameProduct} añadido al carrito`); // Eliminado
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pie del carrito con resumen y checkout */}
        {cart.length > 0 && (
          <div className="slide-cart-footer">
            <button
              className="toggle-details-btn"
              onClick={() => setShowSummary(!showSummary)}
            >
              {showSummary ? "Ocultar resumen" : "Mostrar resumen"}
            </button>

            <div className={`details ${!showSummary ? "hidden" : ""}`}>
              <div className="delivery-address">
                <label htmlFor="address">Dirección de entrega:</label>
                <input
                  type="text"
                  id="address"
                  placeholder="Ingresa tu dirección"
                  value={deliveryAddress}
                  onChange={(e) => {
                    setDeliveryAddress(e.target.value);
                    if (addressError) setAddressError("");
                  }}
                />
                {addressError && (
                  <div className="address-error">{addressError}</div>
                )}
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${getCartSubtotal().toFixed(3)}</span>
                </div>
                <div className="summary-row">
                  <span>Envío</span>
                  <span>
                    {getShippingCost() === 0
                      ? "Gratis"
                      : `$${getShippingCost().toFixed(3)}`}
                  </span>
                </div>
                <div className="summary-row">
                  <span>IVA (19%)</span>
                  <span>${getTaxes().toFixed(3)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(3)}</span>
                </div>
              </div>

              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Ir a pagar
              </button>
            </div>
          </div>
        )}

        {/* Confirmación para vaciar carrito */}
        {confirmClear && (
          <div className="clear-cart-confirmation">
            <p>¿Vaciar todo el carrito?</p>
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <button
                className="clear-confirm-btn"
                onClick={handleConfirmClear}
              >
                Sí
              </button>
              <button className="clear-cancel-btn" onClick={handleCancelClear}>
                No
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de checkout */}
      {showCheckoutModal && (
        <CheckoutModal
          onClose={closeCheckoutModal}
          cartItems={cart}
          subtotal={getCartSubtotal()}
          shipping={getShippingCost()}
          taxes={getTaxes()}
          total={getCartTotal()}
          address={deliveryAddress}
        />
      )}
    </>
  );
}
