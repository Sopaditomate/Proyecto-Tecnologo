"use client";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { registerSchema } from "../../../utils/validationSchema";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    nombres: "",
    apellidos: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Manejo de cambios en tiempo real
  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    try {
      await registerSchema.validateAt(name, updatedForm);
      setErrors((prev) => ({ ...prev, [name]: undefined }));

      // Validar confirmPassword si cambia password
      if (name === "password" && updatedForm.confirmPassword) {
        await registerSchema.validateAt("confirmPassword", updatedForm);
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));

      // Validar confirmPassword si cambia password
      if (name === "password" && updatedForm.confirmPassword) {
        try {
          await registerSchema.validateAt("confirmPassword", updatedForm);
          setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
        } catch (err2) {
          setErrors((prev) => ({ ...prev, confirmPassword: err2.message }));
        }
      }
    }
  };

  // Validar todo el formulario
  const validateForm = async () => {
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const isValid = await validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        ...formData,
        direccion: "", // Campos opcionales vacíos
        telefono: "",
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || "Error al registrar usuario",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clase CSS para inputs según estado
  const getInputClass = (name) => {
    if (errors[name]) return "form-input error";
    if (formData[name] && !errors[name]) return "form-input valid";
    return "form-input";
  };

  if (success) {
    return (
      <div className="register-container">
        <div className="register-card">
          <div className="success-message-large">
            <div className="success-icon">✓</div>
            <h2>¡Registro exitoso!</h2>
            <p>Tu cuenta ha sido creada correctamente.</p>
            <p>Redirigiendo al login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <div className="register-icon">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
              <rect width="24" height="24" rx="12" fill="#d97706" />
              <circle cx="12" cy="10" r="3" stroke="white" strokeWidth="1.5" />
              <path
                d="M7 17a5 5 0 0 1 10 0"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="register-title">Crear Cuenta</h1>
          <p className="register-subtitle">
            Completa el formulario para registrarte
          </p>
        </div>

        {/* Formulario */}
        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              className={getInputClass("email")}
              required
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          {/* Nombres */}
          <div className="form-group">
            <input
              type="text"
              name="nombres"
              placeholder="Nombres"
              value={formData.nombres}
              onChange={handleChange}
              className={getInputClass("nombres")}
              required
            />
            {errors.nombres && (
              <div className="error-message">{errors.nombres}</div>
            )}
          </div>

          {/* Apellidos */}
          <div className="form-group">
            <input
              type="text"
              name="apellidos"
              placeholder="Apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className={getInputClass("apellidos")}
              required
            />
            {errors.apellidos && (
              <div className="error-message">{errors.apellidos}</div>
            )}
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className={getInputClass("password")}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={getInputClass("confirmPassword")}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          {/* Botón de envío */}
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>

          {/* Link a login */}
          <div className="login-link">
            <Link to="/login">¿Ya tienes cuenta? Iniciar sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
