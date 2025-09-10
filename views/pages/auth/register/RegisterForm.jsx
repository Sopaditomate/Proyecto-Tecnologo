"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HeadProfile } from "../../../components/common/header/HeadProfile.jsx";
import { registerSchema } from "../../../utils/validationSchema";
import "./register-form.css";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombres: "",
    apellidos: "",
    direccion: "",
    telefono: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Validación en tiempo real
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

  // Validar todo el formulario antes de enviar
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
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        formData
      );
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

  // Función para determinar la clase del input (verde, rojo o normal)
  const getInputClass = (name) => {
    if (errors[name]) return " input-error";
    if (formData[name] && !errors[name]) return " input-valid";
    return "";
  };

  return (
    
      <form
        className="form-login register-form-container"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Icono y título de cabecera */}
        <HeadProfile
          titleHead="Crear Cuenta"
          subtittleHead="Completa el formulario para registrarte"
          icon="/assets/user.svg"
        />

        <div className="register-form-columns">
          <div className="register-form-column">
            <div className="container-icons-input">
              <input
                type="text"
                name="nombres"
                placeholder="Nombres"
                value={formData.nombres}
                onChange={handleChange}
                className={`input-input${getInputClass("nombres")}`}
                required
              />
            </div>
            {errors.nombres && (
              <div className="error-message">{errors.nombres}</div>
            )}

            <div className="container-icons-input">
              <input
                type="text"
                name="apellidos"
                placeholder="Apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className={`input-input${getInputClass("apellidos")}`}
                required
              />
            </div>
            {errors.apellidos && (
              <div className="error-message">{errors.apellidos}</div>
            )}

            <div className="container-icons-input">
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={formData.direccion}
                onChange={handleChange}
                className={`input-input${getInputClass("direccion")}`}
                required
              />
            </div>
            {errors.direccion && (
              <div className="error-message">{errors.direccion}</div>
            )}
          </div>

          <div className="register-form-column">
            <div className="container-icons-input">
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                className={`input-email-user${getInputClass("email")}`}
                required
              />
            </div>
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}

            <div className="container-icons-input">
              <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
                className={`input-input${getInputClass("telefono")}`}
                required
              />
            </div>
            {errors.telefono && (
              <div className="error-message">{errors.telefono}</div>
            )}

            <div className="container-icons-input">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className={`input-input${getInputClass("password")}`}
                required
              />
            </div>
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}

            <div className="container-icons-input">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-input${getInputClass("confirmPassword")}`}
                required
              />
            </div>
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>
        </div>

        {errors.general && (
          <div className="error-message" style={{ textAlign: "center" }}>
            {errors.general}
          </div>
        )}
        {success && (
          <div className="success-message">
            ¡Registro exitoso! Redirigiendo...
          </div>
        )}

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
   
  );
}
