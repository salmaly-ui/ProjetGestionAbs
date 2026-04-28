import React, { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

export default function Absences() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreDateDebut, setFiltreDateDebut] = useState("");
  const [filtreDateFin, setFiltreDateFin] = useState("");
  const [filtreEtudiant, setFiltreEtudiant] = useState("");
  const [confirmState, setConfirmState] = useState({ isOpen: false, action: null, id: null });
  const [commentValue, setCommentValue] = useState("");

  const { toast, showToast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    API.get("/absences")
      .then((res) => { setData(res.data); setFiltered(res.data); })
      .catch(() => showToast("Erreur chargement", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const normalizeStatus = (status) => !status || status === "soumise" ? "en_attente" : status;

  useEffect(() => {
    let result = [...data];
    if (filtreStatut) result = result.filter(a => normalizeStatus(a.status) === filtreStatut);
    if (filtreDateDebut) result = result.filter(a => new Date(a.start_date) >= new Date(filtreDateDebut));
    if (filtreDateFin) result = result.filter(a => new Date(a.end_date) <= new Date(filtreDateFin));
    if (filtreEtudiant) { const term = filtreEtudiant.toLowerCase(); result = result.filter(a => a.nom?.toLowerCase().includes(term) || a.email?.toLowerCase().includes(term)); }
    setFiltered(result);
  }, [filtreStatut, filtreDateDebut, filtreDateFin, filtreEtudiant, data]);

  const openDetail = async (absence) => {
    setSelected(absence);
    API.get(`/absences/${absence.id}/logs`).then(res => setLogs(res.data)).catch(() => setLogs([]));
    const currentStatus = absence.status || "en_attente";
    if (currentStatus === "en_attente" || currentStatus === "soumise") {
      try {
        await API.post("/absences/encours", { id: absence.id });
        setData(prev => prev.map(a => a.id === absence.id ? { ...a, status: "en_cours" } : a));
        setSelected(prev => prev && prev.id === absence.id ? { ...prev, status: "en_cours" } : prev);
      } catch (err) { showToast("Erreur mise à jour du statut", "error"); }
    }
  };

  const closeDetail = () => { setSelected(null); setLogs([]); };

  const promptComment = (action, id) => {
    setCommentValue(action === "validate" ? "Validé" : "Dossier incomplet");
    setConfirmState({ isOpen: true, action, id });
  };

  const handleConfirm = async () => {
    const { action, id } = confirmState;
    const endpoint = action === "validate" ? "/absences/validate" : "/absences/refuse";
    try {
      await API.post(endpoint, { id, comment: commentValue });
      showToast(`Absence ${action === "validate" ? "validée" : "refusée"} avec succès`, "success");
      load();
      closeDetail();
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur", "error");
    } finally {
      setConfirmState({ isOpen: false, action: null, id: null });
      setCommentValue("");
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Chargement des absences...</div>;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, action: null, id: null })}
        onConfirm={handleConfirm}
        title={confirmState.action === "validate" ? "Valider l'absence" : "Refuser l'absence"}
        message={
          <>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Commentaire :</label>
            <textarea
              value={commentValue}
              onChange={e => setCommentValue(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "8px" }}
              rows="3"
            />
          </>
        }
      />

      <div>
        <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px", color: "#1e293b" }}>Gestion des absences</h2>

        {/* Filtres améliorés */}
        <div style={{ background: "white", padding: "16px", borderRadius: "20px", marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-end", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Statut</label>
            <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} style={{ padding: "8px", borderRadius: "12px", border: "1px solid #e2e8f0", marginTop: "4px" }}>
              <option value="">Tous</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="acceptee">Acceptée</option>
              <option value="refusee">Refusée</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Date début ≥</label>
            <input type="date" value={filtreDateDebut} onChange={e => setFiltreDateDebut(e.target.value)} style={{ padding: "8px", borderRadius: "12px", border: "1px solid #e2e8f0", marginTop: "4px" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Date fin ≤</label>
            <input type="date" value={filtreDateFin} onChange={e => setFiltreDateFin(e.target.value)} style={{ padding: "8px", borderRadius: "12px", border: "1px solid #e2e8f0", marginTop: "4px" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Étudiant</label>
            <input type="text" placeholder="Rechercher..." value={filtreEtudiant} onChange={e => setFiltreEtudiant(e.target.value)} style={{ padding: "8px", borderRadius: "12px", border: "1px solid #e2e8f0", width: "200px", marginTop: "4px" }} />
          </div>
          <button onClick={() => { setFiltreStatut(""); setFiltreDateDebut(""); setFiltreDateFin(""); setFiltreEtudiant(""); }} style={{ background: "#f1f5f9", border: "none", padding: "8px 16px", borderRadius: "12px", cursor: "pointer", fontWeight: "500" }}>Réinitialiser</button>
        </div>

        {/* Tableau moderne */}
        {filtered.length === 0 ? (
          <div style={{ background: "white", borderRadius: "20px", padding: "40px", textAlign: "center", color: "#64748b" }}>Aucune absence trouvée</div>
        ) : (
          <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <tr>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569" }}>Étudiant</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569" }}>Début</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569" }}>Fin</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569" }}>Motif</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569" }}>Statut</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fafcff"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 16px" }}>{a.nom}</td>
                      <td style={{ padding: "12px 16px" }}>{new Date(a.start_date).toLocaleDateString("fr-FR")}</td>
                      <td style={{ padding: "12px 16px" }}>{new Date(a.end_date).toLocaleDateString("fr-FR")}</td>
                      <td style={{ padding: "12px 16px", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={a.reason}>{a.reason?.slice(0, 30) || "—"}</td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={a.status} /></td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => openDetail(a)} style={{ background: "#e0e7ff", color: "#1e40af", border: "none", padding: "6px 12px", borderRadius: "10px", marginRight: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>Détails</button>
                        {!["acceptee", "refusee"].includes(a.status) && (
                          <>
                            <button onClick={() => promptComment("validate", a.id)} style={{ background: "#dcfce7", color: "#166534", border: "none", padding: "6px 12px", borderRadius: "10px", marginRight: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>Valider</button>
                            <button onClick={() => promptComment("refuse", a.id)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "6px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>Refuser</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de détail améliorée */}
        {selected && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }} onClick={closeDetail}>
            <div style={{ background: "white", borderRadius: "24px", maxWidth: "650px", width: "95%", maxHeight: "85vh", overflowY: "auto", padding: "28px", boxShadow: "0 20px 35px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #eef2ff", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "20px", color: "#1e293b" }}>Détail de l'absence #{selected.id}</h3>
                <button onClick={closeDetail} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <InfoRow label="Étudiant" value={selected.nom} />
                <InfoRow label="Email" value={selected.email} />
                <InfoRow label="Date début" value={new Date(selected.start_date).toLocaleDateString("fr-FR")} />
                <InfoRow label="Date fin" value={new Date(selected.end_date).toLocaleDateString("fr-FR")} />
                <InfoRow label="Durée" value={`${Math.ceil((new Date(selected.end_date) - new Date(selected.start_date)) / (1000 * 60 * 60 * 24) + 1)} jour(s)`} />
                <InfoRow label="Motif" value={selected.reason || "—"} />
                <InfoRow label="Statut" value={<StatusBadge status={selected.status} />} />
                {selected.agent_comment && <InfoRow label="Commentaire agent" value={selected.agent_comment} />}
              </div>

              {selected.file_path && (
                <div style={{ marginBottom: "24px", padding: "12px", background: "#f8fafc", borderRadius: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>📎 Justificatif</div>
                  <a href={`http://localhost:5000/${selected.file_path}`} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>📄 Ouvrir le document</a>
                </div>
              )}

              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>📜 Historique des statuts</div>
                {logs.length === 0 ? (
                  <div style={{ color: "#94a3b8", fontSize: "13px" }}>Aucun historique</div>
                ) : (
                  <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                    {logs.map((log, i) => (
                      <div key={i} style={{ borderLeft: "3px solid #3b82f6", paddingLeft: "12px", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ fontSize: "13px" }}>
                          <strong>{log.old_status || "—"}</strong> → <strong>{log.new_status}</strong>
                          {log.agent_nom && <span style={{ color: "#64748b" }}> par {log.agent_nom}</span>}
                        </div>
                        {log.comment && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>"{log.comment}"</div>}
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>{new Date(log.changed_at).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!["acceptee", "refusee"].includes(selected.status) && (
                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button onClick={() => promptComment("validate", selected.id)} style={{ flex: 1, background: "#10b981", color: "white", border: "none", padding: "10px", borderRadius: "12px", fontWeight: "600", cursor: "pointer" }}>✔ Valider l'absence</button>
                  <button onClick={() => promptComment("refuse", selected.id)} style={{ flex: 1, background: "#ef4444", color: "white", border: "none", padding: "10px", borderRadius: "12px", fontWeight: "600", cursor: "pointer" }}>❌ Refuser l'absence</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Composant auxiliaire
const InfoRow = ({ label, value }) => (
  <div style={{ fontSize: "14px" }}>
    <span style={{ color: "#64748b", display: "block", fontSize: "12px" }}>{label}</span>
    <span style={{ fontWeight: "500", color: "#0f172a" }}>{value}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    en_attente: { bg: "#dbeafe", color: "#1e40af", label: "en attente" },
    en_cours: { bg: "#fed7aa", color: "#9a3412", label: "en cours" },
    acceptee: { bg: "#d1fae5", color: "#065f46", label: "acceptée" },
    refusee: { bg: "#fee2e2", color: "#991b1b", label: "refusée" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#475569", label: status || "en attente" };
  return <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>{s.label}</span>;
};