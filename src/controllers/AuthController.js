import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/sendEmail.js";
import UserModel from "../models/UserModel.js";

class AuthController {
  // Almacenamiento temporal en memoria para datos de registro pendientes
  static pendingRegistrations = new Map();

  // Limpiar registros expirados cada 5 minutos
  static {
    setInterval(() => {
      const now = Date.now();
      for (const [email, data] of this.pendingRegistrations.entries()) {
        if (now > data.expiresAt) {
          this.pendingRegistrations.delete(email);
        }
      }
    }, 5 * 60 * 1000);
  }

  // Registro de usuario - SOLO guardar temporalmente
  async register(req, res) {
    try {
      console.log("Datos recibidos en registro:", req.body);
      const { email, password, nombres, apellidos } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      // Generar código de verificación de 6 dígitos
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Guardar datos temporalmente en memoria (10 minutos)
      AuthController.pendingRegistrations.set(email, {
        email,
        password,
        nombres,
        apellidos,
        verificationCode,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutos
      });

      // Enviar email con el código
      await sendEmail(
        email,
        "Verificación de cuenta",
        `Tu código de verificación es: ${verificationCode}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d97706;">¡Bienvenido a nuestra plataforma!</h2>
            <p>Gracias por registrarte. Para completar tu registro, ingresa el siguiente código de verificación:</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #d97706; font-size: 32px; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
            </div>
            <p>Este código expirará en 10 minutos.</p>
            <p>Si no verificas tu email, los datos no se guardarán y deberás registrarte nuevamente.</p>
          </div>
        `
      );

      res.status(201).json({
        success: true,
        message:
          "Se ha enviado un código de verificación a tu email. Debes verificarlo para completar el registro.",
        requiresVerification: true,
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
  }

  // Verificar código y CREAR la cuenta real
  async verifyEmailCode(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          message: "Email y código son requeridos",
        });
      }

      if (code.length !== 6) {
        return res.status(400).json({
          message: "El código debe tener 6 dígitos",
        });
      }

      // Verificar si ya existe un usuario real con ese email
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          message: "Ya existe una cuenta con este email",
        });
      }

      // Obtener datos temporales
      const pendingData = AuthController.pendingRegistrations.get(email);

      if (!pendingData) {
        return res.status(400).json({
          message: "No hay registro pendiente. Debes registrarte nuevamente.",
        });
      }

      // Verificar si expiró
      if (Date.now() > pendingData.expiresAt) {
        AuthController.pendingRegistrations.delete(email);
        return res.status(400).json({
          message: "El código ha expirado. Debes registrarte nuevamente.",
        });
      }

      // Verificar código
      if (pendingData.verificationCode !== code) {
        return res.status(400).json({
          message: "Código inválido",
        });
      }

      // CREAR el usuario real AHORA
      const userId = await UserModel.create({
        email: pendingData.email,
        password: pendingData.password, // será hasheada en el modelo
        rolId: 100000,
        nombres: pendingData.nombres,
        apellidos: pendingData.apellidos,
        direccion: "",
        telefono: "",
      });

      // Marcar como verificado inmediatamente
      await UserModel.markEmailAsVerified(userId);

      // Limpiar datos temporales
      AuthController.pendingRegistrations.delete(email);

      res.json({
        success: true,
        message:
          "Email verificado y cuenta creada exitosamente. Ya puedes iniciar sesión.",
      });
    } catch (error) {
      console.error("Error en verificación de email:", error);
      res.status(500).json({
        message: "Error al verificar el código",
      });
    }
  }

  // Reenviar código de verificación
  async resendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: "Email es requerido",
        });
      }

      // Verificar si ya existe un usuario real
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          message: "Ya existe una cuenta con este email",
        });
      }

      // Obtener datos temporales
      const pendingData = AuthController.pendingRegistrations.get(email);
      if (!pendingData) {
        return res.status(404).json({
          message: "No hay registro pendiente. Debes registrarte nuevamente.",
        });
      }

      // Verificar si expiró
      if (Date.now() > pendingData.expiresAt) {
        AuthController.pendingRegistrations.delete(email);
        return res.status(400).json({
          message: "El registro ha expirado. Debes registrarte nuevamente.",
        });
      }

      // Generar nuevo código
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Actualizar datos temporales
      pendingData.verificationCode = verificationCode;
      pendingData.expiresAt = Date.now() + 10 * 60 * 1000; // Renovar tiempo

      // Enviar email
      await sendEmail(
        email,
        "Nuevo código de verificación",
        `Tu nuevo código de verificación es: ${verificationCode}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d97706;">Nuevo código de verificación</h2>
            <p>Has solicitado un nuevo código de verificación:</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #d97706; font-size: 32px; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
            </div>
            <p>Este código expirará en 10 minutos.</p>
          </div>
        `
      );

      res.json({
        success: true,
        message: "Nuevo código de verificación enviado a tu email",
      });
    } catch (error) {
      console.error("Error al reenviar código:", error);
      res.status(500).json({
        message: "Error al enviar el código",
      });
    }
  }

  // Login de usuario (verificar que el email esté verificado)
  async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log("Intentando login con:", email);

      const user = await UserModel.findByEmail(email);
      console.log("Usuario encontrado:", user);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.PASSWORD);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Verificar si el email está verificado
      // IMPORTANTE: Solo pedir verificación si el usuario NO está verificado
      if (user.VERIFIED !== 1) {
        // Verificar si hay datos pendientes en memoria
        const pendingData = AuthController.pendingRegistrations.get(email);

        if (pendingData && Date.now() <= pendingData.expiresAt) {
          // Hay un registro pendiente válido, pedir código
          return res.status(401).json({
            message: "Debes verificar tu email antes de iniciar sesión",
            requiresVerification: true,
            email: email,
          });
        } else {
          // No hay registro pendiente, pero el usuario existe sin verificar
          // Esto significa que es un usuario antiguo sin verificación
          // Lo marcamos como verificado automáticamente
          await UserModel.markEmailAsVerified(user.ID_USUARIO);
          console.log(
            `Usuario ${email} marcado como verificado automáticamente (usuario existente)`
          );
        }
      }

      // Obtener información completa del usuario
      const userInfo = await UserModel.getUserInfo(user.ID_USUARIO);

      // Obtener ID de cliente si el rol es cliente
      let clientId = null;
      if (user.ID_ROL === 100000) {
        clientId = await UserModel.getClientId(user.ID_USUARIO);
      }

      // Generar token JWT con expiración de 1 hora
      const token = jwt.sign(
        {
          userId: user.ID_USUARIO,
          email: user.USUARIO,
          role: user.ID_ROL,
          clientId,
        },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1h" }
      );

      // Marcar como logueado en la base de datos
      await UserModel.setLoggedIn(user.ID_USUARIO, true);

      // Enviar respuesta con token y cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1 hora
      });

      res.json({
        success: true,
        message: "Login exitoso",
        user: {
          id: userInfo.ID_USUARIO,
          email: userInfo.USUARIO,
          role: user.ID_ROL,
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
      console.error("Error en login:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      if (req.user.role === 100001) {
        await UserModel.setAdminLoggedIn(req.user.userId, false);
      } else {
        await UserModel.setLoggedIn(req.user.userId, false);
      }

      res.clearCookie("token");
      res.json({ success: true, message: "Sesión cerrada correctamente" });
    } catch (error) {
      console.error("Error en logout:", error);
      res.status(500).json({ message: "Error al cerrar sesión" });
    }
  }

  // Validar email (método estático para usar en el frontend)
  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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

      // 3. Guardar el token en la base de datos
      await UserModel.saveResetToken(user.ID_USUARIO, resetToken);

      // 5. Crear enlace de recuperación
      const resetUrl = `${
        process.env.CLIENT_URL || `${VITE_API_URL}:5173`
      }/reset-password?token=${resetToken}`;

      // 6. Enviar correo usando el helper OAuth2
      await sendEmail(
        email,
        "Recuperación de contraseña",
        `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetUrl}`,
        `
    <h3>Recuperación de contraseña</h3>
    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>Este enlace expirará en 1 hora.</p>
  `
      );

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
