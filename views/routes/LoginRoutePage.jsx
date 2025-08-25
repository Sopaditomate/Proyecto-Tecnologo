"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LoginPage } from "../pages/auth/login/LoginPage"
import { useAuth } from "../context/AuthContext"

export function LoginRoutePage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate("/admin")
      } else {
        navigate("/catalogo")
      }
    }
  }, [isAuthenticated, isAdmin, navigate])

  return (
    <div className="page-container">
      <LoginPage />
    </div>
  )
}
