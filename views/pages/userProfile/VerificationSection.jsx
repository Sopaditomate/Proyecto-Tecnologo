export default function VerificationSection({
  phoneVerified,
  phoneStatus,
  phoneCode,
  setPhoneCode,
  sendPhoneCode,
  confirmPhone,
  form,
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
          {/* Phone Verification Card */}
          <div className="verification-card">
            <div className="verification-card-header">
              <div className="verification-icon">📱</div>
              <h4 className="verification-card-title">Verificar Teléfono</h4>
            </div>
            <p className="verification-card-description">
              Verifica tu número de teléfono para recibir notificaciones
              importantes sobre tus pedidos
            </p>
            <div
              className={`verification-status ${
                phoneVerified ? "verified" : "unverified"
              }`}
            >
              <span>{phoneVerified ? "✅" : "⚠️"}</span>
              <span>
                {phoneVerified
                  ? "Teléfono verificado"
                  : "Teléfono sin verificar"}
              </span>
            </div>
            {!phoneVerified && (
              <div className="verification-actions">
                <button
                  className="btn-verification btn-send"
                  onClick={sendPhoneCode}
                  disabled={!form.telefono}
                >
                  Enviar Código SMS
                </button>
                <div className="verification-input-group">
                  <input
                    className="verification-code-input"
                    value={phoneCode}
                    onChange={(e) =>
                      setPhoneCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="000000"
                    maxLength={6}
                    disabled={!form.telefono}
                  />
                  <button
                    className="btn-verification btn-confirm"
                    onClick={confirmPhone}
                    disabled={!phoneCode || phoneCode.length !== 6}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}
            {phoneStatus && (
              <div
                className={`verification-message ${getMessageClass(
                  phoneStatus
                )}`}
              >
                {phoneStatus}
              </div>
            )}
          </div>
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
