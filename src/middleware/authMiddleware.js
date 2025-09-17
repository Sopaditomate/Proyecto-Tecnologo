import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

// Constantes de roles (mejora de la legibilidad)
const ROLE_CLIENT = 100000;
const ROLE_ADMIN = 100001;

// Middleware para verificar token JWT
const verifyToken = async (req, res, next) => {
  // Obtener token de las cookies o del header de autorización
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "No autorizado - Token no proporcionado" });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    // Verificar si el usuario sigue logueado en la base de datos
    // const isLoggedIn = await UserModel.isUserLoggedIn(decoded.userId);
    // if (!isLoggedIn) {
    //   return res.status(401).json({
    //     message: "Sesión cerrada desde otro dispositivo",
    //     code: "SESSION_CLOSED_ELSEWHERE",
    //   });
    // }

    // información del usuario al objeto request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      clientId: decoded.clientId,
    };

    next();
  } catch (error) {
    console.error("Error al verificar token:", error);

    // Si el token es inválido o ha expirado, marcar usuario como no logueado
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      try {
        // Intentar decodificar el token sin verificar para obtener el userId
        const decodedPayload = jwt.decode(token);
        if (decodedPayload && decodedPayload.userId) {
          // Marcar como no logueado en la base de datos
          if (decodedPayload.role === ROLE_ADMIN) {
            await UserModel.setAdminLoggedIn(decodedPayload.userId, false);
          } else {
            await UserModel.setLoggedIn(decodedPayload.userId, false);
          }
          console.log(
            `Usuario ${decodedPayload.userId} marcado como no logueado debido a token expirado/inválido`
          );
        }
      } catch (decodeError) {
        console.error(
          "Error al decodificar token para logout automático:",
          decodeError
        );
      }

      return res.status(401).json({
        message: "Sesión expirada - Por favor inicie sesión nuevamente",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({ message: "No autorizado - Token inválido" });
  }
};

// Middleware genérico para verificar el rol
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user && req.user.role === requiredRole) {
      return next();
    } else {
      return res.status(403).json({
        message: `Acceso denegado - Se requiere rol de ${
          requiredRole === ROLE_ADMIN ? "administrador" : "cliente"
        }`,
      });
    }
  };
};

// Middleware para verificar rol de administrador
const isAdmin = checkRole(ROLE_ADMIN);

// Middleware para verificar rol de cliente
const isClient = checkRole(ROLE_CLIENT);

export { verifyToken, isAdmin, isClient };
