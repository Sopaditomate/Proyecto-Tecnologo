import nodemailer from "nodemailer";

export async function sendEmail(to, subject, text, html) {
  try {
    console.log("Intentando crear el transportador de nodemailer...");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("Transportador creado, enviando el correo...");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    console.log("Correo enviado correctamente:", info);
  } catch (error) {
    console.error("Error al intentar enviar el correo:", error);
    if (error.code === "ETIMEDOUT") {
      console.error(
        "Error de tiempo de espera (timeout). Posible problema de red."
      );
    } else if (error.responseCode === 421) {
      console.error(
        "SMTP Error: Servicio de correo temporalmente no disponible."
      );
    } else {
      console.error("Error desconocido al enviar el correo:", error);
    }
    throw new Error("No se pudo enviar el correo.");
  }
}
