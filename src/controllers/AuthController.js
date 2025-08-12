import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import UserModel from "../models/UserModel.js";

class AuthController {
  // Registro de usuario
  async register(req, res) {
    try {
      console.log("Datos recibidos en registro:", req.body);
      const { email, password, nombres, apellidos, direccion, telefono } =
        req.body;

      // Verificar si el usuario ya existe
      const existingUser = await UserModel.findByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      const userId = await UserModel.create({
        email,
        password, // texto plano, el modelo la hashea
        rolId: 100000,
        nombres,
        apellidos,
        direccion,
        telefono,
      });

      res.status(201).json({
        success: true,
        message: "Usuario registrado correctamente",
        userId,
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
  }

  // Login de usuario
  async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log("Intento de login con email:", email);

      // Buscar el usuario
      const user = await UserModel.findByEmail(email);
      if (!user) {
        console.log("Usuario no encontrado");
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      console.log("Usuario encontrado:", user);
      // Verificar la contraseña (siempre usando bcrypt para mayor seguridad)
      const isPasswordValid = await bcrypt.compare(password, user.PASSWORD);

      if (!isPasswordValid) {
        console.log("Contraseña inválida");
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Obtener información completa del usuario
      const userInfo = await UserModel.getUserInfo(user.ID_USUARIO);

      // Obtener ID de cliente si el rol es cliente
      let clientId = null;
      if (user.ID_ROL === 100000) {
        clientId = await UserModel.getClientId(user.ID_USUARIO);
      }

      // Generar token JWT con expiración de 24 horas
      const token = jwt.sign(
        {
          userId: user.ID_USUARIO,
          email: user.USUARIO,
          role: user.ID_ROL,
          clientId,
        },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "24h" }
      );

      // Enviar respuesta con token y cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // solo en HTTPS en producción
        sameSite: "lax", // O "strict" si necesitas mayor seguridad
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });

      res.json({
        success: true,
        message: "Login exitoso",
        user: {
          id: userInfo.ID_USUARIO,
          email: userInfo.USUARIO,
          role: user.ID_ROL, // Enviar directamente el ID del rol
          roleInfo: {
            id: userInfo.ID_ROL,
            name: userInfo.ROL_NOMBRE,
          },
          nombres: userInfo.NOMBRES,
          apellidos: userInfo.APELLIDOS,
          clientId,
        },
        token,
      });
    } catch (error) {
      console.error("Error en el login:", error);
      res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
  }

  // Cerrar sesión
  async logout(req, res) {
    res.clearCookie("token");
    res.json({ success: true, message: "Sesión cerrada correctamente" });
  }

  // Verificar estado de autenticación
  async checkAuth(req, res) {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    try {
      // Buscar datos completos del usuario
      const userInfo = await UserModel.getUserInfo(req.user.userId);

      // Si es cliente, obtener clientId
      let clientId = null;
      if (userInfo && userInfo.ID_ROL === 100000) {
        clientId = await UserModel.getClientId(userInfo.ID_USUARIO);
      }

      res.json({
        isAuthenticated: true,
        user: {
          id: userInfo.ID_USUARIO,
          email: userInfo.USUARIO,
          role: userInfo.ID_ROL,
          roleInfo: {
            id: userInfo.ID_ROL,
            name: userInfo.ROL_NOMBRE,
          },
          nombres: userInfo.NOMBRES,
          apellidos: userInfo.APELLIDOS,
          clientId,
        },
      });
    } catch (error) {
      console.error("Error en checkAuth:", error);
      res.status(500).json({ message: "Error al obtener usuario" });
    }
  }

  // Validar email (método estático para usar en el frontend)
  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Recuperar contraseña
  async forgotPassword(req, res) {
    const { email } = req.body;
    try {
      // 1. Buscar usuario
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res
          .status(404)
          .json({ message: "No existe un usuario con ese correo." });
      }

      // 2. Generar token temporal (válido por 1 hora)
      const resetToken = jwt.sign(
        { userId: user.ID_USUARIO },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1h" }
      );

      // 3. Guardar el token en la base de datos (o en memoria para pruebas)
      await UserModel.saveResetToken(user.ID_USUARIO, resetToken);

      // 4. Configurar nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail", // O el servicio que uses
        auth: {
          user: process.env.EMAIL_USER, // Tu correo
          pass: process.env.EMAIL_PASS, // Tu contraseña o app password
        },
      });

      // 5. Crear enlace de recuperación
      const resetUrl = `${
        process.env.CLIENT_URL || `${VITE_API_URL}:5173`
      }/reset-password?token=${resetToken}`;

      // 6. Enviar correo
      await transporter.sendMail({
        from: `"Soporte" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Recuperación de contraseña",
        html: `
          <h3>Recuperación de contraseña</h3>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>Este enlace expirará en 1 hora.</p>
        `,
      });

      res.json({
        message:
          "Se ha enviado un correo de recuperación a tu dirección de email.",
      });
    } catch (error) {
      console.error("Error en forgotPassword:", error);
      res
        .status(500)
        .json({ message: "Error al enviar el correo de recuperación." });
    }
  }

  // Restablecer contraseña
  async resetPassword(req, res) {
    const { token, newPassword } = req.body;
    try {
      // Verifica el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.findById(decoded.userId);

      if (
        !user ||
        user.reset_token !== token ||
        !user.reset_token_expires ||
        new Date(user.reset_token_expires) < new Date()
      ) {
        return res.status(400).json({ message: "Token inválido o expirado." });
      }

      // Hashea la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualiza la contraseña y elimina el token
      await UserModel.updatePasswordAndClearToken(
        user.ID_USUARIO,
        hashedPassword
      );

      res.json({ message: "Contraseña restablecida correctamente." });
    } catch (error) {
      console.error("Error en resetPassword:", error);
      res.status(400).json({ message: "Token inválido o expirado." });
    }
  }

  // Validar token de reset password
  async validateResetToken(req, res) {
    const { token } = req.body;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.findById(decoded.userId);

      if (
        !user ||
        user.reset_token !== token ||
        !user.reset_token_expires ||
        new Date(user.reset_token_expires) < new Date()
      ) {
        return res.status(400).json({ message: "Token inválido o expirado." });
      }

      res.json({ message: "Token válido." });
    } catch (error) {
      return res.status(400).json({ message: "Token inválido o expirado." });
    }
  }
}

export default new AuthController();
