import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // redirect_uri
);

oauth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN,
});

export async function sendEmail(to, subject, text, html) {
  try {
    // 🚀 Obtener un accessToken fresco
    const { token } = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: token, // 👈 Aquí lo pasamos
      },
    });

    const info = await transporter.sendMail({
      from: `Lovebites 🍰 <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Correo enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw new Error("No se pudo enviar el correo.");
  }
}
