import React from "react";

export default function Sidebar({ setPage, onLogout }) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  return (
    <div style={{
      width: "220px", minHeight: "100vh",
      background: "#1a3a5c", color: "#fff",
      display: "flex", flexDirection: "column", flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: "15px", fontWeight: "700" }}>ENS Marrakech</div>
        <div style={{ fontSize: "12px", opacity: 0.6, marginTop: "4px" }}>Absences médicales</div>
      </div>

      {/* Utilisateur connecté */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: "13px", fontWeight: "600" }}>{user.nom || "Utilisateur"}</div>
        <div style={{
          display: "inline-block", marginTop: "4px", fontSize: "11px",
          padding: "2px 8px", borderRadius: "10px", background: roleBg(user.role)
        }}>
          {user.role}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 0" }}>

        {/* ✅ Dashboard : agent ET admin */}
        {(user.role === "agent" || user.role === "admin") && (
          <NavItem icon="📊" label="Dashboard"    onClick={() => setPage("dashboard")} />
        )}

        {/* ✅ Absences : agent ET admin */}
        {(user.role === "agent" || user.role === "admin") && (
          <NavItem icon="📋" label="Absences"     onClick={() => setPage("absences")} />
        )}

        {/* ✅ Utilisateurs : ADMIN SEULEMENT */}
        {user.role === "admin" && (
          <NavItem icon="👥" label="Utilisateurs" onClick={() => setPage("users")} />
        )}

      </nav>

      {/* Déconnexion */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <button onClick={onLogout} style={{
          width: "100%", padding: "9px",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff", borderRadius: "8px",
          fontSize: "13px", cursor: "pointer"
        }}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", padding: "10px 20px",
      background: "transparent", border: "none",
      color: "rgba(255,255,255,0.8)", fontSize: "14px", cursor: "pointer",
      display: "flex", alignItems: "center", gap: "10px"
    }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <span style={{ fontSize: "16px" }}>{icon}</span>
      {label}
    </button>
  );
}

function roleBg(role) {
  if (role === "admin") return "rgba(239,68,68,0.25)";
  if (role === "agent") return "rgba(139,92,246,0.25)";
  return "rgba(59,130,246,0.25)";
}