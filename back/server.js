const app = require('./app');

const port = process.env.PORT || 3000;

// Ici, on connectera la BDD avant de lancer le serveur
// db.connect().then(() => { ... })

app.listen(port, () => {
    console.log(`\n🚀 Serveur Lootopia lancé sur http://localhost:${port}`);
    console.log(`⭐️ Environnement: ${process.env.NODE_ENV}`);
});