// Importación de hooks, rutas y controladores necesarios
import { useState } from "react";
import { Link } from "react-router-dom";
import { HeadProfile } from "../../components/auth/HeadProfile";
import {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validatePassword,
  passwordsMatch,
  registerUser,
} from "../../../controllers/AuthController";

export function CreateAccount() {
  // Estado para cada campo del formulario con validación visual (color) y mensajes de error
  const [formData, setFormData] = useState({
    name: { value: "", borderColor: "black" },
    surname: { value: "", borderColor: "black" },
    email: { value: "", borderColor: "black" },
    phone: { value: "", borderColor: "black" },
    address: { value: "", borderColor: "black" },
    password: { value: "", borderColor: "black", text: "", requirements: [] },
    confirmPassword: { value: "", borderColor: "black", text: "" },
  });

  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  // Manejador genérico para campos de texto como nombre y apellido
  const handleTextChange = (e, field) => {
    const value = e.target.value;
    const borderColor = validateName(value);

    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], value, borderColor },
    }));
  };

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

  // Validación completa del formulario antes de registrar al usuario
  const handleSubmit = () => {
    let allValid = true;
    const updatedFormData = { ...formData };

    Object.entries(formData).forEach(([key, field]) => {
      if (field.borderColor === "red" || field.value === "") {
        updatedFormData[key] = {
          ...field,
          borderColor: "red",
        };
        allValid = false;
      }
    });

    setFormData(updatedFormData);

    if (allValid) {
      const result = registerUser(formData);

      if (result.success) {
        setRegistrationCompleted(true);
      }
    }
  };

  return (
    <>
      {!registrationCompleted ? (
        <section id="section-login">
          <form className="form-login" onSubmit={(e) => e.preventDefault()}>
            <HeadProfile
              titleHead="Registrarse"
              subtittleHead="Crea tu cuenta y recibe nuestros deliciosos panes de masa madre directamente en tu hogar"
            />

            {/* Campos del formulario con íconos y validación visual */}
            {/* Nombre */}
            <div className="container-icons-input">
              <img
                src="/assets/profileicon.svg"
                alt="Perfil"
                className="icons-input"
              />
              <input
                type="text"
                placeholder="Nombre"
                className="input-email-user"
                onChange={(e) => handleTextChange(e, "name")}
                style={{
                  borderBottom: `2px solid ${formData.name.borderColor}`,
                }}
              />
            </div>

            {/* Apellido */}
            <div className="container-icons-input">
              <img
                src="/assets/profileicon.svg"
                alt="Perfil"
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

            {/* Email */}
            <div className="container-icons-input">
              <img
                src="/assets/email.svg"
                alt="Email"
                className="icons-input"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                className="input-input"
                onChange={handleEmailChange}
                style={{
                  borderBottom: `2px solid ${formData.email.borderColor}`,
                }}
              />
            </div>

            {/* Teléfono */}
            <div className="container-icons-input">
              <img
                src="/assets/call.svg"
                alt="Teléfono"
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

            {/* Dirección */}
            <div className="container-icons-input">
              <img
                src="/assets/address.svg"
                alt="Dirección"
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

            {/* Contraseña */}
            <div className="container-icons-input">
              <img
                src="/assets/key.svg"
                alt="Contraseña"
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

            {/* Requisitos de contraseña si inválida */}
            {formData.password.borderColor === "red" && (
              <>
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
              </>
            )}

            {/* Confirmar contraseña */}
            <div className="container-icons-input">
              <img
                src="/assets/key.svg"
                alt="Contraseña"
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
                    <p className="password-no-match-2" style={{ color: "red" }}>
                      {formData.confirmPassword.text}
                    </p>
                  )}
              </div>
            </div>

            <div id="div-space-last-input"></div>

            {/* Botón de confirmación */}
            <div className="button-container">
              <button
                type="button"
                className="btn-register"
                onClick={handleSubmit}
              >
                Confirmar
              </button>
            </div>
          </form>
        </section>
      ) : (
        // Pantalla de registro exitoso
        <section id="section-login">
          <form className="form-login">
            <div id="registration-confirmed">
              <p>Usuario registrado exitosamente!</p>
              <img
                src="/assets/checked-success.svg"
                className="img-success"
                alt="Éxito"
              />
              <p>Se envió una notificación a tu correo personal</p>
              <p>para que valides la creación del usuario.</p>
              <p>¡Solo te falta un paso, ánimo!</p>
            </div>
            <div id="div-space-last-input"></div>
            <div className="button-container">
              <Link to={"/login"}>
                <button type="button" className="btn-login">
                  <img
                    src="/assets/profileiconwhite.svg"
                    alt="Profile icon"
                    className="img-registered"
                  />
                  Ingresar
                </button>
              </Link>
              <Link to="/">
                <button type="button" className="btn-register">
                  <img
                    src="/assets/house.svg"
                    className="img-registered"
                    alt="Home icon"
                  />
                  Volver al Inicio
                </button>
              </Link>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
