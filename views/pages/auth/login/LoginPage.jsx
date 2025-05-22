"use client";

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HeadProfile } from "../../../components/common/header/HeadProfile.jsx";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import "./login-page.css";

export function LoginPage() {
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

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const redirectPath = location.state?.path;

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validatePassword(password) {
    if (password.length < 6) {
      return {
        isValid: false,
        text: "La contraseña debe tener al menos 6 caracteres",
      };
    }
    return { isValid: true, text: "" };
  }

  function handleEmail(e) {
    const valueEmail = e.target.value;
    const isValid = validateEmail(valueEmail);

    setEmail({
      value: valueEmail,
      borderColor: valueEmail === "" ? "black" : isValid ? "green" : "red",
      text: isValid ? "" : "El correo electrónico no es válido",
    });
  }

  function handlePassword(e) {
    const valuePassword = e.target.value;
    const { isValid, text } = validatePassword(valuePassword);

    setPassword({
      value: valuePassword,
      borderColor: valuePassword === "" ? "black" : isValid ? "green" : "red",
      text: isValid ? "" : text,
    });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setServerError("");

    if (
      email.value === "" ||
      password.value === "" ||
      email.borderColor === "red" ||
      password.borderColor === "red"
    ) {
      if (email.value === "") {
        setEmail((prev) => ({
          ...prev,
          borderColor: "red",
          text: "El correo electrónico es requerido",
        }));
      }

      if (password.value === "") {
        setPassword((prev) => ({
          ...prev,
          borderColor: "red",
          text: "La contraseña es requerida",
        }));
      }

      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email: email.value,
          password: password.value,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.user);

        // Redirección condicional según el rol
        if (redirectPath) {
          navigate(redirectPath);
        } else if (
          response.data.user.role === 100001 ||
          (response.data.user.roleInfo &&
            response.data.user.roleInfo.id === 100001)
        ) {
          navigate("/admin");
        } else {
          navigate("/catalogo");
        }
      }
    } catch (error) {
      console.error("Error en login:", error);
      setServerError(
        error.response?.data?.message ||
          "Error al iniciar sesión. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="section-login">
      <form onSubmit={handleLogin} className="form-login">
        <HeadProfile titleHead={"Iniciar Sesión"} />

        {serverError && (
          <p style={{ color: "red", marginBottom: "10px" }}>{serverError}</p>
        )}

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
            <p
              style={{
                color: "red",
                fontSize: "12px",
                marginTop: "-15px",
                marginBottom: "10px",
              }}
            >
              {email.text}
            </p>
          )}

          <input
            type="password"
            placeholder="Contraseña"
            className="input-password"
            onChange={handlePassword}
            style={{ borderBottom: `2px solid ${password.borderColor}` }}
          />
          {password.text && (
            <p
              style={{
                color: "red",
                fontSize: "12px",
                marginTop: "-15px",
                marginBottom: "10px",
              }}
            >
              {password.text}
            </p>
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
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
          <Link to="/register">
            <button type="button" className="btn-register">
              Registrarse
            </button>
          </Link>
        </div>
      </form>
    </section>
  );
}
