import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("");
  const [form, setForm] = useState({ nom: "", email: "", password: "", role: "etudiant" });
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, nom: "" });
  const { toast, showToast } = useToast();

  const charger = () => {
    setLoading(true);
    API.get("/users")
      .then(res => setUsers(res.data))
      .catch(() => showToast("Erreur chargement", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const ajouter = async () => {
    setErreur(""); setSucces("");
    if (!form.nom || !form.email || !form.password) return setErreur("Tous les champs sont obligatoires");
    try {
      await API.post("/auth/register", form);
      showToast("Utilisateur créé avec succès", "success");
      setForm({ nom: "", email: "", password: "", role: "etudiant" });
      setShowForm(false);
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur création");
    }
  };

  const demanderSuppression = (id, nom) => setDeleteConfirm({ isOpen: true, id, nom });
  const supprimer = async () => {
    try {
      await API.delete(`/users/${deleteConfirm.id}`);
      showToast("Utilisateur supprimé", "success");
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur suppression", "error");
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, nom: "" });
    }
  };

  const usersFiltres = filtre ? users.filter(u => u.role === filtre) : users;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, nom: "" })}
        onConfirm={supprimer}
        title="Confirmation de suppression"
        message={`Voulez-vous vraiment supprimer ${deleteConfirm.nom} ?`}
      />

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#1e293b" }}>Gestion des utilisateurs</h2>
          <button onClick={() => { setShowForm(!showForm); setErreur(""); setSucces(""); }} style={{ background: "#1e3a8a", color: "white", border: "none", padding: "10px 20px", borderRadius: "12px", cursor: "pointer" }}>{showForm ? "Annuler" : "+ Ajouter"}</button>
        </div>

        {showForm && (
          <div style={{ background: "white", borderRadius: "20px", padding: "20px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "16px" }}>Nouvel utilisateur</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <input placeholder="Nom complet" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} style={{ padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              <input type="password" placeholder="Mot de passe" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0" }}><option value="etudiant">Étudiant</option><option value="agent">Agent</option><option value="admin">Admin</option></select>
            </div>
            {erreur && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "8px", borderRadius: "12px", marginTop: "12px" }}>{erreur}</div>}
            <button onClick={ajouter} style={{ marginTop: "16px", background: "#10b981", color: "white", border: "none", padding: "10px", borderRadius: "12px", cursor: "pointer" }}>Créer</button>
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          {["", "etudiant", "agent", "admin"].map(r => (
            <button key={r} onClick={() => setFiltre(r)} style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid #cbd5e1", background: filtre === r ? "#1e3a8a" : "white", color: filtre === r ? "white" : "#1e293b", cursor: "pointer" }}>{r === "" ? "Tous" : r === "etudiant" ? "Étudiants" : r === "agent" ? "Agents" : "Admins"} ({users.filter(u => r === "" ? true : u.role === r).length})</button>
          ))}
        </div>

        <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}><tr><th style={{ padding: "12px", textAlign: "left" }}>Nom</th><th style={{ padding: "12px", textAlign: "left" }}>Email</th><th style={{ padding: "12px", textAlign: "left" }}>Rôle</th><th style={{ padding: "12px", textAlign: "left" }}>Créé le</th><th></th></tr></thead>
              <tbody>
                {usersFiltres.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px" }}>{u.nom}</td>
                    <td style={{ padding: "12px" }}>{u.email}</td>
                    <td style={{ padding: "12px" }}><span style={{ background: u.role === "admin" ? "#fee2e2" : u.role === "agent" ? "#f3e8ff" : "#dbeafe", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>{u.role}</span></td>
                    <td style={{ padding: "12px" }}>{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                    <td style={{ padding: "12px" }}><button onClick={() => demanderSuppression(u.id, u.nom)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "4px 10px", borderRadius: "8px", cursor: "pointer" }}>Supprimer</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}