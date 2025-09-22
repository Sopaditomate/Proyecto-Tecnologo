import express from "express";
import PaymentController from "../controllers/PaymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// =============== RUTAS PRINCIPALES ===============
// Crear solo preferencia de MercadoPago (sin pedido)
router.post(
  "/mercado-pago/create-preference",
  verifyToken,
  PaymentController.createMercadoPagoPreference
);

// Crear pedido SOLO después del pago exitoso
router.post(
  "/create-order-after-payment",
  verifyToken,
  PaymentController.createOrderAfterPayment
);

// =============== MERCADO PAGO ROUTES ===============
// Verificar estado de pago Mercado Pago
router.get(
  "/mercado-pago/status/:paymentId",
  verifyToken,
  PaymentController.checkMercadoPagoPaymentStatus
);

// Webhook para Mercado Pago (IPN - no requiere autenticación)
router.post(
  "/mercado-pago/webhook",
  PaymentController.handleMercadoPagoWebhook
);

// Rutas de retorno de Mercado Pago
router.get("/mercado-pago/success", (req, res) => {
  const collectionId = req.query.collection_id || req.query.payment_id;
  const status = req.query.collection_status || req.query.status || "approved";

  console.log("MercadoPago success return:", req.query);

  if (!collectionId) {
    return res.status(400).send("collection_id is required");
  }

  // Redirige a la página específica de procesamiento de pago
  const frontendUrl = process.env.CLIENT_URL;
  res.redirect(
    `${frontendUrl}/payment-success?collection_id=${collectionId}&collection_status=${status}`
  );
});

router.get("/mercado-pago/failure", (req, res) => {
  console.log("MercadoPago failure return:", req.query);
  const frontendUrl = process.env.CLIENT_URL;
  res.redirect(`${frontendUrl}/payment-success?collection_status=rejected`);
});

router.get("/mercado-pago/pending", (req, res) => {
  console.log("MercadoPago pending return:", req.query);
  const collectionId = req.query.collection_id || req.query.payment_id;
  const frontendUrl = process.env.CLIENT_URL;
  res.redirect(
    `${frontendUrl}/payment-success?collection_id=${collectionId}&collection_status=pending`
  );
});

export default router;
