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
    link:"/admin/products"
  },
  {
    id: "pedidos",
    title: "Pedidos",
    description: "Administra los pedidos de los clientes",
    buttonText: "Ver Pedidos",
    link: "/admin/orders",
  },
  {
    id: "inventario",
    title: "Inventario",
    description: "Controla el inventario de materias primas",
    buttonText: "Ver Inventario",
    link: "/admin/inventory",
  },
  {
    id: "usuarios",
    title: "Usuarios",
    description: "Gestiona las cuentas de usuarios",
    buttonText: "Ver Usuarios",
    link: "/admin/users",
  },
];

export function AdminDashboard() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

<<<<<<< HEAD
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isAdmin) {
      navigate("/catalogo");
      return;
=======
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!isAdmin) {
      navigate("/catalogo");
>>>>>>> produccion
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

<<<<<<< HEAD
  const handleCardClick = (cardId) => {
  const card = ADMIN_CARDS.find((c) => c.id === cardId);
  if (card?.link) {
    navigate(card.link);
  } else {
    console.warn(`No se encontró link para la tarjeta: ${cardId}`);
  }
};


  // Early return si no está autenticado o no es admin
=======
>>>>>>> produccion
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
<<<<<<< HEAD
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
=======
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

        <div className="admin-chart-section">
          <InventoryChart order="desc" title="Stock Actual por Materia Prima" />
          <InventoryChart order="asc" title="Materiales Más Escasos" />
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
>>>>>>> produccion
