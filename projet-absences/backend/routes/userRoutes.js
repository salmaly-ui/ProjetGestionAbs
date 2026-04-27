const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

// Routes protégées (admin uniquement)
router.get("/", verifyToken, userController.getUsers);
router.delete("/:id", verifyToken, userController.deleteUser);
router.put("/:id", verifyToken, userController.updateUser);

module.exports = router;