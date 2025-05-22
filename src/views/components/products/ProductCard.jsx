"use client";

// Componente de tarjeta de producto con vista rápida
import { useState } from "react";
import { useCart } from "../../../models/CartContext";
import { QuickViewModal } from "./QuickViewModal";

export function ProductCard({ product }) {
  // Obtener función para añadir al carrito del contexto
  const { addProductToCart } = useCart();
  // Estado para controlar la vista rápida
  const [showQuickView, setShowQuickView] = useState(false);

  // Manejar clic en vista rápida
  const handleQuickView = (e) => {
    e.preventDefault();
    setShowQuickView(true);
  };

  return (
    <>
      <article key={product.id} id="product">
        <div className="product-badge">{product.category}</div>
        <div id="center-product">
          <div className="img-container">
            <img
              src={product.image || "/images/croissantdechocolate.jpg"}
              alt={product.nameProduct}
              className="img-product"
            />
            <div className="product-overlay">
              <button
                className="quick-view-btn"
                aria-label="Vista rápida"
                onClick={handleQuickView}
              >
                Vista rápida
              </button>
            </div>
          </div>
          <div className="product-details">
            <div id="container-star">
              <h2 className="name-product-2">{product.nameProduct}</h2>
              <div id="container-rating">
                <img
                  src="/assets/star.svg"
                  className="star"
                  alt="Rating star"
                />
                <p>{product.rating}</p>
              </div>
            </div>
            <p className="description-product">{product.description}</p>

            <div className="container-button-add">
              <p className="price">{`$${product.price.toFixed(3)}`}</p>
              <button
                className="btn-add"
                onClick={() => addProductToCart(product)}
                aria-label={`Add ${product.nameProduct} to cart`}
              >
                <img
                  src="/assets/plusv2.svg"
                  className="img-shopping-car"
                  alt="Shopping cart icon"
                />
                Agregar
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Modal de vista rápida */}
      {showQuickView && (
        <QuickViewModal
          product={product}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </>
  );
}
