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
  const {
    title,
    description,
    difficulty,
    city,
    status,
    startLat,
    startLng,
    steps,
  } = req.body;

  console.log("🕵️‍♂️ [LOOTOPIA-DEBUG] req.user :", req.user);

  try {
    // 🎯 RECHERCHE TOUT-TERRAIN : On cherche 'id' OU 'userId' pour parer toutes les variantes du middleware
    const rawId = req.user ? req.user.id || req.user.userId : null;
    const creatorId = rawId ? parseInt(rawId, 10) : null;

    if (!creatorId || isNaN(creatorId)) {
      return res.status(401).json({
        message:
          "❌ Action refusée : Identifiant du créateur introuvable dans la session.",
        debugReceivedUser: req.user, // Petit bonus pour t'aider à voir l'objet direct dans le Front si besoin
      });
    }

    // 🚀 Création dans la BDD avec la liaison relationnelle exigée par ton Schéma
    const createdHunt = await prisma.hunt.create({
      data: {
        title,
        description,
        difficulty: parseInt(difficulty, 10) || 1,
        city: city || "Bordeaux",
        startLat: parseFloat(startLat),
        startLng: parseFloat(startLng),
        status: status || "publie",

        // 🔗 Liaison relationnelle connectée à l'ID valide
        creator: {
          connect: { id: creatorId },
        },

        // 🧱 ÉTAPES IMBRIQUÉES
        steps:
          steps && Array.isArray(steps)
            ? {
                create: steps.map((step, index) => ({
                  title: step.title,
                  description: step.description,
                  latitude: parseFloat(step.latitude),
                  longitude: parseFloat(step.longitude),
                  order: index + 1,
                })),
              }
            : undefined,
      },
    });

    console.log(
      `✨ [DATABASE] Nouvelle quête "${title}" créée et liée au créateur ID: ${creatorId}`,
    );
    return res.status(201).json({ success: true, data: createdHunt });
  } catch (error) {
    console.error("🔥 ERREUR CRÉATION PRISMA :", error.message);
    return res
      .status(500)
      .json({
        message:
          "Erreur interne du serveur lors de la création de la quête avec Prisma.",
      });
  }
};