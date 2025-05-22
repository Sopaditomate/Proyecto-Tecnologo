// Componente para mostrar mensaje de éxito después del registro
import { Link } from "react-router-dom";

export function SuccessMessage() {
  return (
    <>
      <div id="registration-confirmed">
        <p>Usuario registrado exitosamente!</p>
        <img
          src="/assets/checked-success.svg"
          className="img-success"
          alt="Success checkmark"
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
    </>
  );
}
