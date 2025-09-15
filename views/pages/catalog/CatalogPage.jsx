"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { ProductCard } from "../../components/products/ProductCard"
import "./catalog.css"
import { PageTitle } from "./PageTitle"
import { useAuth } from "../../context/AuthContext"
import { useNavigate, useLocation } from "react-router-dom" // 👈 importamos useLocation
import Chatbot from '../../components/Chatbot/chatbot.jsx';
export function CatalogPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
    const location = useLocation()


  // Estados
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(["Todos"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  // Función para verificar si el perfil está completo
  const isProfileComplete = (profile) => {
    if (!profile) return false
    // Verificar que todos los campos requeridos estén completos
    const hasRequiredFields =
      profile.NOMBRES &&
      profile.NOMBRES.trim() !== "" &&
      profile.APELLIDOS &&
      profile.APELLIDOS.trim() !== "" &&
      profile.DIRECCION &&
      profile.DIRECCION.trim() !== "" &&
      profile.TELEFONO &&
      profile.TELEFONO.trim() !== ""

    // Verificar que el email esté verificado
    const isEmailVerified = profile.verified === 1 || profile.VERIFIED === 1

    // Verificar que el teléfono esté verificado
    const isPhoneVerified = profile.verified_phone === 1

    return hasRequiredFields && isEmailVerified && isPhoneVerified
  }

  // Cargar perfil completo del usuario
  const loadCompleteUserProfile = async () => {
    if (!isAuthenticated) return

    setIsLoadingProfile(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
      const response = await axios.get(`${API_URL}/user/profile`, {
        withCredentials: true,
      })
      if (response.data.success) {
        setUserProfile(response.data.data)
      }
    } catch (error) {
      console.error("Error loading complete user profile:", error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Obtener categorías solo una vez
  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoryRes = await axios.get(`${import.meta.env.VITE_API_URL}/products/categories`)
        setCategories(["Todos", ...categoryRes.data])
      } catch (err) {
        setCategories(["Todos"])
      }
    }
    fetchCategories()
  }, [])

  // Cargar perfil cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadCompleteUserProfile()
    }
  }, [isAuthenticated])

  // búsqueda en tiempo real sin parpadeo
  const debounceTimeout = useRef()
  useEffect(() => {
    setLoading(true)
    setError(null)
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(async () => {
      try {
        const categoryParam = selectedCategory === "Todos" ? null : selectedCategory
        const productRes = await axios.get(`${import.meta.env.VITE_API_URL}/products/filter`, {
          params: { search: searchTerm, category: categoryParam },
        })
        setProducts(productRes.data)
      } catch (err) {
        setError("No se pudieron cargar los productos. Intenta nuevamente.")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(debounceTimeout.current)
  }, [searchTerm, selectedCategory])

  const handleCompleteProfile = () => {
    navigate("/profile")
  }
    //  Nuevo efecto: scroll al llegar desde el Footer
  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.querySelector(`.${location.state.scrollTo}`)
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 300) // delay para asegurar render de productos
      }
    }
  }, [location, products]) // se ejecuta después de cargar productos

  return (
    <div className="catalogo-wrapper">
      <PageTitle title="Nuestros Productos" subtitle="Descubre nuestra selección de panes artesanales y dulces" />

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
              ),
            )}
          </select>
        </div>
      </div>

      {/* Alerta de perfil incompleto - Movida del SlideCart */}
      {isAuthenticated && userProfile && !isProfileComplete(userProfile) && (
        <div
          className="profile-incomplete-warning"
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            fontSize: "16px",
            color: "#856404",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <strong>¡Atención!</strong> Debes completar tu perfil para comprar o realizar pedidos.
          </div>
          <button
            onClick={handleCompleteProfile}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#0056b3"
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#007bff"
            }}
          >
            Completar perfil
          </button>
        </div>
      )}

      {/* Estado de carga del perfil */}
      {isAuthenticated && isLoadingProfile && (
        <div
          style={{
            backgroundColor: "#e3f2fd",
            border: "1px solid #bbdefb",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#1565c0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid #1565c0",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          Verificando perfil...
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
          <button onClick={() => window.location.reload()} className="retry-button">
            Reintentar
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="no-results">
          <p>No se encontraron productos que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <section id="container-products" className="products">
          {products.map((product, idx) => (
            <ProductCard key={product.id ? `${product.id}-${idx}` : idx} product={product} />
          ))}
        </section>
      )}
            {/* Chatbot Component */}
      <Chatbot />
    </div>
  )
}