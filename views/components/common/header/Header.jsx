"use client";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import "./header.css";
import "./header-profile.css";

export function Header({
  itemMenu = [],
  iconMenu,
  icon1,
  icon2,
  link2,
  footerRef,
}) {
  // ====== CONTEXTOS Y ESTADOS ======
  const { cartLength, openCart } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [toggle, setToggle] = useState(false); // menú hamburguesa
  const [scrolled, setScrolled] = useState(false); // efecto scroll header
  const [profileOpen, setProfileOpen] = useState(false); // dropdown perfil
  const [showAllItems, setShowAllItems] = useState(false); // ver más menú
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // ====== EFECTOS ======
  // Cambia el header al hacer scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cierra menús al cambiar de ruta
  useEffect(() => {
    setToggle(false);
    setProfileOpen(false);
  }, [location]);

  // Cierra el dropdown de perfil al hacer click fuera
  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  // ====== HANDLERS ======
  const handleCartClick = (e) => {
    e.preventDefault();
    openCart();
  };

  const handleToggle = () => setToggle((prev) => !prev);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    setToggle(false);
    await new Promise((res) => setTimeout(res, 100));
    await logout();
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleMenuItemClick = (item) => {
    setToggle(false);
    if (item.name === "Contacto" && footerRef?.current) {
      footerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (item.name === "Cerrar Sesion") {
      handleLogout();
    }
  };

  // Cierra menú hamburguesa al hacer click fuera
  const handleClickOutside = (event) => {
    if (event.target.classList.contains("overlay")) setToggle(false);
  };

  // Función para generar iniciales del usuario
  const getUserInitials = () => {
    if (user?.nombres) {
      const nombres = user.nombres.split(" ")[0] || "";
      const apellidos = user.apellidos ? user.apellidos.split(" ")[0] : "";
      return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
    }
    return "U";
  };

  // Función para obtener el nombre completo del usuario
  const getFullName = () => {
    if (user?.nombres && user?.apellidos) {
      return `${user.nombres} ${user.apellidos}`;
    } else if (user?.nombres) {
      return user.nombres;
    }
    return "Usuario";
  };

  // Función para navegar directamente a una sección del perfil
  const navigateToProfile = (section = "profile") => {
    setProfileOpen(false);
    navigate("/profile", { state: { activeTab: section } });
  };

  // ====== RENDER PERFIL DE USUARIO ======
  const renderUserProfile = () => {
    if (!isAuthenticated) return null;

    return (
      <div
        ref={profileRef}
        className={`header-profile-container${toggle ? " disabled" : ""} ${
          profileOpen ? " open" : ""
        }`}
        onClick={() => !toggle && setProfileOpen((prev) => !prev)}
        style={{ marginLeft: "1rem" }}
      >
        {/* Avatar con iniciales */}
        <div className="header-profile-avatar-container">
          <div className="header-profile-avatar-circle">
            <span className="header-profile-initials">{getUserInitials()}</span>
          </div>
          <div className="header-profile-status-indicator"></div>
        </div>

        {/* Información del usuario */}
        <div className="header-profile-info">
          <span className="header-profile-name">{getFullName()}</span>
          <span className="header-profile-role">
            {isAdmin ? "Administrador" : "Cliente"}
          </span>
        </div>

        {/* Icono de dropdown */}
        <div className={`header-profile-arrow ${profileOpen ? "rotated" : ""}`}>
          <svg
            width="25"
            height="25"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>

        {/* Opciones del desplegable */}
        {isAuthenticated && (
          <div className="header-profile-dropdown">
            {!isAdmin && (
              <>
                <div
                  className="header-profile-dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToProfile("profile");
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Mi Perfil
                </div>
                <div
                  className="header-profile-dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToProfile("orders");
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"></path>
                  </svg>
                  Mis Pedidos
                </div>
                <div
                  className="header-profile-dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToProfile("verification");
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Verificación
                </div>
              </>
            )}
            
            <div
              className="header-profile-dropdown-item logout-item"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"></path>
              </svg>
              Cerrar Sesión
            </div>
          </div>
        )}
      </div>
    );
  };

  // ====== MENÚ LATERAL ======
  const menuItems = itemMenu.filter(
    (item) =>
      item.name !== "Cerrar Sesion" &&
      (isAuthenticated || (!isAuthenticated && item.name !== "Perfil"))
  );
  // Así, "Perfil" solo aparece si isAuthenticated es true

  const cerrarSesionItem = itemMenu.find(
    (item) => item.name === "Cerrar Sesion"
  );
  const maxItems = 6;
  let visibleItems = showAllItems ? menuItems : menuItems.slice(0, maxItems);
  // Si el usuario NO está autenticado, agrega 'Iniciar sesión' como sección
  if (!isAuthenticated) {
    visibleItems = [
      { name: "Iniciar sesión", path: "/login" },
      ...visibleItems,
    ];
  }

  // ====== RENDER HEADER ======
  return (
    <header id="header" className={scrolled ? "scrolled" : ""}>
      <div id="div-header">
        {/* Botón menú hamburguesa */}
        <div className="menu-toggle-container">
          {iconMenu && (
            <img
              src={toggle ? "/assets/close.svg" : "/assets/hamburgermenu.svg"}
              className={`icon-header ${toggle ? "rotate" : ""}`}
              id={toggle ? "close-icon" : "hamburger-icon"}
              onClick={handleToggle}
              alt="Menu Toggle"
              tabIndex={0}
              aria-label={toggle ? "Cerrar menú" : "Abrir menú"}
            />
          )}
        </div>
        {/* Logo y acciones */}
        <div id="header-disabled">
          <Link to={"/"} className="logo-link" aria-label="Ir a inicio">
            <div id="container-logo-inicio" tabIndex={0}>
              {icon1 && (
                <>
                  <img
                    src={icon1}
                    id="img-lovebites"
                    alt="Logo"
                    className="logo-image"
                  />
                  <p className="logo-text-header">Love Bites</p>
                </>
              )}
            </div>
          </Link>
          {/* Acciones: Perfil y carrito */}
          <div
            className="header-actions"
            style={{ display: "flex", alignItems: "center" }}
          >
            {isAuthenticated && renderUserProfile()}
            <div className={`cart-container ${toggle ? "disabled" : ""}`}>
              {icon2 ? (
                link2 ? (
                  <Link to={link2} className="cart-link">
                    {typeof icon2 === "string" ? (
                      <div className="cart-link">
                        {icon2 === "/assets/shoppingcar.svg" && (
                          <div className="cart-badge">{cartLength()}</div>
                        )}
                        <img
                          src={icon2}
                          className="shoppin-car-header"
                          onClick={
                            icon2 === "/assets/shoppingcar.svg"
                              ? handleCartClick
                              : null
                          }
                          id={toggle ? "disabled-logo" : ""}
                          alt="Icon"
                        />
                      </div>
                    ) : (
                      // icon2 como componente JSX
                      <div className="custom-icon">{icon2}</div>
                    )}
                  </Link>
                ) : // Si no hay link2, solo renderiza el icono
                typeof icon2 === "string" ? (
                  <img src={icon2} className="shoppin-car-header" alt="Icon" />
                ) : (
                  <div className="custom-icon">{icon2}</div>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar menú hamburguesa */}
      <div
        className={`overlay ${toggle ? "active" : ""}`}
        onClick={handleClickOutside}
      ></div>

      {/* Menú lateral hamburguesa */}
      <nav className={`menu-list ${toggle ? "actives" : ""}`}>
        <div className="menu-title">SECCIONES</div>
        <ul className="menu-list-ul">
          {visibleItems.map((item, index) => (
            <Link to={item.path || "#"} key={index} className="div-link-menu">
              <li
                style={{ "--i": index }}
                className={`menu-item ${
                  location.pathname === item.path ? "active-menu-item" : ""
                }`}
                onClick={() => handleMenuItemClick(item)}
              >
                <span className="menu-item-text">{item.name}</span>
                <span className="menu-arrow">›</span>
              </li>
            </Link>
          ))}
        </ul>
        {menuItems.length > maxItems && (
          <div
            className={`menu-collapse-button ${toggle ? "visible" : ""}`}
            onClick={() => setShowAllItems(!showAllItems)}
          >
            {showAllItems ? "Ver menos" : "Ver más"}
          </div>
        )}
        {!isAuthenticated ? (
          <div className="cerrar-sesion-footer">
            <Link to="/login" className="menu-item cerrar-sesion-item">
              <span className="menu-item-text">Iniciar sesión</span>
              <span className="menu-arrow">›</span>
            </Link>
          </div>
        ) : (
          cerrarSesionItem && (
            <div className="cerrar-sesion-footer">
              <li
                className="menu-item cerrar-sesion-item"
                onClick={handleLogout}
              >
                <span className="menu-item-text">Cerrar sesión</span>
                <span className="menu-arrow">›</span>
              </li>
            </div>
          )
        )}
        {/* Footer social */}
        <div className="menu-footer">
          <p className="text-social">Síguenos en redes sociales</p>
          <div className="menu-social">
            <a href="#" className="social-link">
              <img
                src="/assets/facebook.svg"
                alt="Facebook"
                className="social-icons"
              />
            </a>
            <a href="#" className="social-link">
              <img
                src="/assets/instagram.svg"
                alt="Instagram"
                className="social-icons"
              />
            </a>
          </div>
        </div>
      </nav>
      {/* Modal de confirmación para cerrar sesión */}
      {showLogoutConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-modal">
            <p>¿Seguro que quieres cerrar sesión?</p>
            <div className="logout-confirm-buttons">
              <button className="btn-confirm-logout" onClick={confirmLogout}>
                Sí
              </button>
              <button className="btn-cancel-logout" onClick={cancelLogout}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
