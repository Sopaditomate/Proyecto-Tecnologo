"use client";

// Página del carrito de compras
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../models/CartContext";
<<<<<<< HEAD
import "../../../styles/shoppingCart/shopping-cart.css";
=======
import "../cart/shopping-cart.css";
>>>>>>> feature/homepage-redesign

export function ShoppingCartPage() {
  // Obtener funciones y datos del carrito desde el contexto
  const {
    cart,
    addProductToCart,
    removeProductFromCart,
    deleteProductFromCart,
    getProductTotal,
    getCartTotal,
    cartLength,
  } = useCart();

  // Estado para controlar confirmación de eliminación
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Funciones para manejar la eliminación de productos
  const handleDeleteClick = (product) => {
    setConfirmDelete(product.id); // Establecer el producto que se intenta eliminar
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null); // Cancelar eliminación
  };

  const handleConfirmDelete = (product) => {
    deleteProductFromCart(product); // Eliminar producto del carrito
    setConfirmDelete(null); // Resetear estado de confirmación
  };

  return (
    <div className="shopping-cart-container">
      <div className="shopping-cart-header">
        <h1 className="cart-title">Mi Carrito</h1>
        <p className="cart-items-count">
          {cartLength()} {cartLength() === 1 ? "Producto" : "Productos"}
        </p>
      </div>

      <section className="shopping-cart-section">
        {/* Mostrar mensaje de carrito vacío o productos */}
        {!Array.isArray(cart) || cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <div className="cart-badge-shopping-cart">0</div>
              <img
                src="/assets/shopping-cart-empty.svg"
                alt="Carrito vacío"
                className="empty-cart-icon-svg"
              />
            </div>
            <h2>Tu carrito está vacío</h2>
            <p>Parece que aún no has añadido productos a tu carrito</p>
            <Link to="/catalogo" className="continue-shopping-btn">
              Continuar comprando
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <article className="cart-article">
              <div className="cart-header">
                <h2>Productos Seleccionados</h2>
              </div>

              <div className="cart-items">
                {/* Mapear productos en el carrito */}
                {cart.map((item) => {
                  const isConfirmingDelete = confirmDelete === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`cart-item ${
                        isConfirmingDelete ? "confirming-delete" : ""
                      }`}
                    >
                      <div className="product-image-container">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.nameProduct}
                          className="product-image"
                        />
                      </div>

                      <div className="product-info">
                        <h3 className="product-name">{item.nameProduct}</h3>
                        <p className="product-description">
                          {item.description}
                        </p>
                      </div>

                      <div className="product-price">
                        <p className="price-per-unit">
                          ${item.price.toFixed(3)} c/u
                        </p>
                        <p className="price-total">
                          ${getProductTotal(item.id).toFixed(3)}
                        </p>
                      </div>

                      <div className="product-quantity">
                        <button
                          className="quantity-btn decrease"
                          onClick={() => removeProductFromCart(item)}
                          disabled={isConfirmingDelete}
                          aria-label="Disminuir cantidad"
                        >
                          <img src="/assets/minus.svg" alt="Disminuir" />
                        </button>

                        <span className="quantity-value">{item.cantidad}</span>

                        <button
                          className="quantity-btn increase"
                          onClick={() => addProductToCart(item)}
                          disabled={isConfirmingDelete}
                          aria-label="Aumentar cantidad"
                        >
                          <img src="/assets/plus.svg" alt="Aumentar" />
                        </button>
                      </div>

                      <div className="product-actions">
                        {isConfirmingDelete ? (
                          <div className="delete-confirmation">
                            <p>¿Eliminar producto?</p>
                            <div className="confirmation-buttons">
                              <button
                                className="confirm-btn yes"
                                onClick={() => handleConfirmDelete(item)}
                              >
                                Sí
                              </button>
                              <button
                                className="confirm-btn no"
                                onClick={handleCancelDelete}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteClick(item)}
                            aria-label="Eliminar producto"
                          >
                            <img
                              src="/assets/delete.svg"
                              alt="Eliminar"
                              className="delete-icon"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            {/* Resumen del carrito */}
            <div className="cart-summary">
              <div className="summary-header">
                <h2>Resumen del pedido</h2>
              </div>

              <div className="summary-content">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(3)}</span>
                </div>

                <div className="summary-row">
                  <span>Envío</span>
                  <span>Calculado en el siguiente paso</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(3)}</span>
                </div>

                <button className="checkout-button">Proceder al pago</button>

                <Link to="/catalogo" className="continue-shopping-link">
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
