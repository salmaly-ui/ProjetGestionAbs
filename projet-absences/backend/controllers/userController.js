const db = require("../config/db");

// Récupérer tous les utilisateurs (admin uniquement)
exports.getUsers = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès interdit, rôle admin requis" });
  }

  db.query(
    "SELECT id, nom, email, role, created_at FROM users ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      res.json(results);
    }
  );
};

// Supprimer un utilisateur (admin uniquement)
exports.deleteUser = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès interdit" });
  }

  const userId = req.params.id;
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
  }

  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json({ message: "Utilisateur supprimé avec succès" });
  });
};

// Modifier un utilisateur (admin uniquement)
exports.updateUser = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès interdit" });
  }

  const userId = req.params.id;
  const { nom, email, role } = req.body;

  db.query(
    "UPDATE users SET nom = ?, email = ?, role = ? WHERE id = ?",
    [nom, email, role, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.json({ message: "Utilisateur mis à jour" });
    }
  );
};