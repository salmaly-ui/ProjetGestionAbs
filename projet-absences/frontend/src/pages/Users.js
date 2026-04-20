import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre]   = useState("");
  const [form, setForm]       = useState({ nom: "", email: "", password: "", role: "etudiant" });
  const [erreur, setErreur]   = useState("");
  const [succes, setSucces]   = useState("");
  const [showForm, setShowForm] = useState(false);

  const charger = () => {
    setLoading(true);
    API.get("/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const ajouter = async () => {
    setErreur(""); setSucces("");
    if (!form.nom || !form.email || !form.password)
      return setErreur("Tous les champs sont obligatoires");

    try {
      await API.post("/auth/register", form);
      setSucces("Utilisateur créé avec succès");
      setForm({ nom: "", email: "", password: "", role: "etudiant" });
      setShowForm(false);
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de la création");
    }
  };

  const supprimer = async (id, nom) => {
    if (!window.confirm(`Supprimer ${nom} ?`)) return;
    try {
      await API.delete(`/users/${id}`);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur suppression");
    }
  };

  const usersFiltres = filtre
    ? users.filter(u => u.role === filtre)
    : users;

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      {/* ── En-tête ───────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#1a3a5c", margin: 0 }}>Gestion des utilisateurs</h2>
        <button onClick={() => { setShowForm(!showForm); setErreur(""); setSucces(""); }} style={btnBlue}>
          {showForm ? "Annuler" : "+ Ajouter un utilisateur"}
        </button>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      {succes && <div style={{ ...alert, background: "#ECFDF5", color: "#065F46", borderColor: "#6EE7B7" }}>{succes}</div>}
      {erreur && <div style={{ ...alert, background: "#FEF2F2", color: "#B91C1C", borderColor: "#FCA5A5" }}>{erreur}</div>}

      {/* ── Formulaire d'ajout ────────────────────────────────────────────── */}
      {showForm && (
        <div style={{ ...card, marginBottom: "20px" }}>
          <h3 style={cardTitle}>Nouvel utilisateur</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <div>
              <label style={lbl}>Nom complet</label>
              <input style={inp} placeholder="Sara Benali" value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" placeholder="sara@test.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Mot de passe</label>
              <input style={inp} type="password" placeholder="••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Rôle</label>
              <select style={inp} value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="etudiant">Étudiant</option>
                <option value="agent">Agent scolarité</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button onClick={ajouter} style={btnBlue}>Créer le compte</button>
        </div>
      )}

      {/* ── Filtre par rôle ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["", "etudiant", "agent", "admin"].map(r => (
          <button key={r} onClick={() => setFiltre(r)} style={{
            padding: "6px 14px", borderRadius: "20px", fontSize: "13px", cursor: "pointer",
            border: "1px solid #D1D5DB", fontWeight: filtre === r ? 700 : 400,
            background: filtre === r ? "#1a3a5c" : "#fff",
            color: filtre === r ? "#fff" : "#374151"
          }}>
            {r === "" ? `Tous (${users.length})` :
             r === "etudiant" ? `Étudiants (${users.filter(u => u.role === "etudiant").length})` :
             r === "agent"    ? `Agents (${users.filter(u => u.role === "agent").length})` :
             `Admins (${users.filter(u => u.role === "admin").length})`}
          </button>
        ))}
      </div>

      {/* ── Tableau ───────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: "30px", textAlign: "center", color: "#9CA3AF" }}>Chargement...</p>
        ) : usersFiltres.length === 0 ? (
          <p style={{ padding: "30px", textAlign: "center", color: "#9CA3AF" }}>Aucun utilisateur.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F9FAFB" }}>
              <tr>
                <Th>Nom</Th>
                <Th>Email</Th>
                <Th>Rôle</Th>
                <Th>Créé le</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {usersFiltres.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: roleColor(u.role).bg, color: roleColor(u.role).text,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: 700, flexShrink: 0
                      }}>
                        {u.nom.charAt(0).toUpperCase()}
                      </div>
                      {u.nom}
                    </div>
                  </td>
                  <td style={{ ...td, color: "#6B7280" }}>{u.email}</td>
                  <td style={td}><RoleBadge role={u.role} /></td>
                  <td style={{ ...td, color: "#9CA3AF", fontSize: "13px" }}>
                    {new Date(u.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => supprimer(u.id, u.nom)}
                      style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5", borderRadius: "6px", padding: "4px 12px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const map = {
    etudiant: { bg: "#EFF6FF", color: "#1D4ED8" },
    agent:    { bg: "#F3E8FF", color: "#6B21A8" },
    admin:    { bg: "#FEF2F2", color: "#B91C1C" },
  };
  const s = map[role] || { bg: "#F3F4F6", color: "#374151" };
  return (
    <span style={{ ...s, padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
      {role}
    </span>
  );
}

function roleColor(role) {
  if (role === "admin")    return { bg: "#FEF2F2", text: "#B91C1C" };
  if (role === "agent")    return { bg: "#F3E8FF", text: "#6B21A8" };
  return { bg: "#EFF6FF", text: "#1D4ED8" };
}

function Th({ children }) {
  return <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".05em" }}>{children}</th>;
}

const card      = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "20px" };
const cardTitle = { fontSize: "15px", fontWeight: "700", color: "#1a3a5c", margin: "0 0 16px" };
const lbl       = { display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" };
const inp       = { width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "14px", boxSizing: "border-box" };
const td        = { padding: "12px 16px", fontSize: "14px", color: "#374151" };
const btnBlue   = { background: "#1a3a5c", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" };
const alert     = { padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid" };