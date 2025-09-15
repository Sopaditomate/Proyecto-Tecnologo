"use client";

import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { HeadProfile } from "../../../components/common/header/HeadProfile";
import axios from "axios";
import { resetPasswordSchema } from "../../../utils/validationSchema";
import { Lock, Wheat, ArrowLeft, CheckCircle, Shield } from "lucide-react";
import "./reset-password.css";

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);

  // Obtiene el token de la URL
  const searchParams = useSearchParams();
  const token = searchParams[0].get("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setCheckingToken(false);
      navigate("/forgot-password", { replace: true });
      return;
    }
    axios
      .post(`${import.meta.env.VITE_API_URL}/auth/validate-reset-token`, {
        token,
      })
      .then(() => {
        setTokenValid(true);
      })
      .catch((err) => {
        console.error("Error validando token:", err); // <-- AGREGA ESTO
        setTokenValid(false);
        navigate("/forgot-password", { replace: true });
      })
      .finally(() => setCheckingToken(false));
  }, [token, navigate]);

  const validateField = async (field, value) => {
    try {
      await resetPasswordSchema.validateAt(field, {
        newPassword,
        confirm,
        [field]: value,
      });
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [field]: err.message }));
    }
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    validateField("newPassword", e.target.value);
    // También valida confirm para mantener la sincronía
    if (confirm) validateField("confirm", confirm);
  };

  const handleConfirmChange = (e) => {
    setConfirm(e.target.value);
    validateField("confirm", e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerMessage("");

    try {
      await resetPasswordSchema.validate(
        { newPassword, confirm },
        { abortEarly: false }
      );

      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          token,
          newPassword,
        }
      );

      setServerMessage(
        response.data.message || "Contraseña restablecida correctamente."
      );
    } catch (err) {
      if (err.name === "ValidationError" && err.inner) {
        const formErrors = {};
        err.inner.forEach((error) => {
          formErrors[error.path] = error.message;
        });
        setErrors(formErrors);
      } else if (err.response?.data?.message) {
        setServerMessage(err.response.data.message);
      } else if (err.message) {
        setServerMessage(err.message);
      } else {
        setServerMessage("Ocurrió un error. Intenta de nuevo.");
      }
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="reset-password-section">
      <div className="reset-password-container">
        {/* Logo y encabezado */}
        {/* <div className="reset-password-header">
          <div className="logo-container">
            <Wheat className="logo-icon" />
          </div>
          <h1 className="bakery-title">Panadería Artesanal</h1>
          <p className="bakery-subtitle">El sabor de la tradición</p>
        </div> */}

        <div className="reset-password-card">
          <div className="card-header">
            {/* <div className="security-icon-container">
              <Shield className="security-icon" />
            </div> */}
            <HeadProfile
              titleHead={"Restablecer Contraseña"}
              subtittleHead={""}
            />
            <p className="card-description">
              {serverMessage
                ? "Tu contraseña ha sido actualizada"
                : "Crea una nueva contraseña segura para tu cuenta"}
            </p>
          </div>

          {serverMessage ? (
            // Pantalla de confirmación
            <div className="success-container">
              <div className="success-icon-container">
                <CheckCircle className="success-icon" />
              </div>
              <div className="server-message success-message">
                <p>{serverMessage}</p>
              </div>
              <div className="button-group">
                <Link to="/login" className="back-link">
                  <button type="button" className="back-button">
                    <ArrowLeft className="button-icon" />
                    Ir al Login
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            // Formulario de restablecimiento
            <form onSubmit={handleSubmit} className="reset-password-form">
              <div className="form-fields">
                {/* Campo Nueva Contraseña */}
                <div className="field-group">
                  <label htmlFor="newPassword" className="field-label">
                    Nueva Contraseña
                  </label>
                  <div className="input-container">
                    <Lock className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      placeholder="Ingresa tu nueva contraseña"
                      className={`form-input ${
                        errors.newPassword
                          ? "input-error"
                          : newPassword
                          ? "input-valid"
                          : ""
                      }`}
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="password-toggle"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="error-message">{errors.newPassword}</p>
                  )}
                </div>

                {/* Campo Confirmar Contraseña */}
                <div className="field-group">
                  <label htmlFor="confirmPassword" className="field-label">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="input-container">
                    <Lock className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="Confirma tu nueva contraseña"
                      className={`form-input ${
                        errors.confirm
                          ? "input-error"
                          : confirm
                          ? "input-valid"
                          : ""
                      }`}
                      value={confirm}
                      onChange={handleConfirmChange}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="password-toggle"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirm && (
                    <p className="error-message">{errors.confirm}</p>
                  )}
                </div>
              </div>

              {/* Información de seguridad */}
              <div className="security-info">
                <h4 className="security-title">Requisitos de seguridad:</h4>
                <ul className="security-list">
                  <li>Mínimo 8 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos una letra minúscula</li>
                  <li>Al menos un número</li>
                  <li>Al menos un carácter especial</li>
                </ul>
              </div>

              {/* Error general */}
              {errors.general && (
                <div className="general-error">
                  <p>{errors.general}</p>
                </div>
              )}

              {/* Botones */}
              <div className="button-group">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Restablecer Contraseña"}
                </button>

                <Link to="/login" className="back-link">
                  <button type="button" className="back-button">
                    <ArrowLeft className="button-icon" />
                    Regresar al Login
                  </button>
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="reset-password-footer">
          <p>© 2024 Panadería Artesanal. Todos los derechos reservados.</p>
        </div>
      </div>
    </section>
  );
}
