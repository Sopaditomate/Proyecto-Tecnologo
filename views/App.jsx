"use client";

import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AppRoutes } from "./routes/routes";
import { ToastContainer } from "react-toastify";
import usePaymentDetector from "./pages/cart/usePaymentDetector";
import { useState, useEffect } from "react";
import { CheckoutModal } from "./pages/cart/CheckoutModal";

function App() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handlePaymentDetected = (data) => {
    console.log("Payment detected in App:", data);
    setPaymentData(data);
    setShowSuccessModal(true);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ToastContainer />
          <AppRoutes />

       
          <PaymentDetectorWrapper onPaymentDetected={handlePaymentDetected} />

          {showSuccessModal && paymentData && (
            <CheckoutModal
              onClose={() => setShowSuccessModal(false)}
              cartItems={paymentData.cartData.items}
              subtotal={paymentData.cartData.items.reduce(
                (sum, item) => sum + item.price * item.cantidad,
                0
              )}
              shipping={paymentData.cartData.shippingCost}
              taxes={0}
              total={
                paymentData.cartData.items.reduce(
                  (sum, item) => sum + item.price * item.cantidad,
                  0
                ) + paymentData.cartData.shippingCost
              }
              address={paymentData.cartData.deliveryAddress}
              initialStep="success"
              orderId={paymentData.orderId}
            />
          )}
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

// ✅ Este componente pequeño ejecuta el hook correctamente dentro del provider
function PaymentDetectorWrapper({ onPaymentDetected }) {
  usePaymentDetector(onPaymentDetected);
  return null;
}

export default App;
