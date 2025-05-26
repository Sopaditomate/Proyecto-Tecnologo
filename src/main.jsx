// Punto de entrada de la aplicación
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import 'bootstrap/dist/css/bootstrap.min.css';

// Renderiza la aplicación en el elemento con id "root"
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
