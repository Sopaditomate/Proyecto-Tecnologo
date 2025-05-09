"use client";

// Componente de formulario de registro con validaciones
import { Link } from "react-router-dom";
import {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validatePassword,
  passwordsMatch,
} from "../../../controllers/AuthController";
import "../../../styles/login/register-form.css";

export function RegisterForm({ formData, setFormData, onSubmit }) {
  // Manejador genérico para nombre y apellido
  const handleTextChange = (e, field) => {
    const value = e.target.value;
    const borderColor = validateName(value);

    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], value, borderColor },
    }));
  };

  // Manejador para email
  const handleEmailChange = (e) => {
    const value = e.target.value;
    const isValid = validateEmail(value);

    setFormData((prev) => ({
      ...prev,
      email: {
        value,
        borderColor: isValid ? "green" : "red",
      },
    }));
  };

  // Manejador para teléfono
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const isValid = validatePhone(value);

    setFormData((prev) => ({
      ...prev,
      phone: {
        value,
        borderColor: isValid ? "green" : "red",
      },
    }));
  };

  // Manejador para dirección
  const handleAddressChange = (e) => {
    const value = e.target.value;
    const isValid = validateAddress(value);

    setFormData((prev) => ({
      ...prev,
      address: {
        value,
        borderColor: isValid ? "green" : "red",
      },
    }));
  };

  // Manejador para contraseña
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    const { isValid, text, requirements } = validatePassword(value);

    setFormData((prev) => ({
      ...prev,
      password: {
        value,
        borderColor: isValid ? "green" : "red",
        text,
        requirements,
      },
    }));
  };

  // Manejador para confirmar contraseña
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    const isMatch = passwordsMatch(formData.password.value, value);
    const isPasswordValid = formData.password.borderColor === "green";

    setFormData((prev) => ({
      ...prev,
      confirmPassword: {
        value,
        borderColor: isMatch && isPasswordValid ? "green" : "red",
        text: !isMatch && value !== "" ? "Las contraseñas no coinciden" : "",
      },
    }));
  };

  // Validar todos los campos
  const validateForm = () => {
    const fields = Object.entries(formData);
    let allValid = true;

    // Actualizar validación para todos los campos
    const updatedFormData = { ...formData };

    fields.forEach(([key, field]) => {
      if (field.borderColor === "red" || field.value === "") {
        updatedFormData[key] = {
          ...field,
          borderColor: "red",
        };
        allValid = false;
      }
    });

    setFormData(updatedFormData);
    return allValid;
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="register-form-container">
      <div className="register-form-columns">
        <div className="register-form-column">
          <div className="container-icons-input">
            <img
              src="/assets/profileicon.svg"
              alt="Icono de perfil"
              className="icons-input"
            />
            <input
              type="text"
              placeholder="Nombre"
              className="input-email-user"
              onChange={(e) => handleTextChange(e, "name")}
              style={{ borderBottom: `2px solid ${formData.name.borderColor}` }}
            />
          </div>

          <div className="container-icons-input">
            <img
              src="/assets/profileicon.svg"
              alt="Icono de perfil"
              className="icons-input"
            />
            <input
              type="text"
              placeholder="Apellido"
              className="input-input"
              onChange={(e) => handleTextChange(e, "surname")}
              style={{
                borderBottom: `2px solid ${formData.surname.borderColor}`,
              }}
            />
          </div>

          <div className="container-icons-input">
            <img
              src="/assets/email.svg"
              alt="Icono de email"
              className="icons-input"
            />
            <input
              type="email"
              placeholder="Email (Correo electrónico)"
              className="input-input"
              onChange={handleEmailChange}
              style={{
                borderBottom: `2px solid ${formData.email.borderColor}`,
              }}
            />
          </div>
        </div>

        <div className="register-form-column">
          <div className="container-icons-input">
            <img
              src="/assets/call.svg"
              alt="Icono de teléfono"
              className="icons-input"
            />
            <input
              type="tel"
              placeholder="Número de teléfono"
              className="input-input"
              onChange={handlePhoneChange}
              style={{
                borderBottom: `2px solid ${formData.phone.borderColor}`,
              }}
            />
          </div>

          <div className="container-icons-input">
            <img
              src="/assets/address.svg"
              alt="Icono de dirección"
              className="icons-input"
            />
            <input
              type="text"
              placeholder="Dirección de domicilio"
              className="input-input"
              onChange={handleAddressChange}
              style={{
                borderBottom: `2px solid ${formData.address.borderColor}`,
              }}
            />
          </div>

          <div className="container-icons-input">
            <img
              src="/assets/key.svg"
              alt="Icono de contraseña"
              className="icons-input"
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="input-input"
              onChange={handlePasswordChange}
              style={{
                borderBottom: `2px solid ${formData.password.borderColor}`,
              }}
            />
          </div>

          {formData.password.borderColor === "red" && (
            <div className="password-requirements">
              <p className="text-error-password-1-input">
                {formData.password.text}
              </p>
              <ul className="requirements-error-password-1-input">
                {formData.password.requirements?.map((req, index) => (
                  <li
                    key={index}
                    style={{ color: req.valid ? "green" : "gray" }}
                  >
                    {req.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="container-icons-input">
            <img
              src="/assets/key.svg"
              alt="Icono de contraseña"
              className="icons-input"
            />
            <div className="div-password-no-match">
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                onChange={handleConfirmPasswordChange}
                style={{
                  borderBottom: `2px solid ${formData.confirmPassword.borderColor}`,
                }}
              />
              {formData.confirmPassword.borderColor === "red" &&
                formData.confirmPassword.text && (
                  <p style={{ color: "red" }} className="password-no-match-2">
                    {formData.confirmPassword.text}
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="button-container">
        <button type="button" className="btn-register" onClick={handleSubmit}>
          Confirmar
        </button>
        <Link to="/login">
          <button type="button" className="btn-login">
            Ya tengo una cuenta
          </button>
        </Link>
      </div>
    </div>
  );
}
