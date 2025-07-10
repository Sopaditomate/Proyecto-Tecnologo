import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./admin-dashboard.css";
import { TopProductsChart } from "../admin/graficas.jsx";
import { TopRatingChart } from "../admin/graficas.jsx";
import { States } from "../admin/graficas.jsx";

export function AdminDashboard() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!isAdmin) {
      navigate("/catalogo");
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Panel de Administrador</h1>
        <div className="admin-user-info">
          <span>
            Bienvenido, {user.nombres} {user.apellidos}
          </span>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-welcome">
          <h2>Estás en el panel de administrador</h2>
          <p>Desde aquí puedes gestionar todos los aspectos de la panadería.</p>
        </div>

        <div className="admin-cards">
          <div className="admin-card">
            <h3>Productos</h3>
            <p>Gestiona el catálogo de productos</p>
            <button className="admin-card-button">Ver Productos</button>
          </div>



          <div className="admin-card">
            <h3>Pedidos</h3>
            <p>Administra los pedidos de los clientes</p>
            <button className="admin-card-button">Ver Pedidos</button>
          </div>

          <div className="admin-card">
            <h3>Inventario</h3>
            <p>Controla el inventario de materias primas</p>
            <button className="admin-card-button">Ver Inventario</button>
          </div>

          <div className="admin-card">
            <h3>Usuarios</h3>
            <p>Gestiona las cuentas de usuarios</p>
            <button className="admin-card-button">Ver Usuarios</button>
          </div>
        </div>
      </div>


      <div className="admin-chart-section">
        <h3>Top Productos por Precio</h3>
        <TopProductsChart />
      </div>
      <div className="admin-chart-section">
        <h3>Top Productos por rating</h3>
        <TopRatingChart />
      </div>

   <div className="admin-chart-section">
        <h3>Top Productos por state</h3>
        <States />
      </div>
    </div >



  );
}
