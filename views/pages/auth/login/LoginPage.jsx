"use client";
import { BackToHome } from "../../../components/common/backToHome/BackToHome.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HeadProfile } from "../../../components/common/header/HeadProfile.jsx";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { loginSchema } from "../../../utils/validationSchema";
import { User, Lock } from "lucide-react";
import "./login-page.css";

export function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const redirectPath = location.state?.path;

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    try {
      await loginSchema.validateAt(name, updatedForm);
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  async function handleLogin(e) {
    e.preventDefault();
    setServerError("");
    setErrors({});

    try {
      await loginSchema.validate(formData, { abortEarly: false });
    } catch (validationError) {
      const formErrors = {};
      validationError.inner.forEach((err) => {
        formErrors[err.path] = err.message;
      });
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        // Redirección condicional según el rol
        if (redirectPath) {
          navigate(redirectPath);
        } else if (
          response.data.user.role === 100001 ||
          (response.data.user.roleInfo &&
            response.data.user.roleInfo.id === 100001)
        ) {
          navigate("/admin");
        } else {
          navigate("/catalogo");
        }
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Error al iniciar sesión. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-section">
      <div className="login-container">
        <BackToHome />
        {/* Logo y encabezado */}
        {/* <div className="login-header">
          <div className="logo-container">
            
          </div>
          <h1 className="bakery-title">Panadería Artesanal</h1>
          <p className="bakery-subtitle">El sabor de la tradición</p>
        </div> */}

        <div className="login-card">
          <div className="card-header">
            <HeadProfile titleHead={"Iniciar Sesión"} />
            <p className="card-description">
              Accede a tu cuenta para gestionar tu panadería
            </p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {serverError && <div className="server-error">{serverError}</div>}

            <div className="form-fields">
              {/* Campo Email */}
              <div className="field-group">
                <label htmlFor="email" className="field-label">
                  Correo Electrónico
                </label>
                <div className="input-container">
                  <User className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="tu@email.com"
                    className={`form-input ${
                      errors.email
                        ? "input-error"
                        : formData.email
                        ? "input-valid"
                        : ""
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <p className="error-message">{errors.email}</p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="field-group">
                <label htmlFor="password" className="field-label">
                  Contraseña
                </label>
                <div className="input-container">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className={`form-input ${
                      errors.password
                        ? "input-error"
                        : formData.password
                        ? "input-valid"
                        : ""
                    }`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="password-toggle"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="error-message">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Recordar sesión y recuperar contraseña */}
            <div className="form-options">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  id="remember-me"
                />
                <label htmlFor="remember-me" className="checkbox-label">
                  Recordar datos
                </label>
              </div>
              <Link to="/forgot-password" className="forgot-password-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botones */}
            <div className="button-group">
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>

              <div className="register-section">
                <p className="register-text">
                  ¿No tienes una cuenta?{" "}
                  <Link to="/register" className="register-link">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>© 2024 Panadería Artesanal. Todos los derechos reservados.</p>
        </div>
      </div>
    </section>
  );
}
