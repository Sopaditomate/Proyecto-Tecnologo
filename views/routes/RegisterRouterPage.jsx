"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterPage } from "../pages/auth/register/RegisterPage";
import { useAuth } from "../context/AuthContext";

export function RegisterRouterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/catalogo");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="page-container">
      <RegisterPage />
    </div>
  );
}
