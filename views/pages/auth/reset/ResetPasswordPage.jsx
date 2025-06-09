"use client";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSearchParams, Link } from "react-router-dom";
import { HeadProfile } from "../../../components/common/header/HeadProfile";
import axios from "axios";
import { resetPasswordSchema } from "../../../utils/validationSchema";
import "./reset-password.css";

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Obtiene el token de la URL
  const searchParams = useSearchParams();
  const token = searchParams[0].get("token");

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
        { token, newPassword }
      );
      setServerMessage(response.data.message || "Contraseña restablecida.");
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
    <section id="section-login">
      <form onSubmit={handleSubmit} className="form-login">
        <HeadProfile titleHead={"Restablecer Contraseña"} subtittleHead={""} />
        {serverMessage ? (
          <>
            <div className="server-message">
              <p>{serverMessage}</p>
            </div>
            <div className="button-container">
              <Link to="/login">
                <button type="button">Regresar</button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div id="container-email-password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nueva contraseña"
                className={`input-password${
                  errors.newPassword
                    ? " input-error"
                    : newPassword
                    ? " input-valid"
                    : ""
                }`}
                value={newPassword}
                onChange={handleNewPasswordChange}
                required
                disabled={loading}
              />
              <span
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="toggle-password-icon-forgot"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors.newPassword && (
                <p className="error-message">{errors.newPassword}</p>
              )}
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirmar nueva contraseña"
                className={`input-password${
                  errors.confirm
                    ? " input-error"
                    : confirm
                    ? " input-valid"
                    : ""
                }`}
                value={confirm}
                onChange={handleConfirmChange}
                required
                disabled={loading}
              />
              <span
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="toggle-password-icon-forgot"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors.confirm && (
                <p className="error-message">{errors.confirm}</p>
              )}
            </div>
            <div className="button-container">
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? "Guardando..." : "Restablecer"}
              </button>
              <Link to="/login">
                <button type="button">Regresar</button>
              </Link>
            </div>
            {errors.general && (
              <div className="error-message" style={{ textAlign: "center" }}>
                {errors.general}
              </div>
            )}
          </>
        )}
      </form>
    </section>
  );
}
