"use client";

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show loading indicator while verifying authentication
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect if admin role is required but user is not an admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/catalogo" />;
  }

  // If all checks pass, show the protected content
  return children;
}
