const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient(); // Utilise le client classique autonome pour le seed

async function main() {
  console.log("🧼 Nettoyage des anciennes données de test...");
  // On vide dans l'ordre pour respecter les contraintes de clés étrangères
  await prisma.step.deleteMany({});
  await prisma.hunt.deleteMany({});
  // Optionnel : on nettoie l'utilisateur de test s'il existe pour éviter les doublons d'email
  await prisma.user.deleteMany({ where: { email: "florent@lootopia.fr" } });

  console.log("🤠 Création du profil du Capitaine...");
  // On crée l'utilisateur créateur des chasses
  const creatorUser = await prisma.user.create({
    data: {
      username: "Florent",
      email: "florent@lootopia.fr",
      password: "password123", // Un mot de passe fictif pour le test
    },
  });

  console.log("⛏️ Génération des parcours Lootopia pour la soutenance...");

  // ----------------------------------------------------------------------
  // 🗺️ PARCOURS 1 : SPECIAL DÉMO JURY (Ajusté sur tes coordonnées réelles)
  // ----------------------------------------------------------------------
  const demoHunt = await prisma.hunt.create({
    data: {
      title: "L'Épreuve du Tech-Pirate",
      description:
        "Une quête d'initiation conçue spécialement pour prouver la puissance de l'US10 et de la Réalité Augmentée devant les amiraux du jury.",
      difficulty: 1,
      city: "Bordeaux",
      // 🎯 Coordonnées exactes de Sup de Vinci au 84 Cours de la Martinique
      startLat: 44.8543744,
      startLng: -0.5726475,
      status: "publie",
      creator: {
        connect: { id: creatorUser.id },
      },
      steps: {
        create: [
          {
            title: "Le Coffre du Labo",
            description:
              "Le capteur Haversine capte un signal à quelques pas... Regarde autour de toi, fais fondre les oignons à feu très doux et déterre le butin final !",
            // 🎯 Micro-décalage de quelques mètres pour simuler une recherche dans la pièce
            latitude: 44.8544,
            longitude: -0.57265,
            order: 1,
          },
        ],
      },
    },
  });

  // ----------------------------------------------------------------------
  // 🗺️ PARCOURS 2 : LE TRÉSOR DES CHARTRONS (Vrai parcours extérieur)
  // ----------------------------------------------------------------------
  const realHunt = await prisma.hunt.create({
    data: {
      title: "Les Secrets du Port de la Lune",
      description:
        "Pars à l'aventure le long de la Garonne ! Une véritable expédition des Chartrons jusqu'aux Bassins à Flot pour retrouver les pièces d'or perdues de Lootopia.",
      difficulty: 3,
      city: "Bordeaux",
      startLat: 44.8522,
      startLng: -0.5734,
      status: "publie",
      // ✅ RESOLUTION : Idem ici
      creator: {
        connect: { id: creatorUser.id },
      },
      steps: {
        create: [
          {
            title: "Le Hangar des Skateurs",
            description:
              "Là où les planches de bois défient les lois de la gravité le long du quai, cherche le trésor caché près du grand rail en métal.",
            latitude: 44.8572,
            longitude: -0.5678,
            order: 1,
          },
          {
            title: "La Cache de la Halle",
            description:
              "Sous la structure historique où les marchands d'antan criaient leur cargaison, le coffre en RA est enfoui sous les pavés centraux !",
            latitude: 44.8545,
            longitude: -0.5752,
            order: 2,
          },
        ],
      },
    },
  });

  console.log("🚀 Base de données injectée avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
