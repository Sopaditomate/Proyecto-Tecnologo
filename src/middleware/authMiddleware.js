import jwt from "jsonwebtoken";

// Constantes de roles (mejora de la legibilidad)
const ROLE_CLIENT = 100000;
const ROLE_ADMIN = 100001;

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
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

    // Añadir información del usuario al objeto request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      clientId: decoded.clientId,
    };

    next();
  } catch (error) {
    console.error("Error al verificar token:", error);
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
