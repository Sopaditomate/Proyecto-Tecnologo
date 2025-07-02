import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ProductCard } from "../../components/products/ProductCard";
import "./catalog.css";
import { PageTitle } from "./PageTitle";
import { useAuth } from "../../context/AuthContext";

export function CatalogPage() {
  const { isAuthenticated } = useAuth();
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Todos"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  // Obtener categorías solo una vez
  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoryRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/categories`
        );
        setCategories(["Todos", ...categoryRes.data]);
      } catch (err) {
        setCategories(["Todos"]);
      }
    }
    fetchCategories();
  }, []);

  // búsqueda en tiempo real sin parpadeo
  const debounceTimeout = useRef();
  useEffect(() => {
    setLoading(true);
    setError(null);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const categoryParam = selectedCategory === "Todos" ? null : selectedCategory;
        const productRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/filter`,
          {
            params: { search: searchTerm, category: categoryParam },
          }
        );
        setProducts(productRes.data);
      } catch (err) {
        setError("No se pudieron cargar los productos. Intenta nuevamente.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(debounceTimeout.current);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (isAuthenticated) {
      axios.get("/api/user/me").then((res) => setProfile(res.data));
    }
  }, [isAuthenticated]);

  const datosIncompletos =
    profile &&
    (!profile.nombres ||
      !profile.apellidos ||
      !profile.direccion ||
      !profile.telefono);

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
            {categories.map((category, index) =>
              typeof category === "string" ? (
                <option key={`str-${category}`} value={category}>
                  {category}
                </option>
              ) : (
                <option key={`obj-${category.id}`} value={category.nombre}>
                  {category.nombre}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Alerta de perfil incompleto */}
      {datosIncompletos && (
        <div className="alert-incompleto">
          <strong>¡Atención!</strong> Debes completar tu perfil para comprar o
          realizar pedidos.{" "}
          <a href="/profile">Haz clic aquí para completar tu perfil.</a>
        </div>
      )}

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
