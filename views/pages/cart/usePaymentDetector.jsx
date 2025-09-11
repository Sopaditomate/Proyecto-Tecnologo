"use client";

import { useEffect } from "react";
import PaymentService from "../../../src/services/paymentService.js";
import { useCart } from "../../context/CartContext.jsx";

export function usePaymentDetector(onPaymentDetected) {
  const { clearCart } = useCart();

  useEffect(() => {
    const detectPaymentReturn = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const collectionId = urlParams.get("collection_id");
        const collectionStatus = urlParams.get("collection_status");
        const paymentReturn = urlParams.get("payment_return");

        console.log("Payment detector - URL params:", {
          collectionId,
          collectionStatus,
          paymentReturn,
          fullURL: window.location.href,
        });

        if (
          collectionId &&
          (collectionStatus === "approved" || paymentReturn === "true")
        ) {
          console.log("Payment detector - Detected successful payment");

          const statusResponse = await PaymentService.checkMercadoPagoStatus(
            collectionId
          );
          console.log("Payment detector - Status response:", statusResponse);

          if (statusResponse.success && statusResponse.status === "approved") {
            console.log("Payment detector - Payment approved");

            const isCatalog = window.location.pathname.includes("/catalogo");
            const savedCartData = localStorage.getItem("pendingPaymentData");

            if (isCatalog && savedCartData) {
              const cartData = JSON.parse(savedCartData);

              const orderData = {
                items: cartData.items,
                deliveryAddress: cartData.deliveryAddress,
                shippingCost: cartData.shippingCost,
                paymentId: collectionId,
              };

              try {
                const createOrderResponse =
                  await PaymentService.createOrderAfterPayment(orderData);

                if (createOrderResponse.success) {
                  console.log(
                    "Payment detector - Order created successfully:",
                    createOrderResponse.orderId
                  );

                  // Limpiar datos pendientes
                  localStorage.removeItem("pendingPaymentData");

                  // Limpiar carrito SOLO aquí, cuando la orden fue creada OK
                  clearCart();

                  if (onPaymentDetected) {
                    onPaymentDetected({
                      orderId: createOrderResponse.orderId,
                      paymentId: collectionId,
                      cartData: cartData,
                    });
                  }

                  // Limpiar URL para evitar repetición
                  const url = new URL(window.location);
                  url.searchParams.delete("collection_id");
                  url.searchParams.delete("collection_status");
                  url.searchParams.delete("payment_return");
                  url.searchParams.delete("payment_id");
                  url.searchParams.delete("status");
                  url.searchParams.delete("external_reference");
                  url.searchParams.delete("payment_type");
                  url.searchParams.delete("merchant_order_id");
                  url.searchParams.delete("preference_id");
                  url.searchParams.delete("site_id");
                  url.searchParams.delete("processing_mode");
                  url.searchParams.delete("merchant_account_id");
                  window.history.replaceState({}, document.title, url);
                } else {
                  throw new Error(
                    createOrderResponse.message || "Error al crear el pedido"
                  );
                }
              } catch (orderError) {
                console.error(
                  "Payment detector - Error creating order:",
                  orderError
                );
                alert(
                  "Pago aprobado, pero ocurrió un error al crear el pedido. Contacta soporte."
                );
              }
            } else if (!isCatalog) {
              const redirectUrl = `/catalogo?collection_id=${collectionId}&collection_status=approved&payment_return=true`;
              console.log(
                "Payment detector - Redirecting to catalog:",
                redirectUrl
              );
              window.location.href = redirectUrl;
            }
          }
        }
      } catch (error) {
        console.error("Payment detector - Error:", error);
        const savedCartData = localStorage.getItem("pendingPaymentData");
        if (savedCartData) {
          alert("Error al procesar el pago. Por favor contacte soporte.");
        }
      }
    };

    detectPaymentReturn();
  }, [clearCart, onPaymentDetected]);
}

export default usePaymentDetector;
