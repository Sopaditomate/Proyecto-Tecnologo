// Componente reutilizable para volver al inicio
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function BackToHome() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <button
      className="btn-back"
      onClick={() => navigate("/")}
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1000,
        background: "linear-gradient(135deg, #d97706, #ea580c)",
        border: "none",
        color: "white",
        fontWeight: "bold",
        fontSize: "1rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        marginBottom: 0,
      }}
    >
      {!isMobile && (
        <span style={{ fontSize: "1.2em", marginRight: 6 }}></span>
      )}
      Volver al inicio
    </button>
  );
}
