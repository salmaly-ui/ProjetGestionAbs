const express = require("express");
const router = express.Router();
const controller = require("../controllers/absenceController");
const { verifyToken } = require("../middleware/authMiddleware");

// ── Routes MOBILE (étudiant) ─────────────────────────────────────

// ⚠️ IMPORTANT : mettre AVANT /:id/logs
router.get("/mes-absences", verifyToken, controller.getMesAbsences);

router.post(
  "/",
  verifyToken,
  controller.upload.single("justificatif"), // champ envoyé depuis Android
  controller.createAbsence
);

// ── Routes WEB (admin / agent) ───────────────────────────────────

router.get("/", verifyToken, controller.getAbsences);

router.post("/validate", verifyToken, controller.validate);

router.post("/refuse", verifyToken, controller.refuse);

router.get("/:id/logs", verifyToken, controller.getLogs);

module.exports = router;