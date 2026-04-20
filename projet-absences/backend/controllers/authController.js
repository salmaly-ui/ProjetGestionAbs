const db  = require("../config/db");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "SECRET123";

// POST /api/auth/login
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email et mot de passe requis" });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
    if (!results.length)
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });

    const user = results[0];

    if (password !== user.password)
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, role: user.role, nom: user.nom },
      SECRET_KEY,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role }
    });
  });
};

// POST /api/auth/register
exports.register = (req, res) => {
  const { nom, email, password, role } = req.body;

  if (!nom || !email || !password)
    return res.status(400).json({ message: "Nom, email et mot de passe requis" });

  const rolesValides = ["etudiant", "agent", "admin"];
  if (role && !rolesValides.includes(role))
    return res.status(400).json({ message: "Role invalide" });

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
    if (results.length)
      return res.status(400).json({ message: "Cet email est deja utilise" });

    db.query(
      "INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)",
      [nom, email, password, role || "etudiant"],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
        res.status(201).json({ message: "Utilisateur cree avec succes", id: result.insertId });
      }
    );
  });
};