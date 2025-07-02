import React from "react";

export default function ProfileForm({
  form,
  profile,
  editing,
  isLoading,
  hasChanges,
  handleChange,
  handleSubmit,
  setEditing,
  originalForm,
  setForm,
  setTouchedFields,
  getFieldError,
}) {
  return (
    <div className="tab-content">
      <div className="form-section">
        <h2>Información Personal</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nombres">Nombres *</label>
            <input
              id="nombres"
              name="nombres"
              type="text"
              value={form.nombres || ""}
              onChange={handleChange}
              disabled={!editing}
              placeholder="Ingresa tus nombres"
            />
            {getFieldError("nombres", form.nombres) && (
              <span className="field-error">
                {getFieldError("nombres", form.nombres)}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="apellidos">Apellidos *</label>
            <input
              id="apellidos"
              name="apellidos"
              type="text"
              value={form.apellidos || ""}
              onChange={handleChange}
              disabled={!editing}
              placeholder="Ingresa tus apellidos"
            />
            {getFieldError("apellidos", form.apellidos) && (
              <span className="field-error">
                {getFieldError("apellidos", form.apellidos)}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="usuario">Correo Electrónico</label>
            <input
              id="usuario"
              type="email"
              value={profile.USUARIO || ""}
              disabled
              placeholder="correo@ejemplo.com"
            />
            <small className="field-note">
              ⚠️ El correo no se puede modificar
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="telefono">Teléfono *</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              value={form.telefono || ""}
              onChange={handleChange}
              disabled={!editing}
              maxLength={10}
              pattern="3[0-9]{9}"
              title="Debe ser un número colombiano (Ej: 3001234567)"
              placeholder="3001234567"
            />
            {getFieldError("telefono", form.telefono) && (
              <span className="field-error">
                {getFieldError("telefono", form.telefono)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="form-section">
        <h2>Información Adicional</h2>
        <div className="form-group">
          <label htmlFor="direccion">Dirección Completa *</label>
          <input
            id="direccion"
            name="direccion"
            type="text"
            value={form.direccion || ""}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Calle, número, barrio, ciudad"
          />
          {getFieldError("direccion", form.direccion) && (
            <span className="field-error">
              {getFieldError("direccion", form.direccion)}
            </span>
          )}
        </div>
        {editing && (
          <div className="form-actions-inline">
            <button
              className="btn-secondary-inline"
              onClick={() => {
                setEditing(false);
                setForm(originalForm);
                setTouchedFields({});
              }}
              disabled={isLoading}
            >
              <span>Cancelar</span>
            </button>
            <button
              className={`btn-primary-inline ${isLoading ? "loading" : ""} ${
                !hasChanges() ? "disabled" : ""
              }`}
              onClick={handleSubmit}
              disabled={isLoading || !hasChanges()}
            >
              <span>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </span>
              {isLoading && <div className="spinner"></div>}
            </button>
          </div>
        )}
      </div>
      {!editing && (
        <div className="form-actions">
          <button
            type="button"
            className="btn-edit-profile"
            onClick={() => setEditing(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editar Perfil
          </button>
        </div>
      )}
    </div>
  );
}