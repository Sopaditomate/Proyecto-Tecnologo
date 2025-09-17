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
      <rect width="24" height="24" rx="12" fill="#d97706" />
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
      <rect width="24" height="24" rx="12" fill="#d97706" />
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
      <rect width="24" height="24" rx="12" fill="#d97706" />
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

export function RegisterWizard({ onStepChange }) {
  // Estados principales
  const getInitialState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        step: saved?.step ?? -1,
        formData: {
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

  // Estados para animaciones
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animatingStep, setAnimatingStep] = useState(null);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  // Montaje inicial con animación
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (onStepChange) onStepChange(step);
  }, [step, onStepChange]);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, completedSteps }));
  }, [step, completedSteps]);

  // Limpiar localStorage al finalizar registro
  useEffect(() => {
    if (success) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [success]);

  // Función para transiciones suaves entre pasos
  const transitionToStep = (nextStep) => {
    setIsTransitioning(true);
    setAnimatingStep(nextStep);

    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
      setAnimatingStep(null);
    }, 300);
  };

  // Función para cancelar y limpiar todo
  const handleCancel = () => {
    setIsTransitioning(true);
    setTimeout(() => {
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
      navigate("/login");
    }, 300);
  };

  // Pantalla de pasos principal
  if (step === -1) {
    return (
      <section
        className={`register-page-wizard ${mounted ? "wizard-mounted" : ""} ${
          isTransitioning ? "wizard-transitioning" : ""
        }`}
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? "translateY(20px)" : "translateY(0)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <h2
          className="ml-wizard-title animated-title"
          style={{
            marginBottom: 24,
            textAlign: "center",
            transform: mounted ? "translateY(0)" : "translateY(-20px)",
            opacity: mounted ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          Completa los datos para crear tu cuenta
        </h2>
        <div className="ml-wizard-steps-list">
          {steps.map((s, idx) => (
            <div
              key={s.name}
              className={`ml-wizard-step-list animated-step${
                completedSteps.includes(idx) ? " done" : ""
              }${completedSteps.length === idx ? " active" : ""}`}
              style={{
                transform: mounted ? "translateX(0)" : "translateX(-50px)",
                opacity: mounted ? 1 : 0,
                transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${
                  idx * 0.1
                }s`,
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              <span className="ml-wizard-icon animated-icon">{s.icon}</span>
              <div className="ml-wizard-step-content">
                <div className="ml-wizard-label-2">{s.label}</div>
                <div className="ml-wizard-desc-2">{s.description}</div>
              </div>
              {completedSteps.includes(idx) && (
                <span
                  className="ml-wizard-check animated-check"
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
                  className="ml-wizard-btn-ml animated-button"
                  style={{ minWidth: 90, marginLeft: "auto" }}
                  onClick={() => transitionToStep(idx)}
                  type="button"
                >
                  {s.button}
                </button>
              )}
            </div>
          ))}
        </div>
        <div
          className="ml-wizard-login-link animated-link"
          style={{
            marginTop: 24,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            opacity: mounted ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s",
          }}
        >
          <Link to="/login">¿Ya tienes cuenta? Iniciar sesión</Link>
        </div>
        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            opacity: mounted ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.5s",
          }}
        >
          <button
            type="button"
            className="ml-wizard-btn-cancel animated-cancel-btn"
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
        transitionToStep(-1);
      }, 1200);
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
        className="success-message-register animated-success"
        style={{
          textAlign: "center",
          marginTop: "2rem",
          transform: "scale(1)",
          animation: "successPulse 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        ¡Registro exitoso! Redirigiendo...
      </div>
    );
  }

  return (
    <section
      className="ml-wizard-card step-form"
      style={{
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning
          ? "scale(0.95) translateY(10px)"
          : "scale(1) translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <form
        className="ml-wizard-form-ml"
        onSubmit={step === steps.length - 1 ? handleSubmit : handleNext}
        autoComplete="off"
      >
        <div
          className="ml-wizard-icon-big animated-form-icon"
          style={{
            transform: showSuccess ? "scale(1.2)" : "scale(1)",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {current.icon}
        </div>

        <h2
          className="ml-wizard-title animated-form-title"
          style={{
            transform: "translateY(0)",
            opacity: 1,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
          }}
        >
          {current.label}
        </h2>

        <div
          className="ml-wizard-desc animated-form-desc"
          style={{
            transform: "translateY(0)",
            opacity: 1,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
          }}
        >
          {current.description}
        </div>

        {/* Campo regular */}
        {current.name !== "password" && (
          <div
            style={{
              transform: "translateY(0)",
              opacity: 1,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
            }}
          >
            <input
              type={current.type}
              name={current.name}
              placeholder={current.label}
              value={formData[current.name]}
              onChange={handleChange}
              className={`ml-wizard-input animated-input${
                errors[current.name]
                  ? " input-error"
                  : formData[current.name]
                  ? " input-valid"
                  : ""
              }`}
              required
              autoFocus
            />
            {errors[current.name] && (
              <div
                className="error-message animated-error"
                style={{
                  animation: "errorShake 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {errors[current.name]}
              </div>
            )}
          </div>
        )}

        {/* Campos de contraseña */}
        {current.name === "password" && (
          <div
            style={{
              transform: "translateY(0)",
              opacity: 1,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
            }}
          >
            <div className="input-password-container animated-password-container">
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
                className="toggle-password-icon animated-toggle-icon"
                style={{
                  transform: showPassword ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.2s ease",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && (
              <div
                className="error-message animated-error"
                style={{
                  animation: "errorShake 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {errors.password}
              </div>
            )}

            <div
              className="input-password-container animated-password-container"
              style={{
                marginTop: "1rem",
                transform: "translateY(0)",
                opacity: 1,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s",
              }}
            >
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
                className="toggle-password-icon animated-toggle-icon"
                style={{
                  transform: showPassword ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.2s ease",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.confirmPassword && (
              <div
                className="error-message animated-error"
                style={{
                  animation: "errorShake 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {errors.confirmPassword}
              </div>
            )}
          </div>
        )}

        {errors.general && (
          <div
            className="error-message animated-error"
            style={{
              textAlign: "center",
              animation: "errorShake 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {errors.general}
          </div>
        )}

        {showSuccess && (
          <div
            className="success-message animated-step-success"
            style={{
              animation: "successBounce 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            ¡{current.label} agregado correctamente!
          </div>
        )}

        <button
          type="submit"
          className="ml-wizard-btn-ml-2 animated-submit-btn"
          disabled={loading}
          style={{
            transform: loading ? "scale(0.98)" : "scale(1)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {loading
            ? "Procesando..."
            : step === steps.length - 1
            ? "Crear cuenta"
            : current.button}
        </button>

        <div
          className="ml-wizard-login-link animated-form-link"
          style={{
            transform: "translateY(0)",
            opacity: 1,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.6s",
          }}
        >
          <Link to="/login">¿Ya tienes cuenta? Iniciar sesión</Link>
        </div>

        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            transform: "translateY(0)",
            opacity: 1,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.7s",
          }}
        >
          <button
            type="button"
            className="ml-wizard-btn-cancel-2 animated-form-cancel"
            onClick={() => transitionToStep(-1)}
          >
            Cancelar registro
          </button>
        </div>
      </form>
    </section>
  );
}
