// AdminDashboard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  TopProductsChart,
  TopRatingChart,
  States,
} from "../admin/graficas.jsx";
import { InventoryChart } from "./InventoryChart";
import "./admin-dashboard.css";

const ADMIN_CARDS = [
  {
    id: "productos",
    title: "Productos",
    description: "Gestiona el catálogo de productos",
    buttonText: "Ver Productos",
  },
  {
    id: "pedidos",
    title: "Pedidos",
    description: "Administra los pedidos de los clientes",
    buttonText: "Ver Pedidos",
  },
  {
    id: "inventario",
    title: "Inventario",
    description: "Controla el inventario de materias primas",
    buttonText: "Ver Inventario",
  },
  {
    id: "usuarios",
    title: "Usuarios",
    description: "Gestiona las cuentas de usuarios",
    buttonText: "Ver Usuarios",
  },
];

export function AdminDashboard() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isAdmin) {
      navigate("/catalogo");
      return;
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCardClick = (cardId) => {
    // TODO: Implementar navegación específica para cada card
    console.log(`Navegando a: ${cardId}`);
  };

  // Early return si no está autenticado o no es admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <Header user={user} onLogout={handleLogout} />
      <main className="admin-content">
        <AdminCards cards={ADMIN_CARDS} onCardClick={handleCardClick} />

        <ChartsSection />
      </main>
    </div>
  );
}

// Componente Header separado
function Header({ user, onLogout }) {
  return (
    <header className="admin-header">
      <h1 className="admin-title">Panel de Administrador</h1>
      <div className="admin-user-info">
        <span className="user-greeting">
          Bienvenido, {user.nombres} {user.apellidos}
        </span>
        <button onClick={onLogout} className="logout-button" type="button">
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}

// Componente Welcome separado
function WelcomeSection({ user }) {
  return (
    <section className="admin-welcome">
      <h2>¡Hola {user.nombres}! 👋</h2>
      <p>Desde aquí puedes gestionar todos los aspectos de la panadería.</p>
    </section>
  );
}

// Componente Cards separado
function AdminCards({ cards, onCardClick }) {
  return (
    <section className="admin-cards">
      {cards.map((card) => (
        <AdminCard
          key={card.id}
          card={card}
          onClick={() => onCardClick(card.id)}
        />
      ))}
    </section>
  );
}

// Componente individual Card
function AdminCard({ card, onClick }) {
  return (
    <article className="admin-card">
      <div className="card-header">
        <span className="card-icon">{card.icon}</span>
        <h3 className="card-title">{card.title}</h3>
      </div>
      <p className="card-description">{card.description}</p>
      <button className="admin-card-button" onClick={onClick} type="button">
        {card.buttonText}
      </button>
    </article>
  );
}

// Componente Charts separado
function ChartsSection() {
  return (
    <section className="charts-container">
      {/* Sección de Inventario */}
      <div className="inventory-charts">
        <h2 className="section-title">Gestión de Inventario</h2>
        <div className="chart-grid">
          <div className="admin-chart-section">
            <InventoryChart
              order="desc"
              title="Stock Actual por Materia Prima"
            />
          </div>
          <div className="admin-chart-section">
            <InventoryChart order="asc" title="Materiales Más Escasos" />
          </div>
        </div>
      </div>

      {/* Sección de Productos */}
      <div className="products-charts">
        <h2 className="section-title">Análisis de Productos</h2>
        <div className="chart-grid">
          <div className="admin-chart-section">
            <h3>Top Productos por Precio</h3>
            <TopProductsChart />
          </div>

          <div className="admin-chart-section">
            <h3>Top Productos por Rating</h3>
            <TopRatingChart />
          </div>

          <div className="admin-chart-section">
            <h3>Estado de Productos</h3>
            <States />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
