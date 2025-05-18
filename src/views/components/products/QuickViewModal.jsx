"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../../models/CartContext";
<<<<<<< HEAD
import "../../../styles/catalog/quick-view-modal.css";
=======
import "../../../views/pages/catalog/quick-view-modal.css";
>>>>>>> feature/homepage-redesign

export function QuickViewModal({ product, onClose }) {
  // Obtener función para añadir al carrito
  const { addProductToCart } = useCart();
  // Estados para controlar cantidad y pestañas
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isVisible, setIsVisible] = useState(false);

  // Animación de entrada
  useEffect(() => {
    // Bloquear scroll del body
    document.body.style.overflow = "hidden";
    // Mostrar modal con animación
    setTimeout(() => setIsVisible(true), 50);

    // Limpiar al desmontar
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Animación de salida
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Cerrar al hacer clic en el fondo
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("quick-view-backdrop")) {
      handleClose();
    }
  };

  // Añadir al carrito la cantidad seleccionada
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addProductToCart(product);
    }
    handleClose();
  };

  // Aumentar cantidad
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // Disminuir cantidad
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Información nutricional ficticia
  const nutritionalInfo = {
    calories: "280 kcal",
    protein: "8g",
    carbs: "48g",
    fat: "6g",
    fiber: "3g",
  };

  // Ingredientes ficticios
  const ingredients = [
    "Harina de trigo",
    "Agua",
    "Levadura natural",
    "Sal marina",
    "Aceite de oliva extra virgen",
  ];

  return (
    <div
      className={`quick-view-backdrop ${isVisible ? "visible" : ""}`}
      onClick={handleBackdropClick}
    >
      <div className={`quick-view-modal ${isVisible ? "visible" : ""}`}>
        <button className="quick-view-close" onClick={handleClose}>
          ×
        </button>

        <div className="quick-view-content">
          <div className="quick-view-image-container">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.nameProduct}
              className="quick-view-image"
            />
            <div className="quick-view-badge">{product.category}</div>
          </div>

          <div className="quick-view-details">
            <h2 className="quick-view-title">{product.nameProduct}</h2>

            <div className="quick-view-rating">
              <div className="stars-container">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`star ${
                      i < Math.floor(product.rating) ? "filled" : ""
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-value">{product.rating}</span>
              <span className="reviews-count">(24 reseñas)</span>
            </div>

            <div className="quick-view-price-container">
              <p className="quick-view-price">${product.price.toFixed(3)}</p>
              <p className="quick-view-stock">En stock</p>
            </div>

            {/* Pestañas de información */}
            <div className="quick-view-tabs">
              <button
                className={`tab-button ${
                  activeTab === "description" ? "active" : ""
                }`}
                onClick={() => setActiveTab("description")}
              >
                Descripción
              </button>
              <button
                className={`tab-button ${
                  activeTab === "ingredients" ? "active" : ""
                }`}
                onClick={() => setActiveTab("ingredients")}
              >
                Ingredientes
              </button>
              <button
                className={`tab-button ${
                  activeTab === "nutrition" ? "active" : ""
                }`}
                onClick={() => setActiveTab("nutrition")}
              >
                Información Nutricional
              </button>
            </div>

            {/* Contenido de las pestañas */}
            <div className="tab-content">
              {activeTab === "description" && (
                <p className="quick-view-description">
                  {product.description}
                  <br />
                  <br />
                  Nuestro {product.nameProduct.toLowerCase()} es elaborado
                  diariamente con ingredientes frescos y de la más alta calidad.
                  Siguiendo técnicas tradicionales, cada pieza es única y
                  refleja nuestra pasión por la panadería artesanal.
                </p>
              )}

              {activeTab === "ingredients" && (
                <div className="ingredients-list">
                  <h4>Ingredientes:</h4>
                  <ul>
                    {ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                  <p className="allergens">
                    Puede contener trazas de frutos secos y lácteos.
                  </p>
                </div>
              )}

              {activeTab === "nutrition" && (
                <div className="nutrition-info">
                  <h4>Información Nutricional</h4>
                  <p>Valores por 100g:</p>
                  <table>
                    <tbody>
                      {Object.entries(nutritionalInfo).map(([key, value]) => (
                        <tr key={key}>
                          <td>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Selector de cantidad y botón de añadir al carrito */}
            <div className="quick-view-actions">
              <div className="quantity-selector">
                <button className="quantity-btn" onClick={decreaseQuantity}>
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button className="quantity-btn" onClick={increaseQuantity}>
                  +
                </button>
              </div>

              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                <img
                  src="/assets/shoppingcar.svg"
                  alt="Cart"
                  className="cart-icon"
                />
                Añadir al carrito
              </button>
            </div>

            {/* Características adicionales */}
            <div className="quick-view-features">
              <div className="feature">
                <img
                  src="/assets/truck.png"
                  alt="Delivery"
                  className="feature-icon"
                />
                <span>Envío gratis en pedidos +$50.000</span>
              </div>
              <div className="feature">
                <img
                  src="/assets/clock.png"
                  alt="Fresh"
                  className="feature-icon"
                />
                <span>Horneado fresco diariamente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
