// Componente principal que configura el enrutamiento y el contexto del carrito
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../views/context/AuthContext";
import { CartProvider } from "../views/context/CartContext";
import { AppRoutes } from "./routes/routes";
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    // Envuelve la aplicación con el proveedor de autenticación y el proveedor del carrito
    <AuthProvider>
      <CartProvider>
        {/* Configura el enrutador para la navegación */}
        <Router>
          <ToastContainer />
          <main>
            <Routes>
              {/* Mapea todas las rutas definidas en AppRoutes */}
              {AppRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </main>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
