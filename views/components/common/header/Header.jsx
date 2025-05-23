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
        <img
          src="/assets/profileiconwhite.svg"
          alt="Perfil"
          className="header-profile-avatar"
        />
        
        <span className="header-profile-name">
          {
            // Cambiar el nombre según el rol con interpolacion de variables o expresiones
            isAdmin
              ? `Administrador ${user?.nombres}` 
              : user?.nombres ? `Cliente ${user.nombres}` : "Usuario"
          }
        </span>

        {/* Opciones del desplegable: solo mostrar para clientes, no para admins */}
        {!isAdmin && isAuthenticated && (
          <div className="header-profile-dropdown">
            <div
              className="header-profile-dropdown-item"
              onClick={() => navigate("/profile")}
            >
              Mi Perfil
            </div>
            <div
              className="header-profile-dropdown-item"
              onClick={() => navigate("/orders")}
            >
              Mis Pedidos
            </div>
            <div className="header-profile-dropdown-item" onClick={handleLogout}>
              Cerrar Sesión
            </div>
          </div>
        )}
      </div>
    );
  };

  // ====== MENÚ LATERAL ======
  const menuItems = itemMenu.filter((item) => item.name !== "Cerrar Sesion");
  const cerrarSesionItem = itemMenu.find(
    (item) => item.name === "Cerrar Sesion"
  );
  const maxItems = 6;
  const visibleItems = showAllItems ? menuItems : menuItems.slice(0, maxItems);

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
              {icon2 && link2 ? (
                <Link to={link2} className="cart-link">
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
                      alt="Shopping Cart"
                      tabIndex={0}
                      aria-label="Abrir carrito"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleCartClick(e);
                      }}
                    />
                  </div>
                </Link>
              ) : (
                <div></div>
              )}
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
        {cerrarSesionItem && isAuthenticated && (
          <div className="cerrar-sesion-footer">
            <li className="menu-item cerrar-sesion-item" onClick={handleLogout}>
              <span className="menu-item-text">Cerrar sesión</span>
              <span className="menu-arrow">›</span>
            </li>
          </div>
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
            <button className="btn-confirm-logout" onClick={confirmLogout}>Sí</button>
            <button className="btn-cancel-logout" onClick={cancelLogout}>No</button>
          </div>
        </div>
      </div>
    )}
  </header>
  );
}
