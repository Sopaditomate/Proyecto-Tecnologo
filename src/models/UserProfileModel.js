import db from "../config/db.js";

// Obtener perfil de usuario
// Obtener perfil de usuario
export const getUserProfileById = async (userId) => {
  const [resultSets] = await db.execute("CALL sp_get_user_profile(?)", [userId]);
  const user = resultSets[0]?.[0] || null;

  // Fuerza que siempre esté verificado
  if (user) {
    user.verified_phone = 1;
  }

  return user;
};


// Actualizar perfil de usuario
export const updateUserProfile = async (userId, profileData) => {
  const { nombres, apellidos, direccion, telefono } = profileData;
  await db.execute("CALL sp_update_user_profile(?, ?, ?, ?, ?)", [
    userId,
    nombres,
    apellidos,
    direccion,
    telefono,
  ]);
  return true;
};

// Guardar código de verificación de teléfono
export const savePhoneVerificationCode = async (userId, code) => {
  await db.execute("CALL sp_save_phone_verification(?, ?)", [userId, code]);
  return true;
};

// Verificar código de teléfono
export const verifyPhoneCode = async (userId, code) => {
  const [resultSets] = await db.execute("CALL sp_verify_phone_code(?, ?)", [
    userId,
    code,
  ]);
  const result = resultSets[0]?.result;
  return result === "success";
};

// Obtener pedidos del usuario
export const getUserOrders = async (userId) => {
  const [resultSets] = await db.execute("CALL sp_get_user_orders(?)", [userId]);
  return (
    resultSets[0]?.map((order) => ({
      ...order,
      items:
        typeof order.items === "string" ? JSON.parse(order.items) : order.items,
    })) || []
  );
};

// Guardar token de verificación de email
export const saveEmailVerificationToken = async (userId, token) => {
  await db.execute("CALL sp_save_verify_token(?, ?)", [userId, token]);
  return true;
};

// Confirmar verificación de email
export const confirmEmailVerification = async (userId, token) => {
  const [resultSets] = await db.execute(
    "CALL sp_confirm_email_verification(?, ?)",
    [userId, token]
  );
  // Busca el result en cualquier subarray
  let result;
  if (Array.isArray(resultSets)) {
    for (const set of resultSets) {
      if (set && typeof set === "object" && set.result) {
        result = set.result;
        break;
      }
      if (Array.isArray(set) && set[0]?.result) {
        result = set[0].result;
        break;
      }
    }
  }
  return result || "error";
};
