const prisma = require("../config/db");

exports.uploadAvatar = async (req, res) => {
  try {
    // 1. La Douane : vérifier si Multer a bien attrapé un fichier
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Aucune image n'a été trouvée dans la cale." });
    }

    // 2. L'Identité : récupérer l'ID du joueur connecté
    const userId = req.user.id;

    // 3. Le Chemin : préparer l'URL publique de l'image
    const avatarUrl = `/uploads/${req.file.filename}`;

    // 4. Prisma : mettre à jour le joueur dans la base de données
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { avatar: avatarUrl },
    });

    // 5. La Victoire : renvoyer la nouvelle URL au front-end
    res.status(200).json({
      message: "Avatar mis à jour avec succès ! 🏴‍☠️",
      avatarUrl: updatedUser.avatar,
    });
  } catch (error) {
    console.error(
      "🔥 Erreur lors de la sauvegarde de l'avatar :",
      error.message,
    );
    res.status(500).json({
      message: "Le serveur a rencontré une tempête lors de l'upload.",
    });
  }
};
