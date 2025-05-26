"use client";

import { useState, createContext, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { products } from "./ProductsData.js";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastify.css";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, loading } = useAuth();

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("nequi");

  const API_URL = import.meta.env.VITE_API_URL;
  const isInitialLoad = useRef(true);
  const isCartFromUserAction = useRef(false);

  // Cargar carrito desde localStorage si no hay usuario
  useEffect(() => {
    if (!user && !loading) {
      const localCart = localStorage.getItem("cart");
      setCart(localCart ? JSON.parse(localCart) : []);
      isInitialLoad.current = false;
    }
  }, [user, loading]);

  // Guardar carrito en localStorage si no hay usuario
  useEffect(() => {
    if (!user && !loading && !isInitialLoad.current) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user, loading]);

  // Cargar carrito del backend cuando cambia el usuario autenticado
  useEffect(() => {
    if (loading) return;

    const fetchCart = async () => {
      if (user && user.id) {
        try {
          const res = await axios.get(`${API_URL}/cart`, {
            withCredentials: true,
          });
          // Fusionar carrito local con el del backend solo si el backend está vacío
          const localCart = localStorage.getItem("cart");
          const localItems = localCart ? JSON.parse(localCart) : [];
          let mergedCart = res.data.items;
          if (
            (!res.data.items || res.data.items.length === 0) &&
            localItems.length > 0
          ) {
            mergedCart = localItems;
            // Guardar el carrito fusionado en el backend
            await axios.post(
              `${API_URL}/cart`,
              { items: mergedCart },
              { withCredentials: true }
            );
          }
          setCart(Array.isArray(mergedCart) ? mergedCart : []);
          localStorage.removeItem("cart"); // Limpia el carrito local después de fusionar
          isInitialLoad.current = false;
        } catch (e) {
          setCart([]);
          isInitialLoad.current = false;
        }
      } else if (!user && !loading) {
        // Ya se maneja arriba
      }
    };
    fetchCart();
  }, [user, loading]);

  // Sincronizar carrito con backend solo si el cambio fue por acción del usuario
  useEffect(() => {
    if (
      user &&
      user.id &&
      !isInitialLoad.current &&
      isCartFromUserAction.current
    ) {
      axios
        .post(`${API_URL}/cart`, { items: cart }, { withCredentials: true })
        .catch(() => {});
      isCartFromUserAction.current = false;
    }
  }, [cart, user]);

  // Funciones para modificar el carrito (marcan que el cambio es por acción del usuario)
  const addProductToCart = (product) => {
    isCartFromUserAction.current = true;
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, cantidad: 1 }];
      }
    });
  };

  // Función para mostrar la notificación de producto añadido
  const showAddToCartNotification = () => {
    toast.success("¡Producto añadido al carrito!", {
      className: "toastify-add",
      position: "top-right",
      autoClose: 10,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "colored",
      closeButton: false,
    });
  };

  // Función para mostrar la notificación de producto eliminado
  const showRemoveFromCartNotification = (product) => {
    toast.success(
      `Producto eliminado: ${product?.nameProduct || "(sin nombre)"}`,
      {
        position: "bottom-center",
        autoClose: 100,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "colored",
        closeButton: false,
      }
    );
  };

  // Función para mostrar la notificación al vaciar el carrito
  const showClearCartNotification = () => {
    toast.success("Carrito vaciado", {
      position: "bottom-center",
      autoClose: 100,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "colored",
      closeButton: false,
    });
  };

  const removeProductFromCart = (product) => {
    isCartFromUserAction.current = true;
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        if (existingProduct.cantidad <= 1) {
          return prevCart.filter((item) => item.id !== product.id);
        } else {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, cantidad: item.cantidad - 1 }
              : item
          );
        }
      }
      return prevCart;
    });
  };

  const deleteProductFromCart = (product) => {
    isCartFromUserAction.current = true;
    setCart((prevCart) => prevCart.filter((item) => item.id !== product.id));
    showRemoveFromCartNotification(product);
  };

  const clearCart = () => {
    isCartFromUserAction.current = true;
    setCart([]);
    showClearCartNotification();
  };

  const openCart = () => {
    setIsCartOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeCart = () => {
    setIsCartOpen(false);
    document.body.style.overflow = "auto";
  };

  const getProductTotal = (productId) => {
    const product = cart.find((item) => item.id === productId);
    if (product) {
      return product.price * product.cantidad;
    }
    return 0;
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.cantidad, 0);
  };

  const getShippingCost = () => {
    const subtotal = getCartSubtotal();
    if (subtotal >= 50) {
      return 0;
    }
    return 5;
  };

  const getTaxes = () => {
    return getCartSubtotal() * 0.19;
  };

  const getCartTotal = () => {
    return getCartSubtotal() + getShippingCost() + getTaxes();
  };

  const cartLength = () => {
    return cart.reduce((totalLength, item) => totalLength + item.cantidad, 0);
  };

  const getRecommendedProducts = (limit = 3) => {
    if (cart.length === 0) {
      return products.sort((a, b) => b.rating - a.rating).slice(0, limit);
    }
    const cartCategories = [...new Set(cart.map((item) => item.category))];
    const cartProductIds = cart.map((item) => item.id);
    const recommendations = products
      .filter(
        (product) =>
          cartCategories.includes(product.category) &&
          !cartProductIds.includes(product.id)
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);

    if (recommendations.length < limit) {
      const additionalProducts = products
        .filter(
          (product) =>
            !cartProductIds.includes(product.id) &&
            !recommendations.some((rec) => rec.id === product.id)
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit - recommendations.length);

      return [...recommendations, ...additionalProducts];
    }

    return recommendations;
  };

  const value = {
    cart,
    isCartOpen,
    openCart,
    closeCart,
    addProductToCart,
    showAddToCartNotification,
    showRemoveFromCartNotification,
    showClearCartNotification,
    removeProductFromCart,
    deleteProductFromCart,
    clearCart,
    getProductTotal,
    getCartSubtotal,
    getShippingCost,
    getTaxes,
    getCartTotal,
    cartLength,
    getRecommendedProducts,
    deliveryAddress,
    setDeliveryAddress,
    paymentMethod,
    setPaymentMethod,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
