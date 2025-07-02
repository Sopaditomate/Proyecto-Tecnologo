import React from "react";

export default function ProfileSidebar({
  form,
  profile,
  activeTab,
  setActiveTab,
}) {
  return (
    <div className="profile-sidebar">
      <div className="profile-avatar-section">
        <div className="avatar-container">
          <div className="avatar">
            <span className="avatar-initials">
              {form.nombres?.charAt(0)?.toUpperCase()}
              {form.apellidos?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="avatar-info">
          <h3>
            {form.nombres} {form.apellidos}
          </h3>
          <p>{profile.USUARIO}</p>
        </div>
      </div>
      <nav className="profile-nav">
        <button
          className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Mi Perfil
        </button>
        <button
          className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"></path>
          </svg>
          Mis Pedidos
        </button>
        <button
          className={`nav-item ${activeTab === "verification" ? "active" : ""}`}
          onClick={() => setActiveTab("verification")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Verificación
        </button>
      </nav>
    </div>
  );
}
