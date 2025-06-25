"use client";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { registerSchema } from "../../../utils/validationSchema";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./register-form.css";

const icons = {
  email: (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="12" fill="green" />
      <path
        d="M7 8h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Zm0 0 5 4 5-4"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  user: (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="12" fill="green" />
      <circle cx="12" cy="10" r="3" stroke="white" strokeWidth="1.5" />
      <path
        d="M7 17a5 5 0 0 1 10 0"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  lock: (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="12" fill="green" />
      <rect
        x="7"
        y="11"
        width="10"
        height="6"
        rx="2"
        stroke="white"
        strokeWidth="1.5"
      />
      <path d="M9 11V9a3 3 0 1 1 6 0v2" stroke="white" strokeWidth="1.5" />
    </svg>
  ),
};

const steps = [
  {
    name: "email",
    label: "Agrega tu e-mail",
    description: "Recibirás información de tu cuenta.",
    icon: icons.email,
    type: "email",
    button: "Continuar",
  },
  {
    name: "nombres",
    label: "Elige un nombre",
    description: "Se mostrará a las personas que interactúen contigo.",
    icon: icons.user,
    type: "text",
    button: "Continuar",
  },
  {
    name: "apellidos",
    label: "Agrega tus apellidos",
    description: "Tus apellidos reales.",
    icon: icons.user,
    type: "text",
    button: "Continuar",
  },
  {
    name: "password",
    label: "Crea tu contraseña",
    description: "Mantendrás tu cuenta protegida.",
    icon: icons.lock,
    type: "password",
    button: "Crear Contraseña",
  },
];

const STORAGE_KEY = "registerWizardData";

export function RegisterWizard() {
  // Cargar estado inicial desde localStorage si existe
  const getInitialState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        step: saved?.step ?? -1,
        formData: saved?.formData ?? {
          email: "",
          nombres: "",
          apellidos: "",
          password: "",
          confirmPassword: "",
        },
        completedSteps: saved?.completedSteps ?? [],
      };
    } catch {
      return {
        step: -1,
        formData: {
          email: "",
          nombres: "",
          apellidos: "",
          password: "",
          confirmPassword: "",
        },
        completedSteps: [],
      };
    }
  };

  const initialState = getInitialState();

  const [step, setStep] = useState(initialState.step);
  const [formData, setFormData] = useState(initialState.formData);
  const [completedSteps, setCompletedSteps] = useState(
    initialState.completedSteps
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Guardar en localStorage cada vez que cambia algo importante
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step, completedSteps, formData })
    );
  }, [step, completedSteps, formData]);

  // Limpiar localStorage al finalizar registro
  useEffect(() => {
    if (success) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [success]);

  // Función para cancelar y limpiar todo (debe ir antes de cualquier uso)
  const handleCancel = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStep(-1);
    setFormData({
      email: "",
      nombres: "",
      apellidos: "",
      password: "",
      confirmPassword: "",
    });
    setCompletedSteps([]);
    setErrors({});
    setShowSuccess(false);
    navigate("/login"); // O "/" si prefieres ir al home
  };

  // Pantalla de pasos
  if (step === -1) {
    return (
      <section className="register-page">
        <h2
          className="ml-wizard-title"
          style={{ marginBottom: 24, textAlign: "center" }}
        >
          Completa los datos para crear tu cuenta
        </h2>
        <div className="ml-wizard-steps-list">
          {steps.map((s, idx) => (
            <div
              key={s.name}
              className={`ml-wizard-step-list${
                completedSteps.includes(idx) ? " done" : ""
              }${completedSteps.length === idx ? " active" : ""}`}
            >
              <span className="ml-wizard-icon">{s.icon}</span>
              <div className="ml-wizard-step-content">
                <div className="ml-wizard-label-2">{s.label}</div>
                <div className="ml-wizard-desc-2">{s.description}</div>
              </div>
              {completedSteps.includes(idx) && (
                <span
                  className="ml-wizard-check"
                  style={{ marginLeft: "auto" }}
                >
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#4caf50" />
                    <path
                      d="M7 13l3 3 7-7"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
              {completedSteps.length === idx && (
                <button
                  className="ml-wizard-btn-ml"
                  style={{ minWidth: 90, marginLeft: "auto" }}
                  onClick={() => setStep(idx)}
                  type="button"
                >
                  {s.button}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="ml-wizard-login-link" style={{ marginTop: 24 }}>
          <Link to="/login">¿Ya tienes cuenta? Iniciar sesión</Link>
        </div>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button
            type="button"
            className="ml-wizard-btn-cancel"
            onClick={handleCancel}
          >
            Cancelar registro
          </button>
        </div>
      </section>
    );
  }

  // Pantalla de paso activo
  const current = steps[step];

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    try {
      // Valida solo el campo que cambió
      await registerSchema.validateAt(name, newFormData);
      setErrors((prevErrors) => {
        const { [name]: _, ...rest } = prevErrors;
        return rest;
      });
    } catch (err) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: err.message,
      }));
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    try {
      if (current.name === "password") {
        // Validar ambos campos en el paso de contraseña
        await registerSchema.validateAt("password", formData);
        await registerSchema.validateAt("confirmPassword", formData);
      } else {
        await registerSchema.validateAt(current.name, formData);
      }

      setErrors({});
      setCompletedSteps((prev) => [...prev, step]);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Volver al panel de pasos
        setStep(-1);
      }, 900);
    } catch (err) {
      setErrors({ [err.path]: err.message });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        ...formData,
        direccion: "",
        telefono: "",
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      let msg = "Error al registrar usuario";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      if (err.inner && Array.isArray(err.inner)) {
        const newErrors = {};
        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="success-message-register"
        style={{ textAlign: "center", marginTop: "2rem" }}
      >
        ¡Registro exitoso! Redirigiendo...
      </div>
    );
  }

  return (
    <section className="ml-wizard-card">
      <form
        className="ml-wizard-form-ml"
        onSubmit={step === steps.length - 1 ? handleSubmit : handleNext}
        autoComplete="off"
      >
        <div className="ml-wizard-icon-big">{current.icon}</div>
        <h2 className="ml-wizard-title">{current.label}</h2>
        <div className="ml-wizard-desc">{current.description}</div>
        {current.name !== "password" && (
          <input
            type={current.type}
            name={current.name}
            placeholder={current.label}
            value={formData[current.name]}
            onChange={handleChange}
            className={`ml-wizard-input${
              errors[current.name]
                ? " input-error"
                : formData[current.name]
                ? " input-valid"
                : ""
            }`}
            required
            autoFocus
          />
        )}
        {current.name !== "password" && errors[current.name] && (
          <div className="error-message">{errors[current.name]}</div>
        )}

        {current.name === "password" && (
          <>
            {/* Campo contraseña */}
            <div className="input-password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Crear contraseña"
                value={formData.password}
                onChange={handleChange}
                className={`ml-wizard-input${
                  errors.password
                    ? " input-error"
                    : formData.password
                    ? " input-valid"
                    : ""
                }`}
                required
              />
              <span
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="toggle-password-icon"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {current.name === "password" && (
              <>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </>
            )}

            {/* Campo confirmar contraseña */}
            <div className="input-password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`ml-wizard-input${
                  errors.confirmPassword
                    ? " input-error"
                    : formData.confirmPassword
                    ? " input-valid"
                    : ""
                }`}
                required
              />
              <span
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="toggle-password-icon"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </>
        )}

        {errors.general && (
          <div className="error-message" style={{ textAlign: "center" }}>
            {errors.general}
          </div>
        )}
        {showSuccess && (
          <div className="success-message">
            ¡{current.label} agregado correctamente!
          </div>
        )}
        <button type="submit" className="ml-wizard-btn-ml-2" disabled={loading}>
          {loading
            ? "Procesando..."
            : step === steps.length - 1
            ? "Crear cuenta"
            : current.button}
        </button>
        <div className="ml-wizard-login-link">
          <Link to="/login">¿Ya tienes cuenta? Iniciar sesión</Link>
        </div>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button
            type="button"
            className="ml-wizard-btn-cancel-2"
            onClick={handleCancel}
          >
            Cancelar registro
          </button>
        </div>
      </form>
    </section>
  );
}
