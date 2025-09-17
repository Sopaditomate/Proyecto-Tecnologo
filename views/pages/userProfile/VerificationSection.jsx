import { useState, useEffect } from "react";

export default function VerificationSection({
  emailVerified,
  emailStatus,
  sendEmailCode,
  verificationLink,
  getMessageClass,
}) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [waitingVerification, setWaitingVerification] = useState(false);

  // Cargar el estado desde localStorage al montar el componente
  useEffect(() => {
    const savedEndTime = localStorage.getItem("verificationEndTime");

    if (savedEndTime) {
      const endTime = parseInt(savedEndTime, 10);
      const currentTime = Date.now();
      const remainingTime = Math.max(
        0,
        Math.floor((endTime - currentTime) / 1000)
      );

      if (remainingTime > 0) {
        setTimeRemaining(remainingTime);
        setWaitingVerification(true);
        setResendDisabled(true);
      } else {
        // El tiempo ya expiró, limpiar localStorage
        localStorage.removeItem("verificationEndTime");
        setTimeRemaining(0);
        setWaitingVerification(false);
        setResendDisabled(false);
      }
    }
  }, []);

  // Manejar el contador regresivo
  useEffect(() => {
    let timer;

    if (waitingVerification && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          const newTime = prevTime - 1;

          if (newTime <= 0) {
            // Tiempo agotado
            setResendDisabled(false);
            setWaitingVerification(false);
            localStorage.removeItem("verificationEndTime");
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [waitingVerification, timeRemaining]);

  const handleSendVerification = () => {
    const duration = 120; // 2 minutos en segundos
    const endTime = Date.now() + duration * 1000;

    // Guardar el tiempo de finalización en localStorage
    localStorage.setItem("verificationEndTime", endTime.toString());

    // Actualizar el estado
    setTimeRemaining(duration);
    setWaitingVerification(true);
    setResendDisabled(true);

    // Enviar el código
    sendEmailCode();
  };

  // Formatear el tiempo en "mm:ss"
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="tab-content">
      <div className="form-section">
        <h2>Verificación de Cuenta</h2>
        <div className="verification-cards">
          <div className="verification-card">
            <div className="verification-card-header">
              <div className="verification-icon">📧</div>
              <h4 className="verification-card-title">Verificar Correo</h4>
            </div>
            <p className="verification-card-description">
              Confirma tu dirección de correo electrónico para mayor seguridad
              en tu cuenta
            </p>
            <div
              className={`verification-status ${
                emailVerified ? "verified" : "unverified"
              }`}
            >
              <span>{emailVerified ? "✅" : "⚠️"}</span>
              <span>
                {emailVerified
                  ? "Correo verificado"
                  : waitingVerification
                  ? "Esperando verificación..."
                  : "Correo sin verificar"}
              </span>
            </div>
            {!emailVerified && (
              <div className="verification-actions">
                <button
                style={{background:"linear-gradient(135deg, #d97706, #ea580c)"}}
                  className="btn-verification btn-send"
                  onClick={handleSendVerification}
                  disabled={resendDisabled || waitingVerification}
                >
                  {resendDisabled || waitingVerification
                    ? `Reintentar en ${formatTime(timeRemaining)}`
                    : "Enviar Verificación"}
                </button>
              </div>
            )}
            {emailStatus && (
              <div
                className={`verification-message ${getMessageClass(
                  emailStatus
                )}`}
              >
                {emailStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
