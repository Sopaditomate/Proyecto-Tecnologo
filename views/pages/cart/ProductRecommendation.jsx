"use client";
import "./product-recommendation.css";

// Componente para mostrar productos recomendados en el carrito
export function ProductRecommendation({ product, onAdd }) {
  return (
    <div className="recommendation-item">
      <div className="recommendation-image">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.nameProduct}
        />
      </div>
      <div className="recommendation-details">
        <h4>{product.nameProduct}</h4>
        <div className="recommendation-price-action">
          <span className="recommendation-price">
            ${product.price.toFixed(3)}
          </span>
          <button
            className="add-recommendation-btn"
            onClick={onAdd}
            aria-label={`Añadir ${product.nameProduct} al carrito`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
