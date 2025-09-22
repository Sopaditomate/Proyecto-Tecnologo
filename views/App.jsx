import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AppRoutes } from "./routes/routes";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ToastContainer />
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
