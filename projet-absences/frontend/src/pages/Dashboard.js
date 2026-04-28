import React, { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function Dashboard() {
  const [absences, setAbsences] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {
    Promise.all([
      API.get("/absences"),
      user.role === "admin" ? API.get("/users") : Promise.resolve({ data: [] })
    ])
      .then(([absRes, usersRes]) => {
        setAbsences(absRes.data);
        setUsers(usersRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const total = absences.length;
  const en_attente = absences.filter(a => a.status === "en_attente" || a.status === "soumise" || !a.status).length;
  const en_cours = absences.filter(a => a.status === "en_cours").length;
  const acceptees = absences.filter(a => a.status === "acceptee").length;
  const refusees = absences.filter(a => a.status === "refusee").length;
  const tauxAccept = total > 0 ? Math.round((acceptees / total) * 100) : 0;
  const tauxRefus = total > 0 ? Math.round((refusees / total) * 100) : 0;

  const parMois = absences.reduce((acc, a) => {
    const mois = new Date(a.start_date).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    acc[mois] = (acc[mois] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    if (loading || !chartRef.current || Object.keys(parMois).length === 0) return;
    if (chartInstance.current) chartInstance.current.destroy();
    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(parMois),
        datasets: [{ label: "Demandes", data: Object.values(parMois), backgroundColor: "#3b82f6", borderRadius: 8 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
  }, [loading, parMois]);

  if (loading) {
    return (
      <div>
        <h2 style={{ color: "#1e293b", marginBottom: "24px" }}>Dashboard</h2>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ background: "#e2e8f0", height: "100px", flex: 1, borderRadius: "16px", animation: "pulse 1.5s infinite" }} />)}
        </div>
        <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: "#1e293b", marginBottom: "24px", fontSize: "24px", fontWeight: "600" }}>Dashboard</h2>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
        <MetricCard label="Total demandes" value={total} color="#3b82f6" />
        <MetricCard label="En attente" value={en_attente} color="#f59e0b" />
        <MetricCard label="En cours" value={en_cours} color="#8b5cf6" />
        <MetricCard label="Acceptées" value={acceptees} color="#10b981" />
        <MetricCard label="Refusées" value={refusees} color="#ef4444" />
        <MetricCard label="Taux acceptation" value={`${tauxAccept}%`} color="#06b6d4" />
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "32px" }}>
        <div style={{ flex: 2, background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "16px", color: "#475569" }}>Demandes par mois</h3>
          <div style={{ height: "250px" }}>
            <canvas ref={chartRef} />
          </div>
        </div>
        <div style={{ flex: 1, background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "16px", color: "#475569" }}>Indicateurs</h3>
          <Stat label="Taux d'acceptation" value={`${tauxAccept}%`} color="#10b981" />
          <Stat label="Taux de refus" value={`${tauxRefus}%`} color="#ef4444" />
          <Stat label="Non traités" value={en_attente + en_cours} color="#f59e0b" />
        </div>
      </div>

      {user.role === "admin" && (
        <div style={{ background: "white", borderRadius: "20px", padding: "20px", marginBottom: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "16px", color: "#475569" }}>Utilisateurs enregistrés</h3>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <MetricCard small label="Total" value={users.length} color="#1e293b" />
            <MetricCard small label="Étudiants" value={users.filter(u => u.role === "etudiant").length} color="#3b82f6" />
            <MetricCard small label="Agents" value={users.filter(u => u.role === "agent").length} color="#8b5cf6" />
            <MetricCard small label="Admins" value={users.filter(u => u.role === "admin").length} color="#ef4444" />
          </div>
        </div>
      )}

      <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginBottom: "16px", fontSize: "16px", color: "#475569" }}>5 dernières demandes</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", color: "#64748b" }}>Étudiant</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", color: "#64748b" }}>Début</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", color: "#64748b" }}>Fin</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", color: "#64748b" }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {absences.slice(0, 5).map(a => (
                <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{a.nom}</td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{new Date(a.start_date).toLocaleDateString("fr-FR")}</td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{new Date(a.end_date).toLocaleDateString("fr-FR")}</td>
                  <td style={{ padding: "12px" }}><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// composants internes
function MetricCard({ label, value, color, small }) {
  return (
    <div style={{ flex: 1, minWidth: "120px", background: "white", borderRadius: "16px", padding: small ? "12px" : "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: small ? "22px" : "28px", fontWeight: "700", color }}>{value}</div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: "700", color }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = { en_attente: { bg: "#dbeafe", color: "#1e40af", label: "en attente" }, en_cours: { bg: "#fed7aa", color: "#9a3412", label: "en cours" }, acceptee: { bg: "#d1fae5", color: "#065f46", label: "acceptée" }, refusee: { bg: "#fee2e2", color: "#991b1b", label: "refusée" } }[status] || { bg: "#f1f5f9", color: "#475569", label: status || "en attente" };
  return <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>{s.label}</span>;
}