import { useEffect, useState } from "react";
import axios from "axios";

export default function VerifyEmail() {
  const [status, setStatus] = useState("Verificando...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("Token no encontrado.");
      return;
    }
    axios
      .post(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5001/api"
        }/user/verify-email/confirm`,
        { token }
      )
      .then((res) => {
        setStatus(res.data.message || "¡Email verificado!");
      })
      .catch((err) => {
        setStatus(
          err.response?.data?.message || "Error al verificar el email."
        );
      });
  }, []);

  return <div style={{ margin: 40, fontSize: 20 }}>{status}</div>;
}
