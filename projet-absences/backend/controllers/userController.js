const db = require("../config/db");

// ─── GET /api/users ───────────────────────────────────────────────────────────
// Agent peut voir la liste (pour filtrer les absences par étudiant)
// Admin peut voir et gérer
exports.getUsers = (req, res) => {
  if (req.user.role === "etudiant")
    return res.status(403).json({ message: "Accès interdit" });

  db.query(
    "SELECT id, nom, email, role, created_at FROM users ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
      res.json(results);
    }
  );
};

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
// ADMIN SEULEMENT
exports.deleteUser = (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Seul l'admin peut supprimer un utilisateur" });

  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });

  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ message: "Utilisateur supprimé" });
  });
};