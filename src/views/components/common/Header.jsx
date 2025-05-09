"use client";

// Componente de encabezado con menú de navegación
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../../models/CartContext";
import "../../../styles/header/header.css";

export function Header({
  itemMenu = [],
  itemHeader = [],
  iconMenu,
  icon1,
  icon2,
  link,
  link2,
  footerRef,
}) {
  // Obtener la cantidad de productos en el carrito
  const { cartLength } = useCart();
  // Estados para controlar el menú y el efecto de scroll
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Efecto para detectar el scroll y cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menú cuando cambia la ubicación
  useEffect(() => {
    setToggle(false);
  }, [location]);

  // Navegar al carrito
  const goToCart = () => {
    navigate("/shoppingCart");
  };

  // Alternar el estado del menú
  const handleToggle = () => {
    setToggle((prev) => !prev);
  };

  // Cerrar el menú al hacer clic fuera
  const handleClickOutside = (event) => {
    if (event.target.classList.contains("overlay")) {
      setToggle(false);
    }
  };

  // Manejar clic en elemento del menú
  const handleMenuItemClick = (item) => {
    if (item.name === "Contacto") {
      setToggle(false);

      if (footerRef && footerRef.current) {
        footerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <header id="header" className={scrolled ? "scrolled" : ""}>
      <div id="div-header">
        <div className="menu-toggle-container">
          {iconMenu && (
            <img
              src={toggle ? "/assets/close.svg" : "/assets/hamburgermenu.svg"}
              className={`icon-header ${toggle ? "rotate" : ""}`}
              id={toggle ? "close-icon" : "hamburger-icon"}
              onClick={handleToggle}
              alt="Menu Toggle"
            />
          )}
        </div>

        <div id="header-disabled">
          <Link to={"/"} className="logo-link">
            <div id="container-logo-inicio">
              {icon1 && (
                <>
                  <img
                    src={icon1 || "/placeholder.svg"}
                    id="img-lovebites"
                    alt="Logo"
                  />
                  <p className="logo-text-header">Love Bites</p>
                </>
              )}
            </div>
          </Link>

          <div className="header-nav-links">
            {itemHeader.map((item, index) => (
              <Link
                to={item.path || "#"}
                key={index}
                id={toggle ? "disabled-text" : ""}
                onClick={() => handleMenuItemClick(item)}
              >
                <p className="nav-link">{item.name}</p>
              </Link>
            ))}
          </div>

          <div className={`cart-container ${toggle ? "disabled" : ""}`}>
            {icon2 && link2 ? (
              <Link to={link2} className="cart-link">
                {icon2 === "/assets/shoppingcar.svg" && (
                  <div className="cart-badge">{cartLength()}</div>
                )}
                <img
                  src={icon2 || "/placeholder.svg"}
                  className="shoppin-car-header"
                  onClick={goToCart}
                  id={toggle ? "disabled-logo" : ""}
                  alt="Shopping Cart"
                />
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>

      <div id="color-purple">
        {link ? (
          <Link to={link}>
            <button className="btn-back">
              <img
                src="/assets/arrowleftblack.svg"
                className="arrow-left"
                alt="Back Arrow"
              />
              Regresar
            </button>
          </Link>
        ) : (
          <div className="announcement-bar">
            <p>
              ¡Pan fresco todos los días! Envío gratis en pedidos mayores a
              $50.000
            </p>
          </div>
        )}
      </div>

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      <div
        className={`overlay ${toggle ? "active" : ""}`}
        onClick={handleClickOutside}
      ></div>

      {/* Menú lateral */}
      <nav className={`menu-list ${toggle ? "actives" : ""}`}>
        <ul>
          {itemMenu.map((item, index) => (
            <Link to={item.path || "#"} key={index} className="div-link-menu">
              <li
                style={{ "--i": index }}
                className={`menu-item ${
                  item.name === "Cerrar Sesion" ? "cerrar-sesion" : ""
                }`}
                onClick={() => handleMenuItemClick(item)}
              >
                {item.icon && (
                  <img
                    src={item.icon || "/placeholder.svg"}
                    alt={`${item.name} icon`}
                    className="menu-icon"
                  />
                )}
                {item.name}
              </li>
            </Link>
          ))}
        </ul>

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
    </header>
  );
}
