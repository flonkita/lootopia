const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require("path");

const app = express();

require('dotenv').config();
const port = process.env.PORT || 3000;

// Section des middlewares
app.use(helmet({crossOriginResourcePolicy: { policy: "cross-origin" }})); // Sécurité : On configure Helmet pour autoriser le partage des images avec le port 3000
app.use(cors());   // Autoriser le front
app.use(morgan('dev')); // Logs dans la console
app.use(express.json()); // Pour lire le body des requêtes (req.body)
app.use(express.urlencoded({ extended: true }));


// Import des routes
const huntRoutes = require('./src/routes/huntRoutes');
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");

// Montage des routes (Mounting)
// Toutes les routes d'authRoutes commenceront par /api/auth
app.use('/api/auth', authRoutes);
// Toutes les routes de huntRoutes commenceront par /api/hunts
app.use('/api/hunts', huntRoutes);
// "Toutes les requêtes qui commencent par /api/users
app.use('/api/users', userRoutes);
// Rendre le dossier "uploads" accessible publiquement
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;
