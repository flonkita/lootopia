const { PrismaClient } = require("@prisma/client");

// On instancie Prisma
const prisma = new PrismaClient();

// On l'exporte pour l'utiliser dans les contrôleurs
module.exports = prisma;
