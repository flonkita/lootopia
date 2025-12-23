const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // 1. Récupérer le token dans le header (Authorization: Bearer <token>)
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    // 2. Vérifier la validité du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Ajouter les infos de l'user à la requête pour la suite
    req.user = decoded;

    next(); // Passer au contrôleur suivant
  } catch (error) {
    res.status(400).json({ message: "Token invalide." });
  }
};
