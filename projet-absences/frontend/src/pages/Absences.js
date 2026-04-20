import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function Absences() {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null); // absence sélectionnée pour le modal
  const [logs, setLogs]         = useState([]);   // historique statuts

  const load = () => {
    API.get("/absences")
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ── Ouvrir le modal détail ─────────────────────────────────────────────────
  const openDetail = (absence) => {
    setSelected(absence);
    setLogs([]);
    // Charger l'historique des statuts
    API.get(`/absences/${absence.id}/logs`)
      .then(res => setLogs(res.data))
      .catch(() => setLogs([]));
    // Passer en "en_cours" si encore en attente
    if (absence.status === "en_attente" || absence.status === "soumise" || !absence.status) {
      API.post("/absences/encours", { id: absence.id })
        .then(() => load())
        .catch(() => {});
    }
  };

  const closeDetail = () => { setSelected(null); setLogs([]); };

  // ── Actions valider / refuser ──────────────────────────────────────────────
  const validate = (id) => {
    const comment = prompt("Commentaire (optionnel) :") || "Validé";
    API.post("/absences/validate", { id, comment })
      .then(() => { load(); closeDetail(); })
      .catch(err => alert(err.response?.data?.message || "Erreur"));
  };

  const refuse = (id) => {
    const comment = prompt("Motif du refus :") || "Dossier incomplet";
    API.post("/absences/refuse", { id, comment })
      .then(() => { load(); closeDetail(); })
      .catch(err => alert(err.response?.data?.message || "Erreur"));
  };

  if (loading) return <p style={{ padding: "40px" }}>Chargement...</p>;

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ color: "#1a3a5c", marginBottom: "24px" }}>Gestion des absences</h2>

      {data.length === 0 ? (
        <p style={{ color: "#9CA3AF" }}>Aucune absence.</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F9FAFB" }}>
              <tr>
                <Th>Étudiant</Th>
                <Th>Début</Th>
                <Th>Fin</Th>
                <Th>Motif</Th>
                <Th>Statut</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {data.map(a => (
                <tr key={a.id}
                  style={{ borderBottom: "1px solid #F3F4F6", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={td}>{a.nom}</td>
                  <td style={td}>{new Date(a.start_date).toLocaleDateString("fr-FR")}</td>
                  <td style={td}>{new Date(a.end_date).toLocaleDateString("fr-FR")}</td>
                  <td style={td} title={a.reason}>
                    {a.reason ? (a.reason.length > 30 ? a.reason.slice(0, 30) + "…" : a.reason) : "—"}
                  </td>
                  <td style={td}><StatusBadge status={a.status} /></td>
                  <td style={td}>
                    {/* ── Bouton détails ── */}
                    <button onClick={() => openDetail(a)} style={btnD}>🔍 Détails</button>

                    {/* ── Boutons valider/refuser ── */}
                    {!["acceptee", "refusee"].includes(a.status) ? (
                      <>
                        <button onClick={() => validate(a.id)} style={btnV}>✔ Valider</button>
                        <button onClick={() => refuse(a.id)}   style={btnR}>❌ Refuser</button>
                      </>
                    ) : (
                      <span style={{ color: "#9CA3AF", fontSize: "12px" }}>Traitée</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal détail ──────────────────────────────────────────────────── */}
      {selected && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}
          onClick={closeDetail} // clic hors modal = ferme
        >
          <div style={{
            background: "#fff", borderRadius: "14px",
            width: "560px", maxWidth: "95vw", maxHeight: "85vh",
            overflowY: "auto", padding: "32px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)"
          }}
            onClick={e => e.stopPropagation()} // empêche fermeture sur clic intérieur
          >
            {/* En-tête modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", color: "#1a3a5c", fontSize: "18px" }}>
                  Détail de l'absence
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#6B7280" }}>
                  Demande #{selected.id} — {selected.nom}
                </p>
              </div>
              <button onClick={closeDetail} style={{
                background: "none", border: "none", fontSize: "20px",
                cursor: "pointer", color: "#9CA3AF", lineHeight: 1
              }}>✕</button>
            </div>

            {/* Infos principales */}
            <Section title="Informations">
              <Row label="Étudiant"    value={selected.nom} />
              <Row label="Email"       value={selected.email} />
              <Row label="Date début"  value={new Date(selected.start_date).toLocaleDateString("fr-FR")} />
              <Row label="Date fin"    value={new Date(selected.end_date).toLocaleDateString("fr-FR")} />
              <Row label="Durée"       value={`${Math.ceil((new Date(selected.end_date) - new Date(selected.start_date)) / (1000*60*60*24) + 1)} jour(s)`} />
              <Row label="Motif"       value={selected.reason || "—"} />
              <Row label="Statut"      value={<StatusBadge status={selected.status} />} />
              {selected.agent_comment && (
                <Row label="Commentaire agent" value={selected.agent_comment} />
              )}
            </Section>

            {/* Justificatif */}
            <Section title="Justificatif">
              {selected.file_path ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "28px" }}>
                    {selected.file_type?.includes("pdf") ? "📄" : "🖼️"}
                  </span>
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#374151" }}>
                      {selected.file_type?.includes("pdf") ? "Document PDF" : "Image"}
                    </p>
                    <a
                      href={`http://localhost:5000/${selected.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block", padding: "6px 14px",
                        background: "#1a3a5c", color: "#fff",
                        borderRadius: "6px", fontSize: "13px",
                        textDecoration: "none", fontWeight: 600
                      }}
                     >
                      📥 Voir le justificatif
                    </a>
                  </div>
                </div>
              ) : (
                <p style={{ color: "#9CA3AF", fontSize: "14px", margin: 0 }}>
                  Aucun justificatif joint
                </p>
              )}
            </Section>

            {/* Historique */}
            <Section title="Historique des statuts">
              {logs.length === 0 ? (
                <p style={{ color: "#9CA3AF", fontSize: "14px", margin: 0 }}>Aucun historique</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} style={{
                    display: "flex", gap: "12px", alignItems: "flex-start",
                    marginBottom: "12px", paddingBottom: "12px",
                    borderBottom: i < logs.length - 1 ? "1px solid #F3F4F6" : "none"
                  }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: "#3B82F6", marginTop: "6px", flexShrink: 0
                    }} />
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: "13px", color: "#374151" }}>
                        <strong>{log.old_status || "—"}</strong> → <strong>{log.new_status}</strong>
                        {log.agent_nom && <span style={{ color: "#6B7280" }}> par {log.agent_nom}</span>}
                      </p>
                      {log.comment && (
                        <p style={{ margin: "0 0 2px", fontSize: "12px", color: "#6B7280" }}>
                          "{log.comment}"
                        </p>
                      )}
                      <p style={{ margin: 0, fontSize: "11px", color: "#9CA3AF" }}>
                        {new Date(log.changed_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </Section>

            {/* Actions dans le modal */}
            {!["acceptee", "refusee"].includes(selected.status) && (
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button onClick={() => validate(selected.id)} style={{ ...btnV, flex: 1, padding: "10px" }}>
                  ✔ Valider l'absence
                </button>
                <button onClick={() => refuse(selected.id)} style={{ ...btnR, flex: 1, padding: "10px" }}>
                  ❌ Refuser l'absence
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h4 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700,
        color: "#6B7280", textTransform: "uppercase", letterSpacing: ".05em" }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "8px", fontSize: "14px" }}>
      <span style={{ color: "#6B7280", minWidth: "140px", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#111827", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    en_attente: { bg: "#EFF6FF", color: "#1D4ED8" },
    soumise:    { bg: "#EFF6FF", color: "#1D4ED8" },
    en_cours:   { bg: "#FFFBEB", color: "#B45309" },
    acceptee:   { bg: "#ECFDF5", color: "#065F46" },
    refusee:    { bg: "#FEF2F2", color: "#B91C1C" },
  };
  const s = map[status] || { bg: "#F3F4F6", color: "#374151" };
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
  return <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px",
    fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{children}</th>;
}

const td   = { padding: "10px 14px", fontSize: "14px", color: "#374151", verticalAlign: "middle" };
const btnD = { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", marginRight: "6px", fontWeight: 600, fontSize: "12px" };
const btnV = { background: "#ECFDF5", color: "#065F46", border: "1px solid #6EE7B7", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", marginRight: "6px", fontWeight: 600, fontSize: "12px" };
const btnR = { background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontWeight: 600, fontSize: "12px" };