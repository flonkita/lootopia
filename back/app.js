const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

require('dotenv').config();
const port = process.env.PORT || 3000;

// Section des middlewares
app.use(helmet()); // Sécurité
app.use(cors());   // Autoriser le front
app.use(morgan('dev')); // Logs dans la console
app.use(express.json()); // Pour lire le body des requêtes (req.body)
app.use(express.urlencoded({ extended: true }));


// Import des routes
const huntRoutes = require('./src/routes/huntRoutes');

// Montage des routes (Mounting)
// Toutes les routes de huntRoutes commenceront par /api/hunts
app.use('/api/hunts', huntRoutes);

module.exports = app;
