"use client";
import { registerSchema } from "../../utils/validationSchema";
import AddressAutocomplete from "../../components/maps/AddressAutocomplete";
import { useCart } from "../../context/CartContext";

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
  touchedFields,
  errors,
  setErrors,
}) {
  const { setDeliveryAddress, setShippingCost } = useCart(); 

  // Validación en tiempo real con Yup
  const handleFieldChange = async (e) => {
    handleChange(e);
    const { name, value } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    try {
      await registerSchema.validateAt(name, { ...form, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  // Para AddressAutocomplete
  const handleAddressSelect = async ({ address }) => {
    setForm((f) => ({ ...f, direccion: address }));
    setTouchedFields((prev) => ({ ...prev, direccion: true }));
    try {
      await registerSchema.validateAt("direccion", {
        ...form,
        direccion: address,
      });
      setErrors((prev) => ({ ...prev, direccion: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, direccion: err.message }));
    }
  };

  // Nuevo: callback para calcular envío
  const handleDistanceCalculated = ({ distanceValue, isValid }) => {
    if (isValid) {
      const distanceInKm = distanceValue / 1000;
      const calculatedShipping = Math.max(
        5000,
        Math.round(distanceInKm * 2000)
      );
      setShippingCost(calculatedShipping);
    }
  };

  const getInputClass = (field) => {
    if (!touchedFields[field]) return "";
    if (errors[field]) return "input-error";
    if (form[field] && !errors[field]) return "input-success";
    return "";
  };

  // Modifica el handleSubmit (o la función que uses para guardar)
  const handleSave = async (e) => {
    e.preventDefault();
    await handleSubmit(e); // tu lógica de guardado original
    setDeliveryAddress(form.direccion); // <--- sincroniza con el SlideCart
  };

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
              onChange={handleFieldChange}
              disabled={!editing}
              placeholder="Ingresa tus nombres"
              className={getInputClass("nombres")}
              onBlur={handleFieldChange}
            />
            {touchedFields.nombres && errors.nombres && (
              <span className="input-error-text">{errors.nombres}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="apellidos">Apellidos *</label>
            <input
              id="apellidos"
              name="apellidos"
              type="text"
              value={form.apellidos || ""}
              onChange={handleFieldChange}
              disabled={!editing}
              placeholder="Ingresa tus apellidos"
              className={getInputClass("apellidos")}
              onBlur={handleFieldChange}
            />
            {touchedFields.apellidos && errors.apellidos && (
              <span className="input-error-text">{errors.apellidos}</span>
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
              className="input-disabled"
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
              onChange={handleFieldChange}
              disabled={!editing}
              maxLength={10}
              pattern="3[0-9]{9}"
              title="Debe ser un número colombiano (Ej: 3001234567)"
              placeholder="3001234567"
              className={getInputClass("telefono")}
              onBlur={handleFieldChange}
            />
            {touchedFields.telefono && errors.telefono && (
              <span className="input-error-text">{errors.telefono}</span>
            )}
          </div>
        </div>
      </div>
      <div className="form-section">
        <h2>Información Adicional</h2>
        <div className="form-group">
          <label htmlFor="direccion">Dirección Completa *</label>
          {editing ? (
            <AddressAutocomplete
              value={form.direccion || ""}
              onAddressSelect={handleAddressSelect}
              onDistanceCalculated={handleDistanceCalculated} // <-- agrega esto
              warehouseAddress="Cra. 129 #131-50, Suba, Bogotá"
              disabled={!editing}
              className={getInputClass("direccion")}
              placeholder="Buscar dirección..."
            />
          ) : (
            <input
              id="direccion"
              name="direccion"
              type="text"
              value={form.direccion || ""}
              disabled
              placeholder="Calle, número, barrio, ciudad"
              className="input-disabled"
            />
          )}
          {touchedFields.direccion && errors.direccion && (
            <span className="input-error-text">{errors.direccion}</span>
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
                setErrors({});
              }}
              disabled={isLoading}
            >
              <span>Cancelar</span>
            </button>
            <button
              className={`btn-primary-inline ${isLoading ? "loading" : ""} ${
                !hasChanges() ? "disabled" : ""
              }`}
              onClick={handleSave} // <--- usa handleSave en vez de handleSubmit
              disabled={isLoading || !hasChanges()}
            >
              <span>{isLoading ? "Guardando..." : "Guardar Cambios"}</span>
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
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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
