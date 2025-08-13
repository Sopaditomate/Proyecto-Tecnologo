"use client";

import { Link } from "react-router-dom";
import { useState } from "react";
import { HeadProfile } from "../../../components/common/header/HeadProfile";
import * as Yup from "yup";
import axios from "axios";
import { Mail, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import "./forgot-password.css";

const VITE_API_URL = import.meta.env.VITE_API_URL;
// Esquema de validación con Yup
const emailSchema = Yup.string()
  .email("Correo electrónico inválido")
  .required("Correo electrónico requerido");

export function ForgotPasswordPage() {
  // Estados para controlar el formulario
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailsMatch, setEmailsMatch] = useState(true);
  const [emailValid, setEmailValid] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [confirmEmailTouched, setConfirmEmailTouched] = useState(false);

  // Validar email con Yup
  const validateEmail = (value) => {
    try {
      emailSchema.validateSync(value);
      return true;
    } catch {
      return false;
    }
  };

  // Manejar cambio de email
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailTouched(true);

    const isValid = validateEmail(value);
    setEmailValid(isValid);
    setEmailsMatch(isValid && value === confirmEmail);
  };

  // Manejar confirmación de email
  const handleConfirmEmailChange = (e) => {
    const value = e.target.value;
    setConfirmEmail(value);
    setConfirmEmailTouched(true);
    setEmailsMatch(validateEmail(email) && email === value);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar emails antes de enviar
    if (!emailValid || !emailsMatch) {
      alert(
        "Por favor, asegúrate de que los correos electrónicos sean válidos y coincidan."
      );
      return;
    }

    setSubmitted(true);
    setServerMessage("");

    try {
      const response = await axios.post(
        `${VITE_API_URL}/auth/forgot-password`,
        { email }
      );

      setServerMessage(
        response.data.message ||
          "Se ha enviado un correo de recuperación a tu dirección de email."
      );
    } catch (error) {
      setServerMessage(
        error.response?.data?.message ||
          "Ocurrió un error al intentar recuperar la contraseña."
      );
    } finally {
      setSubmitted(false);
    }
  };

  const isErrorMessage =
    serverMessage?.toLowerCase().includes("error") ||
    serverMessage?.toLowerCase().includes("usuario");

  return (
    <section className="forgot-password-section">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="card-header">
            <HeadProfile
              titleHead={"Recuperar Contraseña"}
              subtittleHead={""}
            />
            <p className="card-description">
              {serverMessage && !isErrorMessage
                ? "Revisa tu correo electrónico"
                : ""}
            </p>
          </div>

          {serverMessage ? (
            // Pantalla de confirmación o error
            <div className="success-container">
              <div className="success-icon-container">
                {/* Si hay un mensaje de error, mostrar el XCircle */}
                {isErrorMessage ? (
                  <XCircle className="error-icon" color="red" size={40} />
                ) : (
                  <CheckCircle
                    className="success-icon"
                    size={40}
                    style={{ marginTop: "20px" }}
                  />
                )}
              </div>
              <div
                className={`server-message ${
                  isErrorMessage ? "error-message" : "success-message"
                }`}
              >
                <p>{serverMessage}</p>
              </div>
              <div className="button-group">
                <Link to="/login" className="back-link">
                  <button type="button" className="back-button">
                    <ArrowLeft className="button-icon" />
                    Regresar al Login
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            // Formulario de recuperación
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-fields">
                <div className="field-group">
                  <label htmlFor="email" className="field-label">
                    Correo Electrónico
                  </label>
                  <div className="input-container">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      placeholder="tu@email.com"
                      className={`form-input ${
                        !emailTouched
                          ? ""
                          : emailValid && email
                          ? "input-valid"
                          : "input-error"
                      }`}
                      value={email}
                      onChange={handleEmailChange}
                      required
                      disabled={submitted}
                    />
                  </div>
                  {emailTouched && !emailValid && (
                    <p className="error-message">
                      Por favor, ingresa un correo válido.
                    </p>
                  )}
                </div>

                <div className="field-group">
                  <label htmlFor="confirmEmail" className="field-label">
                    Confirmar Correo Electrónico
                  </label>
                  <div className="input-container">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      id="confirmEmail"
                      placeholder="Confirma tu correo electrónico"
                      className={`form-input ${
                        !confirmEmailTouched
                          ? ""
                          : emailsMatch && confirmEmail
                          ? "input-valid"
                          : "input-error"
                      }`}
                      value={confirmEmail}
                      onChange={handleConfirmEmailChange}
                      required
                      disabled={submitted}
                    />
                  </div>
                  {confirmEmailTouched && !emailsMatch && (
                    <p className="error-message">
                      Los correos electrónicos no coinciden
                    </p>
                  )}
                </div>
              </div>

              <div className="info-message">
                <p>
                  Te enviaremos un enlace de recuperación a tu correo
                  electrónico. Revisa también tu carpeta de spam.
                </p>
              </div>

              <div className="button-group">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={!emailValid || !emailsMatch || submitted}
                >
                  {submitted ? "Enviando..." : "Enviar Enlace de Recuperación"}
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

        <div className="forgot-password-footer">
          <p>© 2024 Panadería Artesanal. Todos los derechos reservados.</p>
        </div>
      </div>
    </section>
  );
}
