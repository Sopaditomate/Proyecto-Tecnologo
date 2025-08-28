import { forwardRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import "./footer.css";
import { defaultIcons } from "../../../../src/models/MenuConfig.js";


const Footer = forwardRef((props, ref) => {

  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Rutas donde NO se debe mostrar el footer
  const hideFooterRoutes = ["/login", "/register", "/reset-password"];

  const handleGoToCatalog = () => {
  navigate("/catalogo", { state: { scrollTo: "products" } });
};

const handleGoToHome = () => {
  navigate("/", { state: { scrollTo: "home-container" } });
};


  // Manejar suscripción al newsletter
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // Si la ruta actual está en la lista, no renderizar el footer
  if (hideFooterRoutes.some((route) => location.pathname.startsWith(route))) {
    return null;
  }

  const handleScrollToCatalog = (e) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado del enlace
    const productsSection = document.querySelector(".products");

    if (productsSection) {
      productsSection.scrollIntoView({
        behavior: "smooth", // Para un scroll suave
        block: "start", // Alinea el inicio del elemento con la parte superior de la vista
      });
    }
  };

  const handleScrollToLogin = (e) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado del enlace
    const productsSection = document.querySelector(".home-container");

    if (productsSection) {
      productsSection.scrollIntoView({
        behavior: "smooth", // Para un scroll suave
        block: "start", // Alinea el inicio del elemento con la parte superior de la vista
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

          <h3 style={{ marginTop: "20px" }}>Horneando con amor desde 2025</h3>
          <p className="footer-description">
            Ofrecemos los mejores productos de panadería artesanal, elaborados
            con ingredientes de primera calidad y técnicas tradicionales que han
            pasado de generación en generación.
          </p>
          <div className="footer-certifications">
            <span className="certification-badge">100% Artesanal</span>
            <span className="certification-badge">Ingredientes Naturales</span>
          </div>
        </div>

        {/* Sección de navegación */}
        <div className="footer-section">
          <h3>Navegación</h3>
         <ul className="footer-links">
  <li>
    <Link to="/" state={{ scrollTo: "home-container" }}>Inicio</Link>
  </li>
  <li>
    <Link to="/catalogo" state={{ scrollTo: "products" }}>Catálogo</Link>
  </li>
  <li>
    <Link to="/catalogo">Contacto</Link>
  </li>
  <li>
    <Link to={isAuthenticated ? "/profile" : "/login"}>Perfil</Link>
  </li>
</ul>

        </div>

        {/* Sección de productos */}
        <div className="footer-section">
  <h3>Nuestros Productos</h3>
  <ul className="footer-links">
    <li>
      <Link to="/catalogo" state={{ scrollTo: "products" }}>
        Panes Artesanales
      </Link>
    </li>
    <li>
      <Link to="/catalogo" state={{ scrollTo: "products" }}>
        Pasteles y Tortas
      </Link>
    </li>
    <li>
      <Link to="/catalogo" state={{ scrollTo: "products" }}>
        Galletas Caseras
      </Link>
    </li>
    <li>
      <Link to="/catalogo" state={{ scrollTo: "products" }}>
        Croissants
      </Link>
    </li>
  </ul>
</div>


        {/* Sección de horarios y contacto */}
        <div className="footer-section">
          <h3>Información</h3>
          <div className="footer-info-group">
            <h4>Horarios de Atención</h4>
            <div className="footer-contact">
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
            <h3>Contacto</h3>
            <div className="footer-contact">
              <p>
                <i className="icon-location"></i>Calle Principal #123, Centro
              </p>
              <p>
                <i className="icon-phone"></i>+123 456 7890
              </p>
              <p>
                <i className="icon-email"></i>info@lovebites.com
              </p>
              <p>
                <i className="icon-whatsapp"></i>WhatsApp: +123 456 7891
              </p>
            </div>
          </div>
        </div>

        {/* Sección de newsletter y redes sociales */}
        <div className="footer-section footer-newsletter">
          <h3>Mantente Conectado</h3>
          <p className="newsletter-description">
            Suscríbete para recibir ofertas especiales, nuevos productos y
            recetas exclusivas.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            <div className="input-group-footer">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
                style={{ color: "black" }}
              />
              <button type="submit" className="newsletter-btn">
                Suscribirse
              </button>
            </div>
            {isSubscribed && (
              <p className="subscription-success">
                ¡Gracias por suscribirte! 🥖
              </p>
            )}
          </form>

          <div className="footer-social">
            <h4>Síguenos en:</h4>
            <div className="social-icons">
              <a
                href="#"
                className="social-icon facebook"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="social-icon instagram"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="social-icon twitter" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="social-icon youtube" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

export { Footer };
