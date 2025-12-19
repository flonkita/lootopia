const express = require("express");
const router = express.Router();
const huntController = require("../controllers/huntController");
const stepController = require("../controllers/stepController");

// Route pour ajouter une étape à une chasse spécifique
router.post("/:huntId/steps", stepController.createStep);

// Définition des routes pour les "Chasses au trésor"
router.get("/", huntController.getAllHunts); // Récupérer toutes les chasses
// router.get("/:id", huntController.getHuntById); // Récupérer une chasse spécifique
router.post("/", huntController.createHunt); // Créer une chasse

module.exports = router;
