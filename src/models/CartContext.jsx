"use client";

// Contexto para gestionar el carrito de compras en toda la aplicación
import { useState, createContext, useContext, useEffect } from "react";

// Crear contexto del carrito
export const CartContext = createContext();

export function CartProvider({ children }) {
  // Estado del carrito con persistencia en localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    try {
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (e) {
      console.error("Error al analizar el carrito desde localStorage", e);
      return [];
    }
  });

  // Sincronizar carrito con localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Añadir producto al carrito
  const addProductToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);

      if (existingProduct) {
        // Si el producto ya existe, incrementar cantidad
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Si es nuevo, añadirlo con cantidad 1
        return [...prevCart, { ...product, cantidad: 1 }];
      }
    });
  };

  // Eliminar una unidad de un producto
  const removeProductFromCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);

      if (existingProduct) {
        if (existingProduct.cantidad <= 1) {
          // Si solo queda 1, eliminar el producto
          return prevCart.filter((item) => item.id !== product.id);
        } else {
          // Reducir cantidad
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

  // Eliminar completamente un producto
  const deleteProductFromCart = (product) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== product.id));
  };

  // Calcular total de un producto
  const getProductTotal = (productId) => {
    const product = cart.find((item) => item.id === productId);
    if (product) {
      return product.price * product.cantidad;
    }
    return 0;
  };

  // Calcular total del carrito
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.cantidad, 0);
  };

  // Calcular cantidad total de productos
  const cartLength = () => {
    return cart.reduce((totalLength, item) => totalLength + item.cantidad, 0);
  };

  // Valores proporcionados por el contexto
  const value = {
    cart,
    addProductToCart,
    removeProductFromCart,
    deleteProductFromCart,
    getProductTotal,
    getCartTotal,
    cartLength,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook personalizado para usar el contexto del carrito
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
