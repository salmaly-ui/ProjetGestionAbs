import React, { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Absences from "./pages/Absences";
import Users from "./pages/Users";

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("user") || "null")
  );
  const [page, setPage] = useState("dashboard");

  // 1. Splash screen : affiché 1.5 secondes
  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!splashDone) {
    return <SplashScreen />;
  }

  // 2. Pas de token → Login
  if (!token) {
    return (
      <Login
        setToken={(t, u) => {
          sessionStorage.setItem("token", t);
          sessionStorage.setItem("user", JSON.stringify(u));
          setToken(t);
          setUser(u);
        }}
      />
    );
  }

  // 3. Sécurité : user ou rôle absent → logout
  if (!user || !user.role) {
    sessionStorage.clear();
    setToken(null);
    return null;
  }

  // 4. Vérification du rôle (admin ou agent uniquement)
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

  // 5. Déconnexion (unifiée)
  const logout = () => {
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  };

  // 6. Rendu conditionnel des pages
  const renderPage = () => {
    if (page === "users" && user.role !== "admin")
      return <p style={{ color: "#e40f0f", padding: "40px" }}>Accès interdit.</p>;

    if (page === "dashboard") return <Dashboard />;
    if (page === "absences") return <Absences />;
    if (page === "users") return <Users />;
  };

  // 7. Interface principale (design moderne, sans double logout)
  return (
    <div style={{
      display: "flex",
      fontFamily: "'Inter', sans-serif",
      background: "linear-gradient(135deg, #eef2f7, #f8fafc)",
      minHeight: "100vh"
    }}>
      <Sidebar setPage={setPage} onLogout={logout} />

      <div style={{
        flex: 1,
        padding: "32px",
        overflow: "auto"
      }}>
        {/* Top bar : plus que le nom utilisateur, sans bouton logout */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          padding: "16px 20px",
          background: "white",
          borderRadius: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>
              Tableau de bord
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              Gestion des absences médicales
            </p>
          </div>

          <div style={{
            padding: "6px 12px",
            background: "#f1f5f9",
            borderRadius: "10px",
            fontSize: "13px",
            color: "#334155"
          }}>
            {user.nom || "Utilisateur"}
          </div>
        </div>

        {/* Contenu de la page sélectionnée */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.05)"
        }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}