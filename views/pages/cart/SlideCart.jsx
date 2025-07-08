"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { ProductRecommendation } from "./ProductRecommendation";
import { CheckoutModal } from "./CheckoutModal";
import AddressAutocomplete from "../../components/maps/AddressAutocomplete";
import "./slide-cart.css";
import axios from "axios";

// Componente para el botón de disminuir cantidad con hover
function MinusButton({ disabled, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label="Disminuir cantidad"
      disabled={disabled}
      className="minus-btn"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      -
      {disabled && isHovered && (
        <span
          className="minus-btn-disabled-hint"
          title="No puedes disminuir más"
        >
          🚫
        </span>
      )}
    </button>
  );
}

// Componente de notificación
function PaymentNotification({ show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Se oculta después de 4 segundos
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="payment-notification">
      <div className="content">
        <span>⚠️</span>
        <div className="message">
          <strong>No se puede proceder al pago</strong>
          <br />
          <span>Completa tu perfil para realizar pedidos</span>
        </div>
        <button onClick={onClose}>×</button>
      </div>
    </div>
  );
}

export function SlideCart() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    closeCart,
    addProductToCart,
    removeProductFromCart,
    deleteProductFromCart,
    clearCart,
    getProductTotal,
    getCartSubtotal,
    getShippingCost,
    setShippingCostValue,
    getTaxes,
    getCartTotal,
    getRecommendedProducts,
    deliveryAddress,
    setDeliveryAddress,
  } = useCart();

  //Estado para mostrar/ocultar resumen
  const [showSummary, setShowSummary] = useState(true);
  // Estado para el modal de checkout
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  // Confirmaciones
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  // Productos recomendados
  const recommendedProducts = getRecommendedProducts(3);
  // Estado para el error de dirección
  const [addressError, setAddressError] = useState("");
  // Estados para la dirección y el autocompletado
  const [addressCoordinates, setAddressCoordinates] = useState(null);
  const [deliveryDistance, setDeliveryDistance] = useState(null);
  const [deliveryDuration, setDeliveryDuration] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileAddress, setProfileAddress] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  // Estado para la notificación de pago
  const [showPaymentNotification, setShowPaymentNotification] = useState(false);
  // Referencias para el autocompletado de Google Places
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  // Referencias para los mensajes de confirmación
  const deleteConfirmationRef = useRef(null);
  const clearConfirmationRef = useRef(null);

  // Función para verificar si el perfil está completo
  const isProfileComplete = (profile) => {
    if (!profile) return false;
    // Verificar que todos los campos requeridos estén completos
    const hasRequiredFields =
      profile.NOMBRES &&
      profile.NOMBRES.trim() !== "" &&
      profile.APELLIDOS &&
      profile.APELLIDOS.trim() !== "" &&
      profile.DIRECCION &&
      profile.DIRECCION.trim() !== "" &&
      profile.TELEFONO &&
      profile.TELEFONO.trim() !== "";

    // Verificar que el email esté verificado
    const isEmailVerified = profile.verified === 1 || profile.VERIFIED === 1;

    // Verificar que el teléfono esté verificado
    const isPhoneVerified = profile.verified_phone === 1;

    return hasRequiredFields && isEmailVerified && isPhoneVerified;
  };

  const loadUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.get(`${API_URL}/user/profile`, {
        withCredentials: true,
      });
      if (response.data.success && response.data.data.DIRECCION) {
        const userAddress = response.data.data.DIRECCION;
        setProfileAddress(userAddress);
        setDeliveryAddress(userAddress);
        // Calcular distancia automáticamente si hay dirección
        if (userAddress.trim()) {
          calculateDistanceForAddress(userAddress);
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadCompleteUserProfile = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.get(`${API_URL}/user/profile`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setUserProfile(response.data.data);
      }
    } catch (error) {
      console.error("Error loading complete user profile:", error);
    }
  };

  // Cargar dirección del perfil del usuario
  useEffect(() => {
    if (isAuthenticated && isCartOpen) {
      if (!deliveryAddress) {
        loadUserProfile();
      }
      loadCompleteUserProfile();
    }
  }, [isAuthenticated, isCartOpen]);

  // Effect para manejar clics fuera del mensaje de confirmación de eliminar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        confirmDelete &&
        deleteConfirmationRef.current &&
        !deleteConfirmationRef.current.contains(event.target)
      ) {
        setConfirmDelete(null);
      }
    };

    if (confirmDelete) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [confirmDelete]);

  // Effect para manejar clics fuera del mensaje de confirmación de vaciar carrito
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        confirmClear &&
        clearConfirmationRef.current &&
        !clearConfirmationRef.current.contains(event.target)
      ) {
        setConfirmClear(false);
      }
    };

    if (confirmClear) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [confirmClear]);

  // Calcular distancia para una dirección específica
  const calculateDistanceForAddress = (address) => {
    if (!window.google || !window.google.maps) return;

    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: ["Cra. 129 #131-50, Suba, Bogotá"],
        destinations: [address],
        travelMode: "DRIVING",
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === "OK" && response.rows[0].elements[0].status === "OK") {
          const distanceResult = response.rows[0].elements[0].distance;
          const durationResult = response.rows[0].elements[0].duration;
          setDeliveryDistance(distanceResult.text);
          setDeliveryDuration(durationResult.text);
          const distanceInKm = distanceResult.value / 1000;
          const calculatedShipping = Math.max(
            5000,
            Math.round(distanceInKm * 2000)
          );
          if (typeof setShippingCostValue === "function") {
            setShippingCostValue(calculatedShipping);
          }
        }
      }
    );
  };

  // Inicializar Google Places Autocomplete
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
      return () => {
        const scripts = document.querySelectorAll(
          `script[src*="maps.googleapis.com"]`
        );
        scripts.forEach((s) => s.parentNode?.removeChild(s));
      };
    } else {
      initAutocomplete();
    }
  }, [isAuthenticated, isCartOpen]);

  // Inicializar el autocompletado
  const initAutocomplete = () => {
    if (
      !inputRef.current ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places
    )
      return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "co" },
      }
    );

    autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
  };

  // Manejar selección de un lugar
  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (place && place.formatted_address) {
      setDeliveryAddress(place.formatted_address);
      if (place.geometry && place.geometry.location) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setAddressCoordinates(coords);
        calculateDistanceForAddress(place.formatted_address);
      } else {
        geocodeAddress(place.formatted_address);
      }
    }
  };

  // Geocodificar dirección
  const geocodeAddress = (address) => {
    if (!window.google || !window.google.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const coords = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        setAddressCoordinates(coords);
        calculateDistanceForAddress(address);
      }
    });
  };

  // Manejar clic en el botón de checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      closeCart();
      navigate("/login");
      return;
    }

    // Verificar si el perfil está completo
    if (userProfile && !isProfileComplete(userProfile)) {
      setShowPaymentNotification(true);
      return;
    }

    if (!deliveryAddress.trim()) {
      setAddressError("Por favor ingresa una dirección de entrega");
      return;
    }

    setAddressError("");
    setShowCheckoutModal(true);
  };

  // Cerrar el modal de checkout
  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
  };

  // Eliminar producto
  const handleDeleteClick = (product) => setConfirmDelete(product.id);
  const handleCancelDelete = () => setConfirmDelete(null);
  const handleConfirmDelete = (product) => {
    deleteProductFromCart(product);
    setConfirmDelete(null);
  };

  // Vaciar carrito
  const handleClearCart = () => setConfirmClear(true);
  const handleCancelClear = () => setConfirmClear(false);
  const handleConfirmClear = () => {
    clearCart();
    setConfirmClear(false);
  };

  // Truncar descripción
  const truncateDescription = (text, maxLength = 60) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Variable para determinar si hay alguna confirmación activa
  const hasActiveConfirmation = confirmDelete !== null || confirmClear;

  return (
    <>
      {/* Notificación de pago */}
      <PaymentNotification
        show={showPaymentNotification}
        onClose={() => setShowPaymentNotification(false)}
      />

      {/* Overlay para cerrar el carrito al hacer clic fuera */}
      <div
        className={`slide-cart-overlay ${isCartOpen ? "active" : ""}`}
        onClick={closeCart}
      ></div>

      {/* Overlay para las confirmaciones */}
      {hasActiveConfirmation && <div className="confirmation-overlay"></div>}

      {/* Carrito deslizable */}
      <div
        className={`slide-cart ${isCartOpen ? "open" : ""} ${
          hasActiveConfirmation ? "dimmed" : ""
        }`}
      >
        {/* Encabezado del carrito */}
        <div className="slide-cart-header">
          <h2>Tu Carrito</h2>
          <button className="close-cart-btn" onClick={closeCart}>
            ×
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="slide-cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart-message">
              <img
                src="/assets/shopping-cart-empty.svg"
                alt="Carrito vacío"
                className="empty-cart-icon"
              />
              <p>Tu carrito está vacío</p>
              <button className="browse-products-btn" onClick={closeCart}>
                Explorar productos
              </button>
            </div>
          ) : (
            <div className="cart-items-container">
              {/* Botón para vaciar carrito */}
              <div className="empty-cart-btn-container">
                <button
                  className="empty-cart-btn"
                  onClick={handleClearCart}
                  aria-label="Vaciar carrito"
                >
                  Vaciar carrito
                </button>
              </div>

              {cart.map((item) => {
                const maxDesc = 40;
                const isLongDesc =
                  item.description && item.description.length > maxDesc;
                const shortDesc = isLongDesc
                  ? item.description.slice(0, maxDesc) + "..."
                  : item.description;
                const price = Number(item.price) || 0;
                const discount = Number(item.discount) || 0;
                const minusDisabled =
                  item.cantidad <= 1 || confirmDelete === item.id;

                return (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-image">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.nameProduct}
                      />
                      {discount > 0 && (
                        <span className="discount-badge mini">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    <div className="cart-item-details">
                      <h3
                        className="name-product-mini"
                        title={item.nameProduct}
                      >
                        {item.nameProduct}
                      </h3>
                      <p className="cart-item-description">
                        {item.description}
                      </p>
                      <div className="mini-price-row">
                        <span className="discounted-price mini">
                          $
                          {(discount > 0
                            ? price * (1 - discount / 100) * item.cantidad
                            : price * item.cantidad
                          ).toFixed(3)}
                        </span>
                        {discount > 0 && (
                          <span className="original-price mini">
                            ${(price * item.cantidad).toFixed(3)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <MinusButton
                          disabled={minusDisabled}
                          onClick={() => {
                            if (item.cantidad <= 1) {
                              handleDeleteClick(item);
                            } else {
                              removeProductFromCart(item);
                            }
                          }}
                        />
                        <span>{item.cantidad}</span>
                        <button
                          onClick={() => {
                            addProductToCart(item);
                          }}
                          aria-label="Aumentar cantidad"
                          disabled={confirmDelete === item.id}
                        >
                          +
                        </button>
                      </div>

                      {/* Confirmación para eliminar producto */}
                      {confirmDelete === item.id ? (
                        <div
                          className="delete-confirmation"
                          ref={deleteConfirmationRef}
                        >
                          <p>¿Eliminar producto?</p>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="delete-confirm-btn"
                              onClick={() => handleConfirmDelete(item)}
                            >
                              Sí
                            </button>
                            <button
                              className="delete-cancel-btn"
                              onClick={handleCancelDelete}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="remove-item-btn"
                          onClick={() => handleDeleteClick(item)}
                          aria-label="Eliminar producto"
                          style={{ marginTop: "0.5rem" }}
                        >
                          <img src="/assets/delete.svg" alt="Eliminar" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sección de recomendaciones */}
          {cart.length > 0 && (
            <div className="recommendations-section">
              <h3>Recomendados para ti</h3>
              <div className="recommendations-container">
                {recommendedProducts.map((product) => (
                  <ProductRecommendation
                    key={product.id}
                    product={product}
                    onAdd={() => {
                      addProductToCart(product);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pie del carrito con resumen y checkout */}
        {cart.length > 0 && (
          <div className="slide-cart-footer">
            <button
              className="toggle-details-btn"
              onClick={() => setShowSummary(!showSummary)}
            >
              {showSummary ? "Ocultar resumen" : "Mostrar resumen"}
            </button>

            <div className={`details ${!showSummary ? "hidden" : ""}`}>
              {isAuthenticated ? (
                <div className="delivery-address">
                  <label htmlFor="address">Dirección de entrega:</label>
                  {isLoadingProfile ? (
                    <div className="loading-address">
                      <span>Cargando dirección...</span>
                    </div>
                  ) : (
                    <AddressAutocomplete
                      value={deliveryAddress}
                      onAddressSelect={({ address }) => {
                        setDeliveryAddress(address);
                        if (addressError) setAddressError("");
                      }}
                      onDistanceCalculated={({
                        distanceValue,
                        durationValue,
                        isValid,
                      }) => {
                        if (isValid) {
                          const distanceInKm = distanceValue / 1000;
                          const calculatedShipping = Math.max(
                            5000,
                            Math.round(distanceInKm * 2000)
                          );
                          setShippingCostValue(calculatedShipping);
                        }
                      }}
                      warehouseAddress="Cra. 129 #131-50, Suba, Bogotá"
                      disabled={false}
                      className=""
                      error={addressError}
                      touched={true}
                    />
                  )}
                  {addressError && (
                    <div className="address-error">{addressError}</div>
                  )}
                </div>
              ) : (
                <div className="login-prompt">
                  <p className="warning-text-cart">
                    Inicia sesión para poder hacer la compra
                  </p>
                </div>
              )}

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${getCartSubtotal().toFixed(3)}</span>
                </div>
                <div className="summary-row">
                  <span>Envío</span>
                  <span>
                    {getShippingCost() === 0
                      ? "Gratis"
                      : `$${getShippingCost().toFixed(3)}`}
                  </span>
                </div>
                <div className="summary-row">
                  <span>IVA (19%)</span>
                  <span>${getTaxes().toFixed(3)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(3)}</span>
                </div>
              </div>

              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Ir a pagar
              </button>
            </div>
          </div>
        )}

        {/* Confirmación para vaciar carrito */}
        {confirmClear && (
          <div className="clear-cart-confirmation" ref={clearConfirmationRef}>
            <p>¿Vaciar todo el carrito?</p>
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <button
                className="clear-confirm-btn"
                onClick={handleConfirmClear}
              >
                Sí
              </button>
              <button className="clear-cancel-btn" onClick={handleCancelClear}>
                No
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de checkout */}
      {showCheckoutModal && (
        <CheckoutModal
          onClose={closeCheckoutModal}
          cartItems={cart}
          subtotal={getCartSubtotal()}
          shipping={getShippingCost()}
          taxes={getTaxes()}
          total={getCartTotal()}
          address={deliveryAddress}
        />
      )}
    </>
  );
}
