"use client";
import { Link } from "react-router-dom";
import { useState } from "react";
import { HeadProfile } from "../../../components/common/header/HeadProfile";
import * as Yup from "yup";
import axios from "axios";
import "./forgot-password.css"; // Asegúrate de tener este archivo CSS

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

  // Estilo del input de email según validación
  const emailStyle = !emailTouched
    ? { borderBottom: "2px solid #5c3317" }
    : emailValid && email
    ? { borderBottom: "2px solid green" }
    : { borderBottom: "2px solid red" };

  // Estilo del input de confirmación según validación
  const confirmEmailStyle = !confirmEmailTouched
    ? { borderBottom: "2px solid #5c3317" }
    : emailsMatch && confirmEmail
    ? { borderBottom: "2px solid green" }
    : { borderBottom: "2px solid red" };

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
        "http://localhost:5001/api/auth/forgot-password",
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
    <section id="section-login">
      <form onSubmit={handleSubmit} className="form-login">
        <HeadProfile
          titleHead={"Recuperar Contraseña Usuario"}
          subtittleHead={""}
        />
        {serverMessage ? (
          <>
            <div className="server-message">
              <p>{serverMessage}</p>
            </div>
            <div className="button-container">
              <Link to="/login">
                <button type="button" className="btn-login">
                  Regresar
                </button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div id="container-email-password">
              <input
                type="email"
                placeholder="(Correo electrónico)"
                className="input-email-user"
                value={email}
                onChange={handleEmailChange}
                style={emailStyle}
                required
                disabled={submitted}
              />
              {emailTouched && !emailValid && (
                <p className="error-message" id="error-message-email">
                  Por favor, ingresa un correo válido.
                </p>
              )}
              <input
                type="email"
                placeholder="Confirmar Correo electrónico"
                className="input-password"
                value={confirmEmail}
                onChange={handleConfirmEmailChange}
                style={confirmEmailStyle}
                required
                disabled={submitted}
              />
              {confirmEmailTouched && !emailsMatch && (
                <p className="error-message">
                  Los correos electrónicos no coinciden
                </p>
              )}
            </div>
            <div className="button-container">
              <button
                type="submit"
                className="btn-login"
                disabled={!emailValid || !emailsMatch || submitted}
              >
                {submitted ? "Enviando..." : "Confirmar"}
              </button>
              <Link to={"/login"}>
                <button type="button">Regresar</button>
              </Link>
            </div>
          </>
        )}
      </form>
      <style jsx>{`
        .error-message {
          color: #e53935;
          font-size: 13px;
          margin-top: -8px;
          margin-bottom: 8px;
        }
      `}</style>
    </section>
  );
}
