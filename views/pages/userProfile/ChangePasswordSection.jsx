"use client";

import { useState } from "react";
import axios from "axios";

function ChangePasswordSection({ showNotification }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [touched, setTouched] = useState({});

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const checkPasswordRequirements = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?@$!%*?&]/.test(password),
    };
    setPasswordRequirements(requirements);
  };

  function validate() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return "Todos los campos son obligatorios.";
    }

    if (currentPassword.length < 8) {
      return "La contraseña actual debe tener al menos 8 caracteres.";
    }

    if (newPassword.length < 8) {
      return "La nueva contraseña debe tener al menos 8 caracteres.";
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      return "La nueva contraseña debe contener al menos una letra minúscula.";
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      return "La nueva contraseña debe contener al menos una letra mayúscula.";
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      return "La nueva contraseña debe contener al menos un número.";
    }

    if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
      return "La nueva contraseña debe contener al menos un carácter especial (@$!%*?&).";
    }

    if (newPassword !== confirmPassword) {
      return "Las contraseñas nuevas no coinciden.";
    }

    if (currentPassword === newPassword) {
      return "La nueva contraseña debe ser diferente a la actual.";
    }

    return "";
  }

  const getInputError = (field) => {
    if (!touched[field]) return "";

    if (field === "currentPassword") {
      if (!currentPassword) {
        return "Este campo es obligatorio.";
      }
      if (currentPassword.length > 0 && currentPassword.length < 8) {
        return "Debe tener al menos 8 caracteres.";
      }
    }

    if (field === "newPassword") {
      if (!newPassword) {
        return "Este campo es obligatorio.";
      }
      if (newPassword.length > 0 && newPassword.length < 8) {
        return "Debe tener al menos 8 caracteres.";
      }
      if (newPassword.length >= 8 && !/(?=.*[a-z])/.test(newPassword)) {
        return "Debe contener al menos una letra minúscula.";
      }
      if (newPassword.length >= 8 && !/(?=.*[A-Z])/.test(newPassword)) {
        return "Debe contener al menos una letra mayúscula.";
      }
      if (newPassword.length >= 8 && !/(?=.*\d)/.test(newPassword)) {
        return "Debe contener al menos un número.";
      }
      if (newPassword.length >= 8 && !/(?=.*[@$!%*?&])/.test(newPassword)) {
        return "Debe contener al menos un carácter especial (@$!%*?&).";
      }
      if (currentPassword && newPassword === currentPassword) {
        return "Debe ser diferente a la contraseña actual.";
      }
    }

    if (field === "confirmPassword") {
      if (!confirmPassword) {
        return "Este campo es obligatorio.";
      }
      if (confirmPassword && newPassword !== confirmPassword) {
        return "Las contraseñas no coinciden.";
      }
    }

    return "";
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });
    const error = validate();
    if (error) {
      showNotification(error, "error");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/user/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          withCredentials: true,
        }
      );
      showNotification("¡Contraseña cambiada exitosamente!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setEditing(false);
      setTouched({});
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
    } catch (err) {
      showNotification(
        err.response?.data?.message ||
          (err.response ? JSON.stringify(err.response.data) : err.message) ||
          "Error al cambiar la contraseña.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tab-content-2">
      <div className="form-section" id="change-password-section">
        <h2>Cambiar Contraseña</h2>
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="form-change-password"
        >
          <div className="form-group">
            <label
              htmlFor="currentPassword"
              className="label-change-password-profile"
            >
              Contraseña Actual *
            </label>
            <div className="password-input-container">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setTouched((t) => ({ ...t, currentPassword: true }));
                }}
                minLength={8}
                required
                autoComplete="current-password"
                placeholder="Contraseña actual"
                disabled={!editing || loading}
                className={
                  getInputError("currentPassword")
                    ? "input-error"
                    : touched.currentPassword &&
                      currentPassword &&
                      !getInputError("currentPassword")
                    ? "input-success"
                    : ""
                }
                onBlur={() =>
                  setTouched((t) => ({ ...t, currentPassword: true }))
                }
              />
              {editing && (
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={loading}
                >
                  {showCurrentPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            {getInputError("currentPassword") && (
              <div className="input-error-text">
                {getInputError("currentPassword")}
              </div>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="newPassword"
              className="label-change-password-profile"
            >
              Nueva Contraseña *
            </label>
            <div className="password-input-container">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewPassword(value);
                  checkPasswordRequirements(value);
                  setTouched((t) => ({ ...t, newPassword: true }));
                }}
                minLength={8}
                required
                autoComplete="new-password"
                placeholder="Nueva contraseña"
                disabled={!editing || loading}
                className={
                  getInputError("newPassword")
                    ? "input-error"
                    : touched.newPassword &&
                      newPassword &&
                      !getInputError("newPassword")
                    ? "input-success"
                    : ""
                }
                onBlur={() => setTouched((t) => ({ ...t, newPassword: true }))}
              />

              {editing && (
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                >
                  {showNewPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {getInputError("newPassword") && (
              <div className="input-error-text">
                {getInputError("newPassword")}
              </div>
            )}
            <div className="security-info" style={{ marginTop: "1rem" }}>
              <h4 className="security-title">Requisitos de seguridad:</h4>
              <ul className="security-list">
                <li
                  className={`requirement-item ${
                    passwordRequirements.length ? "met" : "unmet"
                  }`}
                >
                  <span className="requirement-icon">
                    {passwordRequirements.length ? "✓" : "•"}
                  </span>
                  <span className="requirement-text">Mínimo 8 caracteres</span>
                </li>
                <li
                  className={`requirement-item ${
                    passwordRequirements.uppercase ? "met" : "unmet"
                  }`}
                >
                  <span className="requirement-icon">
                    {passwordRequirements.uppercase ? "✓" : "•"}
                  </span>
                  <span className="requirement-text">
                    Al menos una letra mayúscula
                  </span>
                </li>
                <li
                  className={`requirement-item ${
                    passwordRequirements.lowercase ? "met" : "unmet"
                  }`}
                >
                  <span className="requirement-icon">
                    {passwordRequirements.lowercase ? "✓" : "•"}
                  </span>
                  <span className="requirement-text">
                    Al menos una letra minúscula
                  </span>
                </li>
                <li
                  className={`requirement-item ${
                    passwordRequirements.number ? "met" : "unmet"
                  }`}
                >
                  <span className="requirement-icon">
                    {passwordRequirements.number ? "✓" : "•"}
                  </span>
                  <span className="requirement-text">Al menos un número</span>
                </li>
                <li
                  className={`requirement-item ${
                    passwordRequirements.special ? "met" : "unmet"
                  }`}
                >
                  <span className="requirement-icon">
                    {passwordRequirements.special ? "✓" : "•"}
                  </span>
                  <span className="requirement-text">
                    Al menos un carácter especial
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label
              htmlFor="confirmPassword"
              className="label-change-password-profile"
            >
              Confirmar Nueva Contraseña *
            </label>
            <div className="password-input-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setTouched((t) => ({ ...t, confirmPassword: true }));
                }}
                minLength={8}
                required
                autoComplete="new-password"
                placeholder="Confirmar nueva contraseña"
                disabled={!editing || loading}
                className={
                  getInputError("confirmPassword")
                    ? "input-error"
                    : touched.confirmPassword &&
                      confirmPassword &&
                      !getInputError("confirmPassword")
                    ? "input-success"
                    : ""
                }
                onBlur={() =>
                  setTouched((t) => ({ ...t, confirmPassword: true }))
                }
              />
              {editing && (
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            {getInputError("confirmPassword") && (
              <div className="input-error-text">
                {getInputError("confirmPassword")}
              </div>
            )}
          </div>

          <div className="form-actions" style={{ display: "flex", gap: 10 }}>
            {!editing ? (
              <button
                type="button"
                className="btn-primary-inline"
                style={{ marginBottom: 20 }}
                onClick={() => setEditing(true)}
              >
                Cambiar Contraseña
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="btn-primary-inline"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar Contraseña"}
                </button>
                <button
                  type="button"
                  className="btn-secondary-inline"
                  disabled={loading}
                  onClick={() => {
                    setEditing(false);
                    setStatus("");
                    setTouched({});
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                    setPasswordRequirements({
                      length: false,
                      uppercase: false,
                      lowercase: false,
                      number: false,
                      special: false,
                    });
                  }}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
          {status && (
            <div
              style={{
                marginTop: 15,
                color: status.includes("exitosamente") ? "green" : "red",
              }}
            >
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordSection;
