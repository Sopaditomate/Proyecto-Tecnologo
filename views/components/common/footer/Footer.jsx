// Componente de pie de página
import { forwardRef } from "react"; // Importación de 'forwardRef' para pasar referencias al componente
import { Link } from "react-router-dom"; // Importación de 'Link' para crear enlaces de navegación
import "./footer.css"; // Importación del archivo CSS para el estilo del pie de página

// Componente funcional de pie de página, utilizando forwardRef para permitir el uso de referencias
const Footer = forwardRef((props, ref) => {
  // Obtención del año actual para mostrar en el pie de página
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" ref={ref}>
      <div className="footer-container">
        {/* Sección con la información de la empresa */}
        <div className="footer-section">
          <span className="footer-logo">Love Bites</span>
          <p className="footer-tagline">Horneando con amor desde 2010</p>
          <p>
            Ofrecemos los mejores productos de panadería artesanal, elaborados
            con ingredientes de primera calidad y técnicas tradicionales.
          </p>
        </div>

        {/* Sección con enlaces de navegación */}
        <div className="footer-section">
          <h3>Enlaces</h3>
          <ul className="footer-links">
            <li>
              <Link to="/">Inicio</Link> {/* Enlace a la página de inicio */}
            </li>
            <li>
              <Link to="/catalogo">Catálogo</Link>{" "}
              {/* Enlace a la página del catálogo */}
            </li>
            <li>
              <Link to="">Servicios</Link>{" "}
              {/* Enlace a la página de servicios (vacío por ahora) */}
            </li>
          </ul>
        </div>

        {/* Sección con horarios de apertura */}
        <div className="footer-section">
          <h3>Horarios</h3>
          <div className="footer-contact">
            <p>Lunes a Viernes: 7:00 - 20:00</p>
            <p>Sábados: 8:00 - 18:00</p>
            <p>Domingos: 9:00 - 14:00</p>
          </div>
        </div>

        {/* Sección de contacto y redes sociales */}
        <div className="footer-section">
          <h3>Contacto</h3>
          <div className="footer-contact">
            <p>Calle Principal #123</p> {/* Dirección de contacto */}
            <p>+123 456 7890</p> {/* Número de teléfono */}
            <p>info@lovebites.com</p> {/* Correo electrónico de contacto */}
          </div>

          {/* Sección con iconos de redes sociales */}
          <div className="footer-social">
            <a href="#" className="social-icon">
              {" "}
              {/* Enlace a Facebook */}
              <img
                src="/assets/facebook.svg"
                alt="Facebook"
                width="20"
                height="20"
              />
            </a>
            <a href="#" className="social-icon">
              {" "}
              {/* Enlace a Instagram */}
              <img
                src="/assets/instagram.svg"
                alt="Instagram"
                width="20"
                height="20"
              />
            </a>
            <a href="#" className="social-icon">
              {" "}
              {/* Enlace a Twitter */}
              <img
                src="/assets/twitter.svg"
                alt="Twitter"
                width="20"
                height="20"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Sección inferior con los derechos reservados */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} Love Bites. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
});

// Exportación del componente Footer
export { Footer };
