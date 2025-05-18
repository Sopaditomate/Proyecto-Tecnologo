// Componente principal que configura el enrutamiento y el contexto del carrito
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./models/CartContext";
import { AppRoutes } from "./routes/routes";

function App() {
  return (
    // Envuelve la aplicación con el proveedor del carrito
    <CartProvider>
      {/* Configura el enrutador para la navegación */}
      <Router>
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
  );
}

export default App;
