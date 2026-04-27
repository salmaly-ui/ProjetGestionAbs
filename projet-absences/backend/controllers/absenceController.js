const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── Configuration upload ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/justificatifs";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `justif_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Type de fichier non autorisé"));
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── CREATE ABSENCE (étape 1) ────────────────────────────────────
exports.createAbsence = (req, res) => {
  const studentId = req.user?.id;
  if (!studentId) return res.status(401).json({ message: "Non authentifié" });

  const { start_date, end_date, reason } = req.body;

  if (!start_date || !end_date)
    return res.status(400).json({ message: "Dates obligatoires" });

  const start = new Date(start_date);
  const end = new Date(end_date);

  if (start > end)
    return res.status(400).json({ message: "La date de début doit être ≤ date de fin" });

  db.query(
    `INSERT INTO medical_absences (student_id, start_date, end_date, reason, status)
     VALUES (?, ?, ?, ?, 'en_attente')`,
    [studentId, start_date, end_date, reason || ""],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", error: err });

      const absenceId = result.insertId;

      // Log initial
      db.query(
        `INSERT INTO absence_status_logs (absence_id, changed_by, old_status, new_status, comment)
         VALUES (?, ?, NULL, 'en_attente', 'Demande créée')`,
        [absenceId, studentId]
      );

      // Si un fichier a été joint directement (multipart), on l'enregistre
      if (req.file) {
        const filePath = req.file.path.replace(/\\/g, "/");
        db.query(
          `INSERT INTO documents (absence_id, file_path, file_type) VALUES (?, ?, ?)`,
          [absenceId, filePath, req.file.mimetype],
          (err2) => { if (err2) console.error("❌ Erreur document:", err2); }
        );
      }

      res.status(201).json({ message: "Absence soumise avec succès", absence_id: absenceId });
    }
  );
};

// ─── UPLOAD DOCUMENT SÉPARÉ (étape 2) ────────────────────────────
exports.uploadDocument = (req, res) => {
  const absenceId = req.params.id;

  if (!req.file)
    return res.status(400).json({ message: "Aucun fichier reçu" });

  const filePath = req.file.path.replace(/\\/g, "/");

  db.query(
    `INSERT INTO documents (absence_id, file_path, file_type) VALUES (?, ?, ?)`,
    [absenceId, filePath, req.file.mimetype],
    (err) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
      res.status(201).json({ message: "Document uploadé", file_path: filePath });
    }
  );
};

// ─── MES ABSENCES (étudiant) ─────────────────────────────────────
exports.getMesAbsences = (req, res) => {
  const studentId = req.user?.id;

  db.query(
    `SELECT ma.*, d.file_path, d.file_type
     FROM medical_absences ma
     LEFT JOIN documents d ON d.absence_id = ma.id
     WHERE ma.student_id = ?
     ORDER BY ma.created_at DESC`,
    [studentId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      res.json(results);
    }
  );
};

// ─── LISTE COMPLÈTE (admin/agent) ────────────────────────────────
exports.getAbsences = (req, res) => {
  db.query(
    `SELECT ma.*, u.nom, u.email, d.file_path, d.file_type
     FROM medical_absences ma
     JOIN users u ON ma.student_id = u.id
     LEFT JOIN documents d ON d.absence_id = ma.id
     ORDER BY ma.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
      res.json(results);
    }
  );
};

// ─── VALIDER (avec vérification justificatif obligatoire) ────────
exports.validate = (req, res) => {
  const { id, comment } = req.body;
  const agentId = req.user?.id;

  db.query(
    `SELECT ma.status, d.id AS doc_id
     FROM medical_absences ma
     LEFT JOIN documents d ON d.absence_id = ma.id
     WHERE ma.id = ?`,
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
      if (rows.length === 0)
        return res.status(404).json({ message: "Absence introuvable" });
      if (!rows[0].doc_id)
        return res.status(400).json({ message: "Justificatif obligatoire avant validation" });
      if (["acceptee", "refusee"].includes(rows[0].status))
        return res.status(400).json({ message: "Déjà traitée" });

      db.query(
        `UPDATE medical_absences SET status='acceptee', agent_comment=? WHERE id=?`,
        [comment, id],
        (err2) => {
          if (err2) return res.status(500).json({ message: "Erreur mise à jour" });
          db.query(
            `INSERT INTO absence_status_logs (absence_id, changed_by, old_status, new_status, comment)
             VALUES (?, ?, ?, 'acceptee', ?)`,
            [id, agentId, rows[0].status, comment],
            (err3) => {
              if (err3) console.error("Erreur log:", err3);
              res.json({ message: "Absence validée" });
            }
          );
        }
      );
    }
  );
};

// ─── REFUSER (avec vérification justificatif obligatoire) ────────
exports.refuse = (req, res) => {
  const { id, comment } = req.body;
  const agentId = req.user?.id;

  db.query(
    `SELECT ma.status, d.id AS doc_id
     FROM medical_absences ma
     LEFT JOIN documents d ON d.absence_id = ma.id
     WHERE ma.id = ?`,
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
      if (rows.length === 0)
        return res.status(404).json({ message: "Absence introuvable" });
      if (!rows[0].doc_id)
        return res.status(400).json({ message: "Justificatif obligatoire avant refus" });
      if (["acceptee", "refusee"].includes(rows[0].status))
        return res.status(400).json({ message: "Déjà traitée" });

      db.query(
        `UPDATE medical_absences SET status='refusee', agent_comment=? WHERE id=?`,
        [comment, id],
        (err2) => {
          if (err2) return res.status(500).json({ message: "Erreur mise à jour" });
          db.query(
            `INSERT INTO absence_status_logs (absence_id, changed_by, old_status, new_status, comment)
             VALUES (?, ?, ?, 'refusee', ?)`,
            [id, agentId, rows[0].status, comment],
            (err3) => {
              if (err3) console.error("Erreur log:", err3);
              res.json({ message: "Absence refusée" });
            }
          );
        }
      );
    }
  );
};

// ─── PASSER EN COURS ─────────────────────────────────────────────
exports.encours = (req, res) => {
  const { id } = req.body;
  db.query(
    `UPDATE medical_absences SET status='en_cours' WHERE id=? AND status IN ('en_attente','soumise')`,
    [id],
    (err) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      res.json({ message: "Statut mis à jour" });
    }
  );
};

// ─── HISTORIQUE DES STATUTS ──────────────────────────────────────
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