// src/controllers/huntController.js
const prisma = require("../config/db"); // On importe l'instance Prisma

// 1. Récupérer toutes les chasses (GET /)
exports.getAllHunts = async (req, res) => {
  try {
    const hunts = await prisma.hunt.findMany({
      include: {
        creator: {
          // On veut récupérer le pseudo du créateur
          select: { username: true },
        },
        steps: true, // On veut aussi voir les étapes associées
      },
    });

    res.status(200).json({
      status: "success",
      results: hunts.length,
      data: hunts,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération." });
  }
};

// 2. Créer une chasse (POST /)
exports.createHunt = async (req, res) => {
  try {
    // On récupère les infos envoyées par le Front (ou Postman)
    const { title, description, difficulty, city, creatorId } = req.body;

    // Validation basique
    if (!title || !creatorId) {
      return res
        .status(400)
        .json({ message: "Titre et CreatorId obligatoires" });
    }

    // Création dans la BDD
    const newHunt = await prisma.hunt.create({
      data: {
        title,
        description,
        difficulty: parseInt(difficulty), // On s'assure que c'est un nombre
        city,
        creatorId: parseInt(creatorId), // L'ID doit être un entier
      },
    });

    res.status(201).json({
      status: "success",
      message: "Chasse créée avec succès !",
      data: newHunt,
    });
  } catch (error) {
    console.error("Erreur création:", error);
    res.status(500).json({ message: "Impossible de créer la chasse." });
  }
};
