"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext";
import "../../pages/catalog/catalog.css";

export function ProductCard({ product }) {
  const { addProductToCart, showAddToCartNotification } = useCart();
  const [showFullDesc, setShowFullDesc] = useState(false);

  // 👉 Función para formatear precios en pesos colombianos
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Descripción corta
  const maxDesc = 60;
  const isLongDesc =
    product.description && product.description.length > maxDesc;
  const shortDesc = isLongDesc
    ? product.description.slice(0, maxDesc) + "..."
    : product.description;

  // Cálculo de precios
  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <article key={product.id} id="product">
      <div className="product-badge">{product.category}</div>
      <div id="center-product">
        <div className="img-container">
          <img
            src={product.image}
            alt={product.nameProduct}
            className="img-product"
          />
        </div>
        <div className="product-details compact">
          {/* Estrellas y descuento */}
          <div className="product-stars-discount-row">
            <div className="stars-container">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`star ${
                    i < Math.round(Number(product.rating) || 0) ? "filled" : ""
                  }`}
                >
                  ★
                </span>
              ))}
              <span className="rating-number">
                {product.rating && !isNaN(Number(product.rating))
                  ? Number(product.rating).toFixed(1)
                  : "N/A"}
              </span>
            </div>
            {discount > 0 && (
              <span className="discount-badge">-{discount}%</span>
            )}
          </div>

          {/* Nombre del producto */}
          <h2 className="name-product-2">{product.nameProduct}</h2>

          {/* Descripción corta y leer más/menos */}
          <p className="description-product compact">
            {showFullDesc ? product.description : shortDesc}
            {isLongDesc && (
              <span
                className="read-more-btn"
                onClick={() => setShowFullDesc((v) => !v)}
              >
                {showFullDesc ? " Leer menos" : " Leer más"}
              </span>
            )}
          </p>

          {/* Precio y botón */}
          <div className="product-price-row">
            <div className="price-group">
              <span className="discounted-price">
                {formatPrice(finalPrice)}
              </span>
              {discount > 0 && (
                <span className="original-price">{formatPrice(price)}</span>
              )}
            </div>
            <button
              className="btn-add"
              onClick={() => {
                addProductToCart(product);
                showAddToCartNotification();
              }}
              aria-label={`Agregar ${product.nameProduct} al carrito`}
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
  );
}
