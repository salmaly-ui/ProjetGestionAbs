const express = require("express");
const router = express.Router();
const controller = require("../controllers/absenceController");
const { verifyToken } = require("../middleware/authMiddleware");

// ─── Routes MOBILE (étudiant) ─────────────────────────────────────
router.get("/mes-absences", verifyToken, controller.getMesAbsences);

router.post("/", verifyToken, controller.upload.single("justificatif"), controller.createAbsence);

// ─── Routes WEB (admin / agent) ───────────────────────────────────
router.get("/", verifyToken, controller.getAbsences);

router.post("/validate", verifyToken, controller.validate);

router.post("/refuse", verifyToken, controller.refuse);

router.get("/:id/logs", verifyToken, controller.getLogs);

router.post("/encours", verifyToken, controller.encours);

router.post("/:id/document", verifyToken, controller.upload.single("justificatif"), controller.uploadDocument);

module.exports = router;