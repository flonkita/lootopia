const prisma = require("../config/db"); // Ton instance Prisma globale

// Fonction d'aide mathématique Haversine côté serveur
function getBackendDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance en mètres
}

exports.completeHunt = async (req, res) => {
  const { huntId, userLat, userLng } = req.body; // 🗺️ Reçu du smartphone
  const userId = req.user.id;

  try {
    // 🎯 1. Validation et conversion de l'ID
    const cleanHuntId = parseInt(huntId, 10);
    if (isNaN(cleanHuntId)) {
      return res
        .status(400)
        .json({ message: "❌ L'ID de la chasse est invalide." });
    }

    // 🔍 2. Recherche de la quête en BDD
    const hunt = await prisma.hunt.findUnique({ where: { id: cleanHuntId } });
    if (!hunt) {
      return res
        .status(404)
        .json({ message: "❌ Chasse au trésor introuvable." });
    }

    // 🛡️ 3. DOUBLE VÉRIFICATION GÉOGRAPHIQUE (ANTI-CHEAT)
    if (userLat && userLng) {
      const distance = getBackendDistance(
        userLat,
        userLng,
        hunt.latitude,
        hunt.longitude,
      );
      if (distance > 50) {
        console.warn(
          `🚨 [TRICHE] L'utilisateur ${userId} a tenté de valider à ${Math.round(distance)}m !`,
        );
        return res
          .status(403)
          .json({
            message:
              "❌ Flibustier ! Tu es trop loin du trésor pour l'empocher.",
          });
      }
    }

    // 💰 4. Calcul de la récompense et mise à jour PostgreSQL
    const xpReward = hunt.difficulty * 100;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpReward },
        completedHunts: { increment: 1 },
      },
    });

    console.log(
      `💰 [GAMIFICATION] ${updatedUser.username} gagne ${xpReward} XP !`,
    );

    return res.status(200).json({
      success: true,
      message: `🏴‍☠️ Butin empoché ! +${xpReward} XP`,
      xpReward: xpReward,
      nextXp: updatedUser.xp,
      huntTitle: hunt.title,
    });
  } catch (error) {
    console.error("Erreur lors de la validation de la chasse :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
