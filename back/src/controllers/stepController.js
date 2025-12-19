// src/controllers/stepController.js
const prisma = require("../config/db");

// Ajouter une étape à une chasse spécifique
exports.createStep = async (req, res) => {
  try {
    const { huntId } = req.params; // On récupère l'ID de la chasse dans l'URL
    const { title, description, latitude, longitude, order } = req.body;

    // Vérif basique
    if (!huntId || !latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Coordonnées GPS et ID chasse requis" });
    }

    const newStep = await prisma.step.create({
      data: {
        title,
        description,
        latitude: parseFloat(latitude), // S'assurer que c'est un décimal
        longitude: parseFloat(longitude),
        order: parseInt(order) || 1, // Par défaut ordre 1
        huntId: parseInt(huntId), // On lie l'étape à la chasse
      },
    });

    res.status(201).json({
      status: "success",
      data: newStep,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de l'étape" });
  }
};
