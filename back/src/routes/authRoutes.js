const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// Routes publiques
router.post("/register", authController.register); // US1
router.post("/login", authController.login); // US2

// Route protégée (Nécessite le token)
router.get("/me", authMiddleware, authController.getMe); // US3

module.exports = router;
