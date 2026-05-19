const multer = require("multer");
const path = require("path");

// Configuration de la zone de stockage
const storage = multer.diskStorage({
  // Destination : le dossier "uploads" (à créer à la racine du backend)
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  // Nom du fichier : on ajoute la date pour qu'il soit 100% unique
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Sécurité : On n'accepte QUE les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images sont autorisées !"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
