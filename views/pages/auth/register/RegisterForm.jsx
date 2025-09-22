"use client";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { registerSchema } from "../../../utils/validationSchema";
import { CheckCircle } from "lucide-react";

export function RegisterForm() {
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem("registrationFormData");
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
          email: "",
          nombres: "",
          apellidos: "",
          password: "",
          confirmPassword: "",
        };
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("registrationStep");
    return savedStep ? parseInt(savedStep) : 1;
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const navigate = useNavigate();

  const checkPasswordRequirements = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    setPasswordRequirements(requirements);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    localStorage.setItem("registrationFormData", JSON.stringify(updatedForm));

    if (name === "password") {
      checkPasswordRequirements(value);
    }

    try {
      await registerSchema.validateAt(name, updatedForm);
      setErrors((prev) => ({ ...prev, [name]: undefined }));

      if (name === "password" && updatedForm.confirmPassword) {
        await registerSchema.validateAt("confirmPassword", updatedForm);
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));

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
      setStep(2);
      localStorage.setItem("registrationStep", "2");
      startResendTimer();
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || "Error al registrar usuario",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ verification: "Ingresa un código válido de 6 dígitos" });
      return;
    }

    setVerificationLoading(true);
    setErrors({});

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-email`, {
        email: formData.email,
        code: verificationCode,
      });

      setStep(3);

      localStorage.removeItem("registrationStep");
      localStorage.removeItem("registrationFormData");

      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.",
            type: "success",
          },
        });
      }, 2000);
    } catch (error) {
      setErrors({
        verification:
          error.response?.data?.message || "Código inválido o expirado",
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setResendLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/resend-verification`,
        {
          email: formData.email,
        }
      );
      startResendTimer();
    } catch (error) {
      setErrors({
        verification:
          error.response?.data?.message || "Error al reenviar código",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const startResendTimer = () => {
    setCanResend(false);
    setTimeRemaining(60);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getInputClass = (name) => {
    if (errors[name]) return "form-input error";
    if (formData[name] && !errors[name]) return "form-input valid";
    return "form-input";
  };

  if (step === 3) {
    return (
      <div className="register-container">
        <div className="register-card" id="register-card">
          <div className="success-message-large">
            <CheckCircle className="success-icon" /> <h2>¡Registro exitoso!</h2>
            <p className="subtitle">
              Tu cuenta ha sido verificada correctamente.
            </p>
            <p className="redirect-msg">Redirigiendo al login...</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-icon">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                <rect width="24" height="24" rx="12" fill="#d97706" />
                <circle
                  cx="12"
                  cy="10"
                  r="3"
                  stroke="white"
                  strokeWidth="1.5"
                />
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

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <div className="form-columns">
              <div className="form-column">
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico *"
                    value={formData.email}
                    onChange={handleChange}
                    className={getInputClass("email")}
                    required
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="nombres"
                    placeholder="Nombres *"
                    value={formData.nombres}
                    onChange={handleChange}
                    className={getInputClass("nombres")}
                    required
                  />
                  {errors.nombres && (
                    <div className="error-message">{errors.nombres}</div>
                  )}
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="apellidos"
                    placeholder="Apellidos *"
                    value={formData.apellidos}
                    onChange={handleChange}
                    className={getInputClass("apellidos")}
                    required
                  />
                  {errors.apellidos && (
                    <div className="error-message">{errors.apellidos}</div>
                  )}
                </div>
              </div>

              <div className="form-column">
                <div className="form-group">
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Contraseña *"
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

                <div className="form-group">
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirmar contraseña *"
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
                    <div className="error-message">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}

            <div className="required-note">
              <small>* Campos obligatorios</small>
            </div>

            <div className="security-info">
              <h4 className="security-title">Requisitos de seguridad:</h4>
              <ul className="security-list">
                <li
                  className={`requirement-item ${
                    passwordRequirements.length ? "met" : "unmet"
                  }`}
                >
                  <span className="requirement-icon">
                    {passwordRequirements.length ? "✓" : "○"}
                  </span>
                  <span className="requirement-text">Mínimo 8 caracteres</span>
                </li>
                <li
                  className={`requirement-item ${
                    passwordRequirements.uppercase ? "met" : "unmet"
                  }`}
                >
                  <span className="requirement-icon">
                    {passwordRequirements.uppercase ? "✓" : "○"}
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
                    {passwordRequirements.lowercase ? "✓" : "○"}
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
                    {passwordRequirements.number ? "✓" : "○"}
                  </span>
                  <span className="requirement-text">Al menos un número</span>
                </li>
                <li
                  className={`requirement-item ${
                    passwordRequirements.special ? "met" : "unmet"
                  }`}
                >
                  <span className="requirement-icon">
                    {passwordRequirements.special ? "✓" : "○"}
                  </span>
                  <span className="requirement-text">
                    Al menos un carácter especial
                  </span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>

            <div className="login-link">
              <Link to="/login">¿Ya tienes cuenta? Iniciar sesión</Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-icon">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
              <rect width="24" height="24" rx="12" fill="#d97706" />
              <path
                d="M8 12l2 2 4-4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="register-title">Verifica tu Email</h1>
          <p className="register-subtitle">
            Hemos enviado un código de verificación a<br />
            <strong>{formData.email}</strong>
          </p>
        </div>

        <form
          className="register-form"
          onSubmit={handleVerification}
          noValidate
        >
          <div className="form-group">
            <input
              type="text"
              placeholder="Código de 6 dígitos"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setVerificationCode(value);
                if (errors.verification) {
                  setErrors({ ...errors, verification: "" });
                }
              }}
              className={`form-input verification-input ${
                errors.verification ? "error" : ""
              }`}
              maxLength={6}
              style={{
                textAlign: "center",
                fontSize: "1.5rem",
                letterSpacing: "0.5rem",
                fontWeight: "bold",
              }}
            />
            {errors.verification && (
              <div className="error-message">{errors.verification}</div>
            )}
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={verificationLoading || verificationCode.length !== 6}
          >
            {verificationLoading ? "Verificando..." : "Verificar Email"}
          </button>

          <div className="resend-section">
            <p>¿No recibiste el código?</p>
            <button
              type="button"
              className={`resend-button ${!canResend ? "disabled" : ""}`}
              onClick={handleResendCode}
              disabled={!canResend || resendLoading}
            >
              {resendLoading
                ? "Enviando..."
                : canResend
                ? "Reenviar código"
                : `Reenviar en ${timeRemaining}s`}
            </button>
          </div>

          <div className="change-email-section">
            <p className="warning-text">
              ⚠️ Si cambias el email, los datos actuales se eliminarán y deberás
              registrarte nuevamente.
            </p>
            <button
              type="button"
              className="change-email-button"
              onClick={() => {
                setStep(1);
                localStorage.setItem("registrationStep", "1");
                setVerificationCode("");
                setErrors({});
                setFormData({
                  email: "",
                  nombres: "",
                  apellidos: "",
                  password: "",
                  confirmPassword: "",
                });
                localStorage.setItem(
                  "registrationFormData",
                  JSON.stringify({
                    email: "",
                    nombres: "",
                    apellidos: "",
                    password: "",
                    confirmPassword: "",
                  })
                );
                setPasswordRequirements({
                  length: false,
                  uppercase: false,
                  lowercase: false,
                  number: false,
                  special: false,
                });
              }}
            >
              ← Registrarse con otro email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
