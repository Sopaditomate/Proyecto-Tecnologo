"use client";

// Página de inicio de sesión
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeadProfile } from "../../../components/common/header/HeadProfile";
import {
  validateEmail,
  validatePassword,
  loginUser,
} from "../../../../controllers/AuthController";
import "../login/login-page.css";

export function LoginPage() {
  // Estados para email y contraseña con validación
  const [email, setEmail] = useState({
    value: "",
    borderColor: "black",
    text: "",
  });

  const [password, setPassword] = useState({
    value: "",
    borderColor: "black",
    text: "",
  });

  const navigate = useNavigate();

  // Validar email
  function handleEmail(e) {
    const valueEmail = e.target.value;
    const isValid = validateEmail(valueEmail);

    setEmail({
      value: valueEmail,
      borderColor: isValid ? "green" : "red",
      text: isValid ? "" : "El correo electrónico no es válido",
    });
  }

  // Validar contraseña
  function handlePassword(e) {
    const valuePassword = e.target.value;
    const { isValid, text } = validatePassword(valuePassword);

    setPassword({
      value: valuePassword,
      borderColor: isValid ? "green" : "red",
      text: isValid ? "" : text,
    });
  }

  // Manejar inicio de sesión
  function handleLogin(e) {
    e.preventDefault();

    // Validar entradas
    if (
      email.value === "" ||
      password.value === "" ||
      email.borderColor === "red" ||
      password.borderColor === "red"
    ) {
      // Actualizar estado para mostrar errores de validación
      if (email.value === "") {
        setEmail((prev) => ({ ...prev, borderColor: "red" }));
      }

      if (password.value === "") {
        setPassword((prev) => ({ ...prev, borderColor: "red" }));
      }

      return;
    }

    // Intentar inicio de sesión
    const result = loginUser(email.value, password.value);

    if (result.success) {
      navigate("/catalogo");
    } else {
      // Manejar fallo de inicio de sesión
      setPassword((prev) => ({
        ...prev,
        text: "Credenciales inválidas. Por favor intente de nuevo.",
      }));
    }
  }

  return (
    <section id="section-login">
      <form onSubmit={handleLogin} className="form-login">
        <HeadProfile titleHead={"Iniciar Sesión"} />
        <div id="container-email-password">
          <input
            type="email"
            placeholder="Usuario (Correo electrónico)"
            className="input-email-user"
            onChange={handleEmail}
            style={{
              borderBottom: `2px solid ${email.borderColor}`,
            }}
          />
          {email.text && (
            <p style={{ color: "red", fontSize: "12px" }}>{email.text}</p>
          )}

          <input
            type="password"
            placeholder="Contraseña"
            className="input-password"
            onChange={handlePassword}
            style={{ borderBottom: `2px solid ${password.borderColor}` }}
          />
          {password.text && (
            <p style={{ color: "red", fontSize: "12px" }}>{password.text}</p>
          )}
        </div>

        <div id="container-checkbox-forgot">
          <div className="div-checkbox-p">
            <input
              type="checkbox"
              className="input-checkbox"
              id="remember-me"
            />
            <label htmlFor="remember-me">Recordar datos</label>
          </div>
          <Link to="/forgotYourPassword">
            <p className="link-forgot-your-password">
              ¿Olvidaste tu contraseña?
            </p>
          </Link>
        </div>

        <div className="button-container">
          <button type="submit" className="btn-login">
            Iniciar Sesión
          </button>
          <Link to="/createAccount">
            <button type="button" className="btn-register">
              Registrarse
            </button>
          </Link>
        </div>
      </form>
    </section>
  );
}
