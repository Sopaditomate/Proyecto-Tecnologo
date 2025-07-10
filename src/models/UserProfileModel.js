import db from "../config/db.js";
class userProfileModal {}
// Obtener perfil de usuario
export const getUserProfileById = async (userId) => {
  const [resultSets] = await db.execute("CALL sp_get_user_profile(?)", [
    userId,
  ]);
  return resultSets[0]?.[0] || null;
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
  if (!userId || isNaN(userId)) throw new Error("Invalid user ID");

  const [resultSets] = await db.execute("CALL sp_get_user_orders(?)", [userId]);

  const rows = resultSets[0] || [];

  return rows.map((order) => ({
    ...order,
    items: (() => {
      try {
        return typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      } catch (e) {
        console.error("JSON parse error:", order.items);
        return [];
      }
    })(),
  }));
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
