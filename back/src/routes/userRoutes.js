const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Tes imports de middlewares
const auth = require("../middlewares/authMiddleware"); // Le fichier qui vérifie ton token JWT
const upload = require("../middlewares/multer-config"); // Notre douane !

// La route PUT pour l'avatar
router.put(
  "/avatar",
  auth,
  upload.single("avatar"),
  userController.uploadAvatar,
);

module.exports = router;
