import * as UserProfileModel from "../models/UserProfileModel.js";
import { sendSMS } from "../services/sendSMS.js";
import { sendEmail } from "../services/sendEmail.js";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import bcrypt from "bcrypt";
import UserModel from "../models/UserModel.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Getting profile for user ID:", userId);

    const profile = await UserProfileModel.getUserProfileById(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Perfil de usuario no encontrado",
      });
    }

    console.log("Profile data being sent:", profile);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

//para el modulo de usuario del administrador
export const getUsersInfo = async (req, res) => {
  try {
    const users = await UserModel.getAllUsersInfo();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUserState = async (req, res) => {
  const id_user = parseInt(req.params.id, 10); // Tomamos el id desde la URL y lo convertimos a número

  if (isNaN(id_user)) {
    return res.status(400).json({ message: "ID de usuario inválido" });
  }

  try {
    const result = await UserModel.updateStateUser(id_user);
    res.status(200).json({
      message: "Estado del usuario actualizado correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Error al actualizar el estado del usuario:", error);
    res.status(500).json({
      message: "Error al cambiar el estado del usuario",
      error: error.message,
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nombres, apellidos, direccion, telefono } = req.body;

    // Validaciones
    if (!nombres || !apellidos || !direccion || !telefono) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    // Expresión regular para evitar emojis y caracteres no alfanuméricos en los nombres
    const emojiRegex = /[\p{Emoji}\p{So}\p{C}\u200B\uFEFF]/gu; // Para capturar emojis y caracteres invisibles
    if (emojiRegex.test(nombres) || emojiRegex.test(apellidos)) {
      return res.status(400).json({
        success: false,
        message:
          "Los nombres y apellidos no pueden contener emojis o caracteres especiales.",
      });
    }

    // Validar formato de teléfono colombiano
    const phoneRegex = /^3[0-9]{9}$/;
    if (!phoneRegex.test(telefono)) {
      return res.status(400).json({
        success: false,
        message:
          "El teléfono debe ser un número colombiano válido (Ej: 3001234567)",
      });
    }

    await UserProfileModel.updateUserProfile(userId, {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
    });

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el perfil",
    });
  }
};

export const sendPhoneVerification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { telefono } = req.body;

    if (!telefono) {
      return res.status(400).json({
        success: false,
        message: "Número de teléfono requerido",
      });
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated verification code:", code, "for user:", userId);

    // Guardar código en la base de datos
    await UserProfileModel.savePhoneVerificationCode(userId, code);

    // En desarrollo, no enviar SMS real
    if (process.env.NODE_ENV === "development") {
      return res.json({
        success: true,
        message: "Código de verificación generado",
        code: code, // Solo en desarrollo
      });
    }

    // En producción, enviar SMS
    try {
      await sendSMS(telefono, `Tu código de verificación es: ${code}`);
      res.json({
        success: true,
        message: "Código enviado por SMS",
      });
    } catch (smsError) {
      console.error("Error sending SMS:", smsError);
      res.json({
        success: true,
        message: "Código generado (SMS no disponible)",
        code: code, // Fallback en caso de error de SMS
      });
    }
  } catch (error) {
    console.error("Error in sendPhoneVerification:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar código de verificación",
    });
  }
};

export const confirmPhoneVerification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { codigo } = req.body;

    console.log(
      "Confirming phone verification for user:",
      userId,
      "with code:",
      codigo
    );

    if (!codigo || codigo.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Código de verificación inválido",
      });
    }

    const isVerified = await UserProfileModel.verifyPhoneCode(userId, codigo);
    console.log("Phone verification result:", isVerified);

    if (isVerified) {
      res.json({
        success: true,
        message: "Teléfono verificado exitosamente",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Código inválido o expirado",
      });
    }
  } catch (error) {
    console.error("Error in confirmPhoneVerification:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar código",
    });
  }
};

export const sendEmailVerification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userEmail = req.user.email;

    console.log(
      "Sending email verification for user:",
      userId,
      "email:",
      userEmail
    );

    // Generar token de verificación
    const token = jwt.sign(
      { userId, email: userEmail },
      process.env.JWT_SECRET || "your_jwt_secret",
      {
        expiresIn: "24h",
      }
    );

    // Guardar token en la base de datos
    await UserProfileModel.saveEmailVerificationToken(userId, token);

    // En desarrollo, no enviar email real
    if (process.env.NODE_ENV === "development") {
      return res.json({
        success: true,
        verificationLink: `${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/verify-email?token=${token}`,
      });
    }

    // En producción, enviar email
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    try {
      await sendEmail(
        userEmail,
        "Verifica tu correo",
        `Haz clic en el siguiente enlace para verificar tu correo: ${verificationLink}`,
        `<p>Haz clic en el siguiente enlace para verificar tu correo:</p>
       <a href="${verificationLink}">${verificationLink}</a>`
      );

      res.json({
        success: true,
        message: "Correo de verificación enviado",
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      res.json({
        success: true,
        message: "Enlace de verificación generado (email no disponible)",
        verificationLink,
      });
    }
  } catch (error) {
    console.error("Error in sendEmailVerification:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar verificación de email",
    });
  }
};

export const confirmEmailVerification = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token de verificación requerido",
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }

    // Lógica delegada al modelo
    const result = await UserProfileModel.confirmEmailVerification(
      payload.userId,
      token
    );

    if (result === "already_verified") {
      return res.json({
        success: true,
        message: "El correo ya esta verificado.",
      });
    }
    if (result === "invalid_token") {
      return res.status(400).json({
        success: false,
        message: "Token inválido",
      });
    }
    if (result === "success") {
      return res.json({
        success: true,
        message: "¡Correo verificado exitosamente!",
      });
    }

    // Si llega aquí, es un error inesperado
    return res.status(500).json({
      success: false,
      message: "Error al verificar el correo",
    });
  } catch (error) {
    console.error("Error en confirmEmailVerification:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar el correo",
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await UserProfileModel.getUserOrders(userId);

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener pedidos",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios.",
      });
    }

    // Busca el usuario
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    // Verifica la contraseña actual
    const valid = await bcrypt.compare(currentPassword, user.PASSWORD);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "La contraseña actual es incorrecta.",
      });
    }

    // No permitir la misma contraseña
    const same = await bcrypt.compare(newPassword, user.PASSWORD);
    if (same) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe ser diferente a la actual.",
      });
    }

    // Hashea y actualiza la contraseña
    const hashed = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePasswordAndClearToken(userId, hashed);

    res.json({
      success: true,
      message: "¡Contraseña cambiada exitosamente!",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar la contraseña.",
    });
  }
};
