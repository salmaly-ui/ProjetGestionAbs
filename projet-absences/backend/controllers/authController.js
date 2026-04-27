const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRET_KEY = process.env.JWT_SECRET || "SECRET123";
const SALT_ROUNDS = 10; // coût du hashage

// POST /api/auth/login
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email et mot de passe requis" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
    if (results.length === 0)
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });

    const user = results[0];
    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match)
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur interne" });
    }
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

  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
    if (results.length)
      return res.status(400).json({ message: "Cet email est déjà utilisé" });

    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      db.query(
        "INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)",
        [nom, email, hashedPassword, role || "etudiant"],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
          res.status(201).json({ message: "Utilisateur créé avec succès", id: result.insertId });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors du hachage du mot de passe" });
    }
  });
};