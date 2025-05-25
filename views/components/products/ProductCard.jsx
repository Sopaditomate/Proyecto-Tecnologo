"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext";
import "../../pages/catalog/catalog.css";

export function ProductCard({ product }) {
  const { addProductToCart, showAddToCartNotification } = useCart();
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Función para truncar la descripción
  const maxDesc = 60;
  const isLongDesc =
    product.description && product.description.length > maxDesc;
  const shortDesc = isLongDesc
    ? product.description.slice(0, maxDesc) + "..."
    : product.description;

  return (
    <article key={product.id} id="product">
      <div className="product-badge">{product.category}</div>
      <div id="center-product">
        <div className="img-container">
          <img
          //Se agrega interpolacion a la ruta para referenciar las imagenes correctamente
            src={
              product.image
                ? `/images/${product.image}`
                : "/images/url_imagen_integral.jpg"
            }
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
            {Number(product.discount) > 0 && (
              <span className="discount-badge">-{product.discount}%</span>
            )}
          </div>

          {/* Nombre del producto */}
          <h2
            className="name-product-2"
            style={{ margin: "0.3rem 0 0.2rem 0" }}
          >
            {product.nameProduct}
          </h2>

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
                $
                {Number(product.price) && Number(product.discount)
                  ? (
                      Number(product.price) *
                      (1 - Number(product.discount) / 100)
                    ).toFixed(3)
                  : Number(product.price)
                  ? Number(product.price).toFixed(3)
                  : "0.000"}
              </span>
              {Number(product.discount) > 0 && (
                <span className="original-price">
                  $
                  {Number(product.price)
                    ? Number(product.price).toFixed(3)
                    : "0.000"}
                </span>
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
