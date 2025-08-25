"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Crear contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Verificar si hay una sesión activa al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/check`, {
          withCredentials: true,
        });

        if (response.data.isAuthenticated) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          if (process.env.NODE_ENV === "development") {
            console.warn("No autorizado. El usuario no está autenticado.");
          }
          setUser(null);
        } else {
          console.error("Error al verificar autenticación:", error);
          setError("Error al verificar autenticación");
        }
      } finally {
        setLoading(false);
      }
    };

    // Solo una llamada, elimina checkServer para evitar doble 401
    checkAuthStatus();
  }, [API_URL]);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.user);

        // Configurar el token en los headers para futuras peticiones si viene el token
        if (response.data.token) {
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.token}`;
        }

        setError(null);
        return { success: true };
      }
    } catch (error) {
      console.error("Error en login:", error);
      const message =
        error.response?.data?.message || "Error al iniciar sesión";
      setError(message);
      return { success: false, error: message };
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setUser(null);
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Valores proporcionados por el contexto
  const value = {
    user,
    setUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin:
      user?.role === 100001 || (user?.roleInfo && user?.roleInfo.id === 100001),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
