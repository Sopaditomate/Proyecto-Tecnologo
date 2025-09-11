export default function VerificationSection({
  emailVerified,
  emailStatus,
  sendEmailCode,
  verificationLink,
  getMessageClass,
}) {
  return (
    <div className="tab-content">
      <div className="form-section">
        <h2>Verificación de Cuenta</h2>
        <div className="verification-cards">
          {/* Email Verification Card */}
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
                {emailVerified ? "Correo verificado" : "Correo sin verificar"}
              </span>
            </div>
            {!emailVerified && (
              <div className="verification-actions">
                <button
                  className="btn-verification btn-send"
                  onClick={sendEmailCode}
                >
                  Enviar Verificación
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
            {verificationLink && (
              <a
                href={verificationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="verification-link"
              >
                Haz clic aquí para verificar tu correo
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
