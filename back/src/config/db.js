// src/config/db.js
const { PrismaClient } = require("@prisma/client");

// On charge les variables d'environnement si ce n'est pas déjà fait
// (Assure-toi que dotenv est bien installé : npm install dotenv)
require("dotenv").config();

const prisma = new PrismaClient();

module.exports = prisma;
