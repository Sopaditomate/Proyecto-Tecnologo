"use client";

// Página de registro de usuario
import { useState } from "react";
import { HeadProfile } from "../../components/auth/HeadProfile";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { SuccessMessage } from "../../components/auth/SuccessMessage";
import { registerUser } from "../../../controllers/AuthController";

export function RegisterPage() {
  // Estado inicial del formulario con validación
  const [formData, setFormData] = useState({
    name: { value: "", borderColor: "black" },
    surname: { value: "", borderColor: "black" },
    email: { value: "", borderColor: "black" },
    phone: { value: "", borderColor: "black" },
    address: { value: "", borderColor: "black" },
    password: { value: "", borderColor: "black", text: "", requirements: [] },
    confirmPassword: { value: "", borderColor: "black", text: "" },
  });

  // Estado para controlar si el registro se completó
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  // Manejar envío del formulario
  const handleSubmit = (validatedData) => {
    // Registrar usuario (en una app real, esto llamaría a una API)
    const result = registerUser(validatedData);

    if (result.success) {
      setRegistrationCompleted(true);
    }
  };

  return (
    <section id="section-login" className="register-page">
      <form className="form-login" onSubmit={(e) => e.preventDefault()}>
        {!registrationCompleted ? (
          <>
            <HeadProfile
              titleHead={"Registrarse"}
              subtittleHead={
                "Crea tu cuenta y recibe nuestros deliciosos panes"
              }
            />
            <RegisterForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
            />
          </>
        ) : (
          <SuccessMessage />
        )}
      </form>
    </section>
  );
}
