const express = require("express");
const router = express.Router();
const progressionController = require("../controllers/progressionController");

// 1. Import du middleware de sécurité (on l'importe brut pour analyser son type)
const authImport = require("../middlewares/authMiddleware");

// 2. 🧠 Sécurité : On extrait la fonction qu'elle soit exportée par défaut ou nommée
const middleware =
  typeof authImport === "function" ? authImport : authImport.authMiddleware;

// 🔍 RADAR DE SÉCURITÉ : S'affiche dans ton terminal au démarrage de Nodemon
console.log("🛰️  [LOOTOPIA-DEBUG] Vérification des fonctions de la route :");
console.log("   - Middleware d'authentification :", typeof middleware);
console.log(
  "   - Contrôleur completeHunt :",
  typeof progressionController?.completeHunt,
);

// 3. Validation des arguments avant de les donner à Express pour éviter le crash
if (
  typeof middleware !== "function" ||
  typeof progressionController?.completeHunt !== "function"
) {
  console.error(
    "❌ [ERREUR CRITIQUE] L'un des handlers est indéfini. Vérifie tes exports !",
  );
} else {
  // POST /api/progression/complete
  router.post("/complete", middleware, progressionController.completeHunt);
}

module.exports = router;
