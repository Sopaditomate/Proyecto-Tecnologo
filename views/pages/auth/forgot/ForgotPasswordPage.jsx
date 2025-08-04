"use client";

import { Link } from "react-router-dom";
import { useState } from "react";
import { HeadProfile } from "../../../components/common/header/HeadProfile";
import * as Yup from "yup";
import axios from "axios";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import "./forgot-password.css";

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
      // Cambia la URL por la de tu backend real
      const response = await axios.post(
        "http://localhost:44070/api/auth/forgot-password",
        {
          email,
        }
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

  return (
    <section className="forgot-password-section">
      <div className="forgot-password-container">
        {/* Logo y encabezado */}
        {/* <div className="forgot-password-header">
          <img src="/public/images/lovebites-logo.jpg" className="logo-image" />
          <h1 className="bakery-title">Panadería Artesanal</h1>
          <p className="bakery-subtitle">El sabor de la tradición</p>
        </div> */}

        <div className="forgot-password-card">
          <div className="card-header">
            <HeadProfile
              titleHead={"Recuperar Contraseña"}
              subtittleHead={""}
            />
            <p className="card-description">
              {serverMessage
                ? "Revisa tu correo electrónico"
                : "Ingresa tu correo electrónico para recuperar tu contraseña"}
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
                    Regresar al Login
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            // Formulario de recuperación
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-fields">
                {/* Campo Email */}
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

                {/* Campo Confirmar Email */}
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

              {/* Información adicional */}
              <div className="info-message">
                <p>
                  Te enviaremos un enlace de recuperación a tu correo
                  electrónico. Revisa también tu carpeta de spam.
                </p>
              </div>

              {/* Botones */}
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

        {/* Footer */}
        <div className="forgot-password-footer">
          <p>© 2024 Panadería Artesanal. Todos los derechos reservados.</p>
        </div>
      </div>
    </section>
  );
}
