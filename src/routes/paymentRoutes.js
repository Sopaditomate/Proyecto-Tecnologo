import express from "express";
import PaymentController from "../controllers/PaymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// =============== RUTAS GENERALES ===============
// Crear pedido después del pago (nuevo flujo)
router.post(
  "/create-order-after-payment",
  verifyToken,
  PaymentController.createOrderAfterPayment
);

// Crear pedido antes del pago (método legacy)
router.post("/create-order", verifyToken, PaymentController.createOrder);

// =============== MERCADO PAGO ROUTES ===============
// Crear preferencia de pago sin crear pedido (nuevo flujo)
router.post(
  "/mercado-pago/create-preference",
  verifyToken,
  PaymentController.createMercadoPagoPreference
);

// Iniciar pago con Mercado Pago (método legacy)
router.post(
  "/mercado-pago/initiate",
  verifyToken,
  PaymentController.initiateMercadoPagoPayment
);

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

// Rutas de retorno de Mercado Pago (success, failure, pending)
router.get("/mercado-pago/success", (req, res) => {
  const collectionId = req.query.collection_id || req.query.payment_id;
  const status = req.query.collection_status || req.query.status || "approved";

  console.log("MercadoPago success return:", req.query);

  if (!collectionId) {
    return res.status(400).send("collection_id is required");
  }

  // Redirige al frontend con los parámetros necesarios
  const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
  res.redirect(
    `${frontendUrl}?collection_id=${collectionId}&collection_status=${status}&payment_return=true`
  );
});

router.get("/mercado-pago/failure", (req, res) => {
  console.log("MercadoPago failure return:", req.query);
  const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
  res.redirect(`${frontendUrl}?collection_status=rejected&payment_return=true`);
});

router.get("/mercado-pago/pending", (req, res) => {
  console.log("MercadoPago pending return:", req.query);
  const collectionId = req.query.collection_id || req.query.payment_id;
  const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
  res.redirect(
    `${frontendUrl}?collection_id=${collectionId}&collection_status=pending&payment_return=true`
  );

  /**
   * Buscar pagos por external reference
   */
  app.get(
    "/payments/mercado-pago/search-by-external-reference/:externalReference",
    async (req, res) => {
      try {
        const { externalReference } = req.params;

        console.log(
          "Searching payments for external reference:",
          externalReference
        );

        // Usar el servicio de MercadoPago para buscar pagos
        const searchResult =
          await mercadoPagoService.searchPaymentsByExternalReference(
            externalReference
          );

        if (searchResult.success) {
          res.json({
            success: true,
            payments: searchResult.payments,
          });
        } else {
          res.json({
            success: false,
            error: searchResult.error,
          });
        }
      } catch (error) {
        console.error("Error searching payments by external reference:", error);
        res.status(500).json({
          success: false,
          error: "Error interno del servidor",
          details: error.message,
        });
      }
    }
  );
});

export default router;
