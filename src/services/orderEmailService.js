// src/services/orderEmailService.js
import { sendEmail } from "./sendEmail.js";
import UserModel from "../models/UserModel.js";
import OrderModelAdmin from "../models/OrderModelAdmin.js";


export const sendOrderUpdateEmail = async (orderId, newStatusId) => {
  try {
    // Obtener detalles de la orden
    const orderDetails = await OrderModelAdmin.getOrderDetailsByOrderId(
      orderId
    );

    if (!orderDetails || orderDetails.length === 0) {
      throw new Error("Order not found");
    }

    const order = orderDetails[0];
    const userId = order.id_user;

    // Obtener información del usuario
    const userInfo = await UserModel.getUserInfo(userId);
    if (!userInfo || !userInfo.USUARIO) {
      throw new Error("User email not found");
    }

    // Mapeo de estados
    const statusNames = {
      300000: "Recepción",
      300001: "Preparando",
      300002: "Empaquetado",
      300003: "Envío",
      300004: "Entregado",
    };

    const statusName = statusNames[newStatusId] || "Desconocido";

    // URL para ver el estado del pedido
    const orderStatusUrl = `${
      process.env.CLIENT_URL || "http://localhost:3000"
    }/profile?tab=orders`;

    // Crear el contenido del email
    const subject = `Actualización de tu Pedido #${orderId} - ${statusName}`;

    const textContent = `
Hola ${userInfo.NOMBRES || "Cliente"},

Tu pedido #${orderId} ha sido actualizado.

Estado actual: ${statusName}
Fecha de actualización: ${new Date().toLocaleString("es-ES")}

Puedes ver los detalles completos de tu pedido aquí:
${orderStatusUrl}

¡Gracias por tu compra!

Equipo de Love Bites
    `;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #d97706, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .status-badge { display: inline-block; padding: 8px 16px; background: #10b981; color: white; border-radius: 20px; font-weight: bold; }
        .cta-button { display: inline-block; padding: 12px 30px; background: #d97706; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍰 Love Bites</h1>
            <h2>Actualización de Pedido</h2>
        </div>
        <div class="content">
            <h3>¡Hola ${userInfo.NOMBRES || "Cliente"}!</h3>
            
            <p>Tu pedido <strong>#${orderId}</strong> ha sido actualizado.</p>
            
            <p><strong>Estado actual:</strong> <span class="status-badge">${statusName}</span></p>
            
            <p><strong>Fecha de actualización:</strong> ${new Date().toLocaleString(
              "es-ES"
            )}</p>
            
            <p>Puedes ver todos los detalles de tu pedido y hacer seguimiento haciendo clic en el siguiente enlace:</p>
            
            <div style="text-align: center;">
                <a href="${orderStatusUrl}" class="cta-button">Ver Estado del Pedido</a>
            </div>
            
            <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
            
            <p>¡Gracias por elegir Love Bites! 🧁</p>
        </div>
        <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>
    `;

    // Enviar el email
    await sendEmail(userInfo.USUARIO, subject, textContent, htmlContent);

    console.log(
      `Order update email sent to ${userInfo.USUARIO} for order ${orderId}`
    );
    return true;
  } catch (error) {
    console.error("Error sending order update email:", error);
    throw error;
  }
};













//confirmacion de pedido
export const sendOrderConfirmedEmail = async (orderId) => {
  try {
    // Obtener detalles de la orden
    const orderDetails = await OrderModelAdmin.getOrderDetailsByOrderId(
      orderId
    );

    if (!orderDetails || orderDetails.length === 0) {
      throw new Error("Order not found");
    }

    const order = orderDetails[0];
    const userId = order.id_user;

    // Obtener información del usuario
    const userInfo = await UserModel.getUserInfo(userId);
    if (!userInfo || !userInfo.USUARIO) {
      throw new Error("User email not found");
    }

    // URL para ver el estado del pedido
    const orderStatusUrl = `${
      process.env.CLIENT_URL || "http://localhost:3000"
    }/profile?tab=orders`;

    // Crear el contenido del email
    const subject = `Pedido Confirmado #${orderId} - ¡Gracias por tu compra!`;

    const textContent = `
Hola ${userInfo.NOMBRES || "Cliente"},

Nos complace informarte que tu pedido #${orderId} ha sido confirmado y está siendo procesado.

Puedes ver los detalles completos de tu pedido aquí:
${orderStatusUrl}

¡Gracias por confiar en Love Bites!

Equipo de Love Bites
    `;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #d97706, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .status-badge { display: inline-block; padding: 8px 16px; background: #2563eb; color: white; border-radius: 20px; font-weight: bold; }
        .cta-button { display: inline-block; padding: 12px 30px; background: #d97706; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍰 Love Bites</h1>
            <h2>Pedido Confirmado</h2>
        </div>
        <div class="content">
            <h3>¡Hola ${userInfo.NOMBRES || "Cliente"}!</h3>
            
            <p>Tu pedido <strong>#${orderId}</strong> ha sido <span class="status-badge">Confirmado</span>.</p>
            
            <p>Estamos trabajando para prepararlo y enviarlo lo antes posible.</p>
            
            <p>Puedes ver todos los detalles de tu pedido y hacer seguimiento haciendo clic en el siguiente enlace:</p>
            
            <div style="text-align: center;">
                <a href="${orderStatusUrl}" class="cta-button">Ver Estado del Pedido</a>
            </div>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            
            <p>¡Gracias por elegir Love Bites! 🧁</p>
        </div>
        <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>
    `;

    // Enviar el email
    await sendEmail(userInfo.USUARIO, subject, textContent, htmlContent);

    console.log(
      `Order confirmed email sent to ${userInfo.USUARIO} for order ${orderId}`
    );
    return true;
  } catch (error) {
    console.error("Error sending order confirmed email:", error);
    throw error;
  }
};
