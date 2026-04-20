import React, { useState } from "react";
import axios from "axios";

export default function Login({ setToken }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur]     = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setErreur("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      setToken(token, user);

    } catch (err) {
      setErreur(err.response?.data?.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#f0f2f5"
    }}>
      <div style={{
        background: "#fff", borderRadius: "12px",
        padding: "40px", width: "100%", maxWidth: "380px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ color: "#1a3a5c", marginBottom: "24px", textAlign: "center" }}>
          ENS Marrakech
        </h2>

        {erreur && (
          <div style={{
            background: "#FEF2F2", color: "#B91C1C",
            padding: "10px 14px", borderRadius: "8px",
            marginBottom: "16px", fontSize: "14px"
          }}>
            {erreur}
          </div>
        )}

        <div style={{ marginBottom: "14px" }}>
          <label style={lbl}>Email</label>
          <input
            type="email"
            placeholder="admin@test.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inp}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={lbl}>Mot de passe</label>
          <input
            type="password"
            placeholder="1234"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={inp}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "11px",
            background: loading ? "#9CA3AF" : "#1a3a5c",
            color: "#fff", border: "none", borderRadius: "8px",
            fontSize: "15px", fontWeight: "600", cursor: "pointer"
          }}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p style={{ marginTop: "16px", fontSize: "12px", color: "#9CA3AF", textAlign: "center" }}>
           Systeme de gestion des absences medicales
        </p>
      </div>
    </div>
  );
}

const lbl = { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" };
const inp = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "1px solid #D1D5DB", fontSize: "14px",
  boxSizing: "border-box", outline: "none"
};