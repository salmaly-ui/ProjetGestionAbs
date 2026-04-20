const db = require("../config/db");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

// ─── Configuration upload fichiers ───────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/justificatifs";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `justif_${Date.now()}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Type de fichier non autorisé"));
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ─── CREATE ABSENCE ─────────────────────────────────────────────
exports.createAbsence = (req, res) => {
  const studentId = req.user?.id;
  if (!studentId) return res.status(401).json({ message: "Non authentifié" });

  const { start_date, end_date, reason } = req.body;

  if (!start_date || !end_date)
    return res.status(400).json({ message: "Dates obligatoires" });

  if (new Date(start_date) > new Date(end_date))
    return res.status(400).json({ message: "Date invalide" });

  db.query(
    `INSERT INTO medical_absences 
     (student_id, start_date, end_date, reason, status)
     VALUES (?, ?, ?, ?, 'en_attente')`,
    [studentId, start_date, end_date, reason || ""],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });

      const absenceId = result.insertId;

      if (req.file) {
        db.query(
          `INSERT INTO documents (absence_id, file_path, file_type)
           VALUES (?, ?, ?)`,
          [absenceId, req.file.path, req.file.mimetype]
        );
      }

      res.status(201).json({
        message: "Absence créée",
        id: absenceId
      });
    }
  );
};

// ─── MES ABSENCES ───────────────────────────────────────────────
exports.getMesAbsences = (req, res) => {
  const studentId = req.user?.id;

  db.query(
    `SELECT * FROM medical_absences 
     WHERE student_id = ? 
     ORDER BY created_at DESC`,
    [studentId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      res.json(results);
    }
  );
};

// ─── LISTE ADMIN ────────────────────────────────────────────────
exports.getAbsences = (req, res) => {
  db.query(
    `SELECT ma.*, u.nom, u.email
     FROM medical_absences ma
     JOIN users u ON ma.student_id = u.id
     ORDER BY ma.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      res.json(results);
    }
  );
};

// ─── VALIDER ────────────────────────────────────────────────────
exports.validate = (req, res) => {
  const { id, comment } = req.body;
  const agentId = req.user?.id;

  db.query("SELECT status FROM medical_absences WHERE id = ?", [id], (err, r) => {
    if (!r.length) return res.status(404).json({ message: "Introuvable" });

    if (["acceptee", "refusee"].includes(r[0].status))
      return res.status(400).json({ message: "Déjà traitée" });

    db.query(
      "UPDATE medical_absences SET status='acceptee', agent_comment=? WHERE id=?",
      [comment, id]
    );

    db.query(
      `INSERT INTO absence_status_logs 
       (absence_id, changed_by, old_status, new_status, comment)
       VALUES (?, ?, ?, 'acceptee', ?)`,
      [id, agentId, r[0].status, comment]
    );

    res.json({ message: "Validée" });
  });
};

// ─── REFUSER ────────────────────────────────────────────────────
exports.refuse = (req, res) => {
  const { id, comment } = req.body;
  const agentId = req.user?.id;

  db.query("SELECT status FROM medical_absences WHERE id = ?", [id], (err, r) => {
    if (!r.length) return res.status(404).json({ message: "Introuvable" });

    if (["acceptee", "refusee"].includes(r[0].status))
      return res.status(400).json({ message: "Déjà traitée" });

    db.query(
      "UPDATE medical_absences SET status='refusee', agent_comment=? WHERE id=?",
      [comment, id]
    );

    db.query(
      `INSERT INTO absence_status_logs 
       (absence_id, changed_by, old_status, new_status, comment)
       VALUES (?, ?, ?, 'refusee', ?)`,
      [id, agentId, r[0].status, comment]
    );

    res.json({ message: "Refusée" });
  });
};

// ─── LOGS ───────────────────────────────────────────────────────
exports.getLogs = (req, res) => {
  db.query(
    `SELECT l.*, u.nom AS agent_nom
     FROM absence_status_logs l
     LEFT JOIN users u ON l.changed_by = u.id
     WHERE l.absence_id = ?
     ORDER BY l.changed_at DESC`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      res.json(results);
    }
  );
};