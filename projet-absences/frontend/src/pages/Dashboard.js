import React, { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function Dashboard() {
  const [absences, setAbsences] = useState([]);
  const [users, setUsers]       = useState([]);
  const chartRef                = useRef(null);
  const chartInstance           = useRef(null);
  const user                    = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get("/absences").then(res => setAbsences(res.data));
    if (user.role === "admin") {
      API.get("/users").then(res => setUsers(res.data));
    }
  }, []);

  // ── Calculs stats ──────────────────────────────────────────────────────────
  const total      = absences.length;

  // en_attente regroupe : en_attente + soumise + null (uniformisation)
  const en_attente = absences.filter(a =>
    a.status === "en_attente" || a.status === "soumise" || !a.status
  ).length;
  const en_cours   = absences.filter(a => a.status === "en_cours").length;
  const acceptees  = absences.filter(a => a.status === "acceptee").length;
  const refusees   = absences.filter(a => a.status === "refusee").length;
  const tauxAccept = total > 0 ? Math.round((acceptees / total) * 100) : 0;
  const tauxRefus  = total > 0 ? Math.round((refusees  / total) * 100) : 0;

  // Demandes par mois
  const parMois = absences.reduce((acc, a) => {
    const mois = new Date(a.start_date).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    acc[mois] = (acc[mois] || 0) + 1;
    return acc;
  }, {});

  // ── Graphique Chart.js ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartRef.current || Object.keys(parMois).length === 0) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(parMois),
        datasets: [{
          label: "Demandes",
          data: Object.values(parMois),
          backgroundColor: "#3B82F6",
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  }, [absences]);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ color: "#1a3a5c", marginBottom: "24px" }}>Dashboard</h2>

      {/* ── Cartes métriques principales ─────────────────────────────────── */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "24px" }}>
        <MetricCard label="Total demandes" value={total}               color="#3B82F6" />
        <MetricCard label="En attente"     value={en_attente}          color="#6366F1" />
        <MetricCard label="En cours"       value={en_cours}            color="#F59E0B" />
        <MetricCard label="Acceptées"      value={acceptees}           color="#10B981" />
        <MetricCard label="Refusées"       value={refusees}            color="#EF4444" />
        <MetricCard label="Taux acceptation" value={`${tauxAccept}%`} color="#8B5CF6" />
      </div>

      {/* ── Graphique + indicateurs ───────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ ...card, flex: 2, minWidth: "280px" }}>
          <h3 style={cardTitle}>Demandes par mois</h3>
          {total === 0
            ? <p style={muted}>Aucune donnée</p>
            : <canvas ref={chartRef} height={180} />
          }
        </div>

        <div style={{ ...card, flex: 1, minWidth: "180px" }}>
          <h3 style={cardTitle}>Indicateurs</h3>
          <Stat label="Taux d'acceptation" value={`${tauxAccept}%`} color="#10B981" />
          <Stat label="Taux de refus"      value={`${tauxRefus}%`}  color="#EF4444" />
          <Stat label="Non traités"        value={en_attente + en_cours} color="#F59E0B" />
        </div>
      </div>

      {/* ── Barre de répartition ─────────────────────────────────────────── */}
      {total > 0 && (
        <div style={{ ...card, marginBottom: "24px" }}>
          <h3 style={cardTitle}>Répartition des statuts</h3>
          <div style={{ display: "flex", gap: "16px", marginBottom: "10px", flexWrap: "wrap" }}>
            <Legend color="#6366F1" label={`En attente (${en_attente})`} />
            <Legend color="#F59E0B" label={`En cours (${en_cours})`} />
            <Legend color="#10B981" label={`Acceptées (${acceptees})`} />
            <Legend color="#EF4444" label={`Refusées (${refusees})`} />
          </div>
          <div style={{ display: "flex", height: "12px", borderRadius: "6px", overflow: "hidden" }}>
            <Bar pct={(en_attente / total) * 100} color="#6366F1" />
            <Bar pct={(en_cours   / total) * 100} color="#F59E0B" />
            <Bar pct={(acceptees  / total) * 100} color="#10B981" />
            <Bar pct={(refusees   / total) * 100} color="#EF4444" />
          </div>
        </div>
      )}

      {/* ── Résumé utilisateurs (admin seulement) ────────────────────────── */}
      {user.role === "admin" && (
        <div style={{ ...card, marginBottom: "24px" }}>
          <h3 style={cardTitle}>Utilisateurs enregistrés</h3>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <MetricCard label="Total users" value={users.length}                                        color="#1a3a5c" small />
            <MetricCard label="Étudiants"   value={users.filter(u => u.role === "etudiant").length}     color="#3B82F6" small />
            <MetricCard label="Agents"      value={users.filter(u => u.role === "agent").length}        color="#8B5CF6" small />
            <MetricCard label="Admins"      value={users.filter(u => u.role === "admin").length}        color="#EF4444" small />
          </div>
        </div>
      )}

      {/* ── Dernières demandes ────────────────────────────────────────────── */}
      <div style={card}>
        <h3 style={cardTitle}>5 dernières demandes</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              <Th>Étudiant</Th><Th>Début</Th><Th>Fin</Th><Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {absences.slice(0, 5).map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                <td style={td}>{a.nom}</td>
                <td style={td}>{new Date(a.start_date).toLocaleDateString("fr-FR")}</td>
                <td style={td}>{new Date(a.end_date).toLocaleDateString("fr-FR")}</td>
                <td style={td}><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────────

function MetricCard({ label, value, color, small }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E7EB",
      borderRadius: "10px", padding: small ? "14px 18px" : "18px 22px",
      minWidth: small ? "110px" : "130px", flex: 1
    }}>
      <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#6B7280" }}>{label}</p>
      <p style={{ margin: 0, fontSize: small ? "22px" : "28px", fontWeight: "700", color }}>{value}</p>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#6B7280", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color }}>{value}</p>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#374151" }}>
      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color }} />
      {label}
    </div>
  );
}

function Bar({ pct, color }) {
  if (!pct) return null;
  return <div style={{ width: `${pct}%`, background: color }} />;
}

function StatusBadge({ status }) {
  const map = {
    en_attente: { bg: "#EFF6FF", color: "#1D4ED8" },
    soumise:    { bg: "#EFF6FF", color: "#1D4ED8" }, // legacy
    en_cours:   { bg: "#FFFBEB", color: "#B45309" },
    acceptee:   { bg: "#ECFDF5", color: "#065F46" },
    refusee:    { bg: "#FEF2F2", color: "#B91C1C" },
  };
  const s = map[status] || { bg: "#F3F4F6", color: "#374151" };

  // Affichage uniforme même pour les anciens statuts
  const label = !status ? "en attente"
    : status === "soumise" ? "en attente"
    : status.replace("_", " ");

  return (
    <span style={{ ...s, padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
      {label}
    </span>
  );
}

function Th({ children }) {
  return <th style={{ padding: "9px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{children}</th>;
}

const card      = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "20px" };
const cardTitle = { fontSize: "15px", fontWeight: "700", color: "#1a3a5c", margin: "0 0 16px" };
const muted     = { color: "#9CA3AF", fontSize: "14px" };
const td        = { padding: "10px 14px", fontSize: "14px", color: "#374151" };