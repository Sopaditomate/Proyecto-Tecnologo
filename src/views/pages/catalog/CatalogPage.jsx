"use client";

// Página de catálogo de productos
import { useState, useEffect } from "react";
import { PageTitle } from "../../components/common/PageTitle";
import { ProductCard } from "../../components/products/ProductCard";
import {
  getFilteredProducts,
  getAllCategories,
} from "../../../controllers/ProductController";
import "../catalog/catalog.css";

export function CatalogPage() {
  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Obtener categorías únicas
  const categories = getAllCategories();

  // Filtrar productos cuando cambia el término de búsqueda o categoría
  useEffect(() => {
    setFilteredProducts(getFilteredProducts(searchTerm, selectedCategory));
  }, [searchTerm, selectedCategory]);

  return (
    <div className="catalogo-wrapper">
      <PageTitle
        title="Nuestros Productos"
        subtitle="Descubre nuestra selección de panes artesanales y dulces"
      />

      {/* Barra de búsqueda y filtros */}
      <div className="search-filter-container">
        <div className="search-container">
          <img src="/assets/search.svg" alt="Buscar" className="search-icon" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <label htmlFor="category-filter" className="filter-label">
            Categoría:
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mostrar mensaje si no hay resultados o la lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="no-results">
          <p>No se encontraron productos que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <section id="container-products">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}
