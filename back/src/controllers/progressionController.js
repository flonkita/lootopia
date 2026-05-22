const prisma = require("../config/db"); // Ton instance Prisma globale

exports.completeHunt = async (req, res) => {
  const { huntId } = req.body;
  const userId = req.user.id;

  try {
    // 🎯 RECONVERSION CRUCIALE : On transforme le texte "17" en nombre 17
    const cleanHuntId = parseInt(huntId, 10);

    if (isNaN(cleanHuntId)) {
      return res
        .status(400)
        .json({ message: "❌ L'ID de la chasse est invalide." });
    }

    // 1. On utilise le nombre propre pour chercher dans Prisma
    const hunt = await prisma.hunt.findUnique({
      where: { id: cleanHuntId }, // ✅ C'est maintenant un Int, Prisma va adorer !
    });

    if (!hunt) {
      return res
        .status(404)
        .json({ message: "❌ Chasse au trésor introuvable." });
    }

    const xpReward = hunt.difficulty * 100;

    // 2. Mise à jour de l'utilisateur dans PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: xpReward,
        },
        completedHunts: {
          increment: 1,
        },
      },
    });

    console.log(
      `💰 [GAMIFICATION] ${updatedUser.username} gagne ${xpReward} XP !`,
    );

    return res.status(200).json({
      success: true,
      message: `🏴‍☠️ Butin empoché ! +${xpReward} XP`,
      xpReward: xpReward, // 🆕 ÉTAPE CRUCIALE : On passe la récompense brute au Front !
      nextXp: updatedUser.xp,
      huntTitle: hunt.title,
    });
  } catch (error) {
    console.error("Erreur lors de la validation de la chasse :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
