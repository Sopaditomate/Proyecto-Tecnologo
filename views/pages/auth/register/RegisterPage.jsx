import { useEffect } from "react";
import { RegisterForm } from "./RegisterForm.jsx";
import "./register-form.css";

export function RegisterPage() {
  useEffect(() => {
    // Agregar clase al body para estilos específicos de la página
    document.body.classList.add("register-body");

    // Limpiar al desmontar el componente
    return () => {
      document.body.classList.remove("register-body");
    };
  }, []);

  return (
    <div className="register-page">
      <RegisterForm />
    </div>
  );
}
