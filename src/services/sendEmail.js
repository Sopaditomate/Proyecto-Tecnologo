// Resend - Usando el dominio de prueba gratuito
export async function sendEmail(to, subject, text, html) {
  try {
    console.log("🔄 Enviando email con Resend a:", to);

    const emailData = {
      // Usar el dominio de prueba de Resend (no requiere verificación)
      from: "Lovebites 🍰 <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      text: text,
      html: html,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Error response from Resend:", errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Correo enviado exitosamente con Resend:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Error enviando correo con Resend:", {
      message: error.message,
      stack: error.stack,
    });
    throw new Error("No se pudo enviar el correo.");
  }
}
