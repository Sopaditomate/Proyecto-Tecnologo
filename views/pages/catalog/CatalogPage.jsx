import { useState, useEffect } from "react";
import axios from "axios";
import { ProductCard } from "../../components/products/ProductCard";
import "./catalog.css";
import { PageTitle } from "./PageTitle";

export function CatalogPage() {
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Todos"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener categorías y productos filtrados
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Obtener categorías
        const categoryRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/categories`
        );
        setCategories(["Todos", ...categoryRes.data]);

        // Parámetro de categoría (evita enviar "Todos" a la API)
        const categoryParam =
          selectedCategory === "Todos" ? "" : selectedCategory;

        // Obtener productos filtrados
        const productRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/filter`,
          {
            params: { searchTerm, category: categoryParam },
          }
        );

        setProducts(productRes.data);
      } catch (err) {
        console.error("Error al cargar los productos:", err);
        setError("No se pudieron cargar los productos. Intenta nuevamente.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estado de carga, error o lista de productos */}
      {loading ? (
        <div className="loading-container">
          <span className="loading-spinner"></span>
          <p>Cargando productos...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Reintentar
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="no-results">
          <p>No se encontraron productos que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <section id="container-products">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}
