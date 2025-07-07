export async function sendSMS(phone, message) {
  const regexColombia = /^(3\d{9})$/;
  if (!regexColombia.test(phone)) {
    throw new Error('Solo se permiten números móviles (Ej: 3001234567)');
  }
  // Aquí deberías integrar tu proveedor real (Twilio, etc.)
  console.log(`Enviando SMS a +57${phone}: ${message}`);
}
