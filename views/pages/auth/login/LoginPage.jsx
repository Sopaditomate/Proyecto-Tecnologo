"use client";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HeadProfile } from "../../../components/common/header/HeadProfile.jsx";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { loginSchema } from "../../../utils/validationSchema";
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
        { withCredentials: true }
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
    <section id="section-login">
      <form onSubmit={handleLogin} className="form-login">
        <HeadProfile titleHead={"Iniciar Sesión"} />

        {serverError && <p className="error-message">{serverError}</p>}

        <div id="container-email-password">
          <input
            type="email"
            name="email"
            placeholder="Usuario (Correo electrónico)"
            className={`input-email-user${
              errors.email
                ? " input-error"
                : formData.email
                ? " input-valid"
                : ""
            }`}
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error-message">{errors.email}</p>}

          <div className="input-password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              className={`input-password-login${
                errors.password
                  ? " input-error"
                  : formData.password
                  ? " input-valid"
                  : ""
              }`}
              value={formData.password}
              onChange={handleChange}
            />
            <span
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="toggle-password-icon"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.password && (
            <p className="error-message">{errors.password}</p>
          )}
        </div>

        <div id="container-checkbox-forgot">
          <div className="div-checkbox-p">
            <input
              type="checkbox"
              className="input-checkbox"
              id="remember-me"
            />
            <label htmlFor="remember-me">Recordar datos</label>
          </div>
          <Link to="/forgotYourPassword" className="link-forgot-your-password">
            <span>¿Olvidaste tu contraseña?</span>
          </Link>
        </div>

        <div className="button-container">
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
          <Link to="/register" className="link-register">
            <button type="button" className="btn-register">
              Registrarse
            </button>
          </Link>
        </div>
      </form>
    </section>
  );
}
