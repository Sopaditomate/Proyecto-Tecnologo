import React, { useState } from "react";
import axios from "axios";

function ChangePasswordSection({ email }) {
  const [userEmail, setUserEmail] = useState(email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [touched, setTouched] = useState({});

  function validate() {
    if (!userEmail || !currentPassword || !newPassword || !confirmPassword) {
      return "Todos los campos son obligatorios.";
    }
    if (currentPassword.length < 8) {
      return "La contraseña actual debe tener al menos 8 caracteres.";
    }
    if (newPassword.length < 8) {
      return "La nueva contraseña debe tener al menos 8 caracteres.";
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
    if (
      (field === "currentPassword" ||
        field === "newPassword" ||
        field === "confirmPassword") &&
      !eval(field)
    ) {
      return "Este campo es obligatorio.";
    }
    if (
      field === "currentPassword" &&
      currentPassword.length > 0 &&
      currentPassword.length < 6
    ) {
      return "Debe tener al menos 6 caracteres.";
    }
    if (
      field === "newPassword" &&
      newPassword.length > 0 &&
      newPassword.length < 6
    ) {
      return "Debe tener al menos 6 caracteres.";
    }
    if (
      field === "confirmPassword" &&
      confirmPassword &&
      newPassword !== confirmPassword
    ) {
      return "Las contraseñas no coinciden.";
    }
    if (
      field === "newPassword" &&
      currentPassword &&
      newPassword === currentPassword
    ) {
      return "Debe ser diferente a la actual.";
    }
    return "";
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    setTouched({
      userEmail: true,
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });
    const error = validate();
    if (error) {
      setStatus(error);
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        "/user/change-password",
        {
          email: userEmail,
          currentPassword,
          newPassword,
        },
        {
          withCredentials: true,
        }
      );
      setStatus("¡Contraseña cambiada exitosamente!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setEditing(false);
      setTouched({});
    } catch (err) {
      setStatus(
        err.response?.data?.message || "Error al cambiar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tab-content">
      <div className="form-section" style={{ maxWidth: 400 }}>
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
            <input
              id="currentPassword"
              type="password"
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
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setTouched((t) => ({ ...t, newPassword: true }));
              }}
              minLength={6}
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
            {getInputError("newPassword") && (
              <div className="input-error-text">
                {getInputError("newPassword")}
              </div>
            )}
          </div>
          <div className="form-group">
            <label
              htmlFor="confirmPassword"
              className="label-change-password-profile"
            >
              Confirmar Nueva Contraseña *
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setTouched((t) => ({ ...t, confirmPassword: true }));
              }}
              minLength={6}
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
