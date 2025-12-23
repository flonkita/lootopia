// src/controllers/authController.js
const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 📝 US1 - Inscription
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 👇 Validation SIMPLE : Juste la longueur (8 caractères minimum)
    if (password.length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }
    
    // 1. Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    res.status(201).json({
      message: "Inscription réussie !",
      user: { id: newUser.id, username: newUser.username },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'inscription." });
  }
};

// 🔑 US2 - Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    // 2. Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    // 3. Générer le Token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Le token expire dans 24h
    );

    res.status(200).json({
      message: "Connexion réussie",
      token, // C'est ce token que le Front devra stocker
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion." });
  }
};

// 👤 US3 - Profil (Récupérer mes infos)
exports.getMe = async (req, res) => {
  try {
    // req.user est ajouté par le middleware (on le fera juste après)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, createdAt: true }, // On exclut le password
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
