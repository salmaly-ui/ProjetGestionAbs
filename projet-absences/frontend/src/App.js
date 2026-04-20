import React, { useState } from "react";
import Login     from "./pages/Login";
import Sidebar   from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Absences  from "./pages/Absences";
import Users     from "./pages/Users";

export default function App() {
  // ─── sessionStorage au lieu de localStorage ────────────────────────────────
  // → token effacé automatiquement à la fermeture du navigateur/onglet
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [user,  setUser]  = useState(
    JSON.parse(sessionStorage.getItem("user") || "null")
  );
  const [page, setPage] = useState("dashboard");

  // ─── 1. Pas de token → Login ───────────────────────────────────────────────
  if (!token) {
    return (
      <Login
        setToken={(t, u) => {
          // On reçoit token + user ensemble depuis Login.js
          sessionStorage.setItem("token", t);
          sessionStorage.setItem("user", JSON.stringify(u));
          setToken(t);
          setUser(u);   // ← état React mis à jour atomiquement
        }}
      />
    );
  }

  // ─── 2. Sécurité : user null ou rôle absent → on force logout ─────────────
  if (!user || !user.role) {
    sessionStorage.clear();
    setToken(null);
    return null;
  }

  // ─── 3. Rôle non autorisé sur l'interface web ──────────────────────────────
  const ROLES_AUTORISES = ["admin", "agent"];
  if (!ROLES_AUTORISES.includes(user.role)) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100vh",
        background: "#f0f2f5", fontFamily: "Segoe UI, sans-serif"
      }}>
        <div style={{
          background: "#fff", padding: "40px 48px", borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)", textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚫</div>
          <h2 style={{ color: "#e40f0f", marginBottom: "8px" }}>Accès interdit</h2>
          <p style={{ color: "#555", marginBottom: "24px" }}>
            Cette interface est réservée aux administrateurs et agents.
          </p>
          <button
            onClick={() => {
              sessionStorage.clear();
              setToken(null);
              setUser(null);
            }}
            style={{
              background: "#e40f0f", color: "#fff", border: "none",
              padding: "10px 24px", borderRadius: "8px",
              cursor: "pointer", fontSize: "14px"
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // ─── 4. Déconnexion ────────────────────────────────────────────────────────
  const logout = () => {
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  };

  // ─── 5. Rendu des pages ────────────────────────────────────────────────────
  const renderPage = () => {
    if (page === "users" && user.role !== "admin")
      return <p style={{ color: "#e40f0f", padding: "40px" }}>Accès interdit.</p>;

    if (page === "dashboard") return <Dashboard />;
    if (page === "absences")  return <Absences />;
    if (page === "users")     return <Users />;
  };

  return (
    <div style={{ display: "flex", fontFamily: "Segoe UI, sans-serif" }}>
      <Sidebar setPage={setPage} onLogout={logout} />
      <div style={{ padding: "28px 32px", width: "100%", background: "#f0f2f5", minHeight: "100vh" }}>
        {renderPage()}
      </div>
    </div>
  );
}