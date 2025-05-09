"use client"; // Indicador para que este componente se renderice en el cliente

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Enrutamiento para navegación entre páginas
import { HeadProfile } from "../../components/auth/HeadProfile"; // Componente del encabezado de perfil
import {
  validateEmail, // Función para validar correos electrónicos
  validatePassword, // Función para validar contraseñas
  loginUser, // Función para intentar iniciar sesión
} from "../../../controllers/AuthController"; // Controladores de autenticación
import "../../../styles/login/login.css"; // Estilos específicos para la página de login

// Componente funcional de Login
export function Login() {
  // Estado para manejar el email y su validación
  const [email, setEmail] = useState({
    value: "",
    borderColor: "black",
    text: "",
  });

  // Estado para manejar la contraseña y su validación
  const [password, setPassword] = useState({
    value: "",
    borderColor: "black",
    text: "",
  });

  const navigate = useNavigate(); // Hook para redireccionar páginas

  // Manejador de cambios en el input de correo electrónico
  function handleEmail(e) {
    const valueEmail = e.target.value;
    const isValid = validateEmail(valueEmail); // Validar formato

    // Actualizar estado del email con su validez
    setEmail({
      value: valueEmail,
      borderColor: isValid ? "green" : "red",
      text: isValid ? "" : "El correo electrónico no es válido",
    });
  }

  // Manejador de cambios en el input de contraseña
  function handlePassword(e) {
    const valuePassword = e.target.value;
    const { isValid, text } = validatePassword(valuePassword); // Validar seguridad

    // Actualizar estado de la contraseña con su validez
    setPassword({
      value: valuePassword,
      borderColor: isValid ? "green" : "red",
      text: isValid ? "" : text,
    });
  }

  // Manejador del envío del formulario (evento onSubmit)
  function handleLogin(e) {
    e.preventDefault();

    // Validar si los campos están vacíos o incorrectos
    if (
      email.value === "" ||
      password.value === "" ||
      email.borderColor === "red" ||
      password.borderColor === "red"
    ) {
      // Mostrar errores si están vacíos
      if (email.value === "") {
        setEmail((prev) => ({ ...prev, borderColor: "red" }));
      }

      if (password.value === "") {
        setPassword((prev) => ({ ...prev, borderColor: "red" }));
      }

      return; // Salir si hay errores
    }

    // Intentar iniciar sesión
    const result = loginUser(email.value, password.value);

    if (result.success) {
      navigate("/catalogo"); // Redireccionar si es exitoso
    } else {
      // Mostrar error si las credenciales son incorrectas
      setPassword((prev) => ({
        ...prev,
        text: "Credenciales inválidas. Por favor intente de nuevo.",
      }));
    }
  }

  // Renderizado del formulario de login
  return (
    <section id="section-login">
      <form onSubmit={handleLogin} className="form-login">
        <HeadProfile titleHead={"Iniciar Usuario"} />
        <div id="container-email-password">
          {/* Input para correo electrónico */}
          <input
            type="email"
            placeholder="Usuario (Correo electrónico)"
            className="input-email-user"
            onChange={handleEmail}
            style={{
              borderBottom: `2px solid ${email.borderColor}`,
            }}
          />
          {/* Mensaje de error si el email es inválido */}
          {email.text && (
            <p style={{ color: "red", fontSize: "12px" }}>{email.text}</p>
          )}

          {/* Input para contraseña */}
          <input
            type="password"
            placeholder="Contraseña"
            className="input-password"
            onChange={handlePassword}
            style={{ borderBottom: `2px solid ${password.borderColor}` }}
          />
          {/* Mensaje de error si la contraseña es inválida */}
          {password.text && (
            <p style={{ color: "red", fontSize: "12px" }}>{password.text}</p>
          )}
        </div>

        <div id="container-checkbox-forgot">
          {/* Checkbox de "Recordar datos" */}
          <div className="div-checkbox-p">
            <input
              type="checkbox"
              className="input-checkbox"
              id="remember-me"
            />
            <label htmlFor="remember-me">Recordar datos</label>
          </div>
          {/* Link para recuperar contraseña */}
          <Link to="/forgotYourPassword">
            <p className="link-forgot-your-password">
              ¿Olvidaste tu contraseña?
            </p>
          </Link>
        </div>

        <div className="button-container">
          {/* Botón de iniciar sesión */}
          <button type="submit" className="btn-login">
            Iniciar Sesión
          </button>
          {/* Botón para registrarse que redirige a otra ruta */}
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
