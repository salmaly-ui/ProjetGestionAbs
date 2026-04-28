import React from "react";

export default function Sidebar({ setPage, onLogout }) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  return (
    <div style={{
      width: "260px",
      background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      height: "100vh",
      boxShadow: "2px 0 12px rgba(0,0,0,0.1)"
    }}>
      <div style={{ padding: "24px 20px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{ width: "48px", marginBottom: "12px", borderRadius: "12px" }}
        />
        <div style={{ fontSize: "12px", fontWeight: "600", lineHeight: "1.3" }}>
          Système de Gestion<br />des Absences Médicales
        </div>
      </div>

      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: "14px", fontWeight: "600" }}>{user.nom || "Utilisateur"}</div>
        <div style={{
          display: "inline-block",
          marginTop: "6px",
          padding: "2px 10px",
          borderRadius: "20px",
          fontSize: "11px",
          background: user.role === "admin" ? "#ef4444" : user.role === "agent" ? "#8b5cf6" : "#3b82f6",
          opacity: 0.9
        }}>
          {user.role || "etudiant"}
        </div>
      </div>

      <nav style={{ flex: 1, padding: "16px 0" }}>
        {(user.role === "agent" || user.role === "admin") && (
          <NavItem icon="📊" label="Dashboard" onClick={() => setPage("dashboard")} />
        )}
        {(user.role === "agent" || user.role === "admin") && (
          <NavItem icon="📋" label="Absences" onClick={() => setPage("absences")} />
        )}
        {user.role === "admin" && (
          <NavItem icon="👥" label="Utilisateurs" onClick={() => setPage("users")} />
        )}
      </nav>

      <button onClick={onLogout} style={{
        margin: "16px",
        padding: "10px",
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "12px",
        color: "white",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        transition: "background 0.2s"
      }}>
        Déconnexion
      </button>
    </div>
  );
}

function NavItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "10px 20px",
        background: "transparent",
        border: "none",
        color: "rgba(255,255,255,0.8)",
        fontSize: "14px",
        cursor: "pointer",
        transition: "background 0.2s"
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
      {label}
    </button>
  );
}