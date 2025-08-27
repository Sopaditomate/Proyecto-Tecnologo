import jwt from "jsonwebtoken";

// Constantes de roles (para legibilidad)
const ROLE_CLIENT = 100000;
const ROLE_ADMIN = 100001;

// Middleware para verificar token JWT de forma estricta (bloquea si no está)
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "No autorizado - Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    if (!decoded?.userId || !decoded?.role) {
      return res.status(401).json({ message: "Token inválido o incompleto" });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    return res.status(401).json({ message: "No autorizado - Token inválido" });
  }
};

// Middleware para verificar token JWT de forma opcional (no bloquea, solo asigna req.user o null)
const optionalVerifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    if (!decoded?.userId || !decoded?.role) {
      req.user = null;
    } else {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    req.user = null;
    next();
  }
};

// Middleware genérico para verificar rol
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

const isAdmin = checkRole(ROLE_ADMIN);
const isClient = checkRole(ROLE_CLIENT);

export { verifyToken, optionalVerifyToken, isAdmin, isClient };
