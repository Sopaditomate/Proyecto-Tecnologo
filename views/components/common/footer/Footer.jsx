import { forwardRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import "./footer.css";
import { defaultIcons } from "../../../../src/models/MenuConfig.js";

const Footer = forwardRef((props, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Rutas donde NO se debe mostrar el footer
  const hideFooterRoutes = [
    "/login",
    "/register",
    "/reset-password",
    "/forgot-password",
    "/admin",
    "/productions"
  ];

  const handleGoToCatalog = () => {
    navigate("/catalogo", { state: { scrollTo: "products" } });
  };

  const handleGoToHome = () => {
    navigate("/", { state: { scrollTo: "home-container" } });
  };

  // Si la ruta actual está en la lista, no renderizar el footer
  if (hideFooterRoutes.some((route) => location.pathname.startsWith(route))) {
    return null;
  }

  const handleScrollToCatalog = (e) => {
    e.preventDefault();
    const productsSection = document.querySelector(".products");

    if (productsSection) {
      productsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleScrollToLogin = (e) => {
    e.preventDefault();
    const productsSection = document.querySelector(".home-container");

    if (productsSection) {
      productsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <footer className="footer" ref={ref}>
      <div className="footer-container">
        {/* Sección principal de la empresa */}
        <div className="footer-section footer-brand">
          <Link
            to={"/"}
            aria-label="Ir a inicio"
            className="logo-link-footer"
            id="logo-link-footer"
            style={{ textDecoration: "none" }}
          >
            <img
              src={defaultIcons.icon1}
              id="img-lovebites"
              alt="Logo"
              className="logo-image"
            />
            <p className="logo-text-header">Love Bites</p>
          </Link>

          <h3 className="footer-tagline">Horneando con amor desde 2025</h3>
          <p className="footer-description">
            Ofrecemos los mejores productos de panadería artesanal, elaborados
            con ingredientes de primera calidad y técnicas tradicionales que han
            pasado de generación en generación.
          </p>
          <div className="footer-certifications">
            <span className="certification-badge">100% Artesanal</span>
            <span className="certification-badge">Ingredientes Naturales</span>
            <span className="certification-badge">Masa Madre</span>
          </div>
        </div>

        {/* Sección de navegación */}
        <div className="footer-section">
          <h3>Navegación</h3>
          <ul className="footer-links">
            <li>
              <Link to="/" state={{ scrollTo: "home-container" }}>
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/catalogo" state={{ scrollTo: "products" }}>
                Catálogo
              </Link>
            </li>
            <li>
              <Link to="/about">Sobre Nosotros</Link>
            </li>
            <li>
              <Link to={isAuthenticated ? "/profile" : "/login"}>
                {isAuthenticated ? "Mi Perfil" : "Iniciar Sesión"}
              </Link>
            </li>
          </ul>
        </div>

        {/* Sección de productos */}
        <div className="footer-section">
          <h3>Nuestros Productos</h3>
          <ul className="footer-links">
            <li>
              <Link to="/catalogo" state={{ scrollTo: "products" }}>
                Pan de Ajo y Romero
              </Link>
            </li>
            <li>
              <Link to="/catalogo" state={{ scrollTo: "products" }}>
                Pan de Canela
              </Link>
            </li>
            <li>
              <Link to="/catalogo" state={{ scrollTo: "products" }}>
                Pan Frutos Secos
              </Link>
            </li>
            <li>
              <Link to="/catalogo" state={{ scrollTo: "products" }}>
                Focaccia de Masa Madre
              </Link>
            </li>
            
          </ul>
        </div>

        {/* Sección de información y contacto */}
        <div className="footer-section">
          <h3>Información</h3>
          <div className="footer-info-group">
            <h4>Horarios de Atención</h4>
            <div className="footer-schedule">
              <p>
                <span className="schedule-day">Lun - Vie:</span> 7:00 - 20:00
              </p>
              <p>
                <span className="schedule-day">Sábados:</span> 8:00 - 18:00
              </p>
              <p>
                <span className="schedule-day">Domingos:</span> 9:00 - 14:00
              </p>
            </div>
          </div>

          <div className="footer-info-group">
            <h4>Contacto</h4>
            <div className="footer-contact">
              <p>Calle Principal #123, Centro</p>
              <p>+123 456 7890</p>
              <p>info@lovebites.com</p>
              <p>WhatsApp: +123 456 7891</p>
            </div>
          </div>
        </div>

        {/* Sección de redes sociales y enlaces legales */}
        <div className="footer-section footer-social-section">
          <h3>Síguenos</h3>
          <div className="footer-social">
            <div className="social-icons">
              <a
                href="https://facebook.com/lovebites"
                className="social-icon facebook"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/lovebites"
                className="social-icon instagram"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://wa.me/3197640699"
                className="social-icon whatsapp"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </a>
              <a
                href="mailto:brandonmartinez4272@gmail.com"
                className="social-icon email"
                aria-label="Email"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Enlaces legales */}
          <div className="footer-legal-links">
            <h4>Legal</h4>
            <ul className="legal-links-list">
              <li>
                <Link to="/privacy">Política de Privacidad</Link>
              </li>
              <li>
                <Link to="/terms">Términos y Condiciones</Link>
              </li>
              <li>
                <Link to="/cookies">Política de Cookies</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sección inferior con copyright */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 Love Bites. Todos los derechos reservados.</p>
          <p className="footer-made-with">
            Hecho con para los amantes del buen pan
          </p>
        </div>
      </div>
    </footer>
  );
});

export { Footer };
