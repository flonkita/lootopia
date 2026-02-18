# 🏴‍☠️ Lootopia

Bienvenue sur le dépôt de **Lootopia**, l'application web de chasse au trésor géolocalisée ! 🗺️📍

## 🛠️ Stack Technique

- **Frontend** : Next.js (App Router), React, Tailwind CSS, Leaflet (Cartographie), AR.js (Réalité Augmentée)
- **Backend** : Node.js, Express, Axios
- **Base de données** : PostgreSQL (via Docker) & Prisma ORM
- **Outils de dev** : Concurrently, Nodemon

## ⚙️ Prérequis

Avant de monter dans le navire, assure-toi d'avoir installé :
1. [Node.js](https://nodejs.org/) (version 18+ recommandée)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (doit être en cours d'exécution en arrière-plan)
3. Git

## 🚀 Installation & Démarrage rapide

Nous avons mis en place un super-script pour tout lancer en une seule commande ! 

**1. Cloner le projet et installer les dépendances globales :**

```bash
git clone [https://github.com/flonkita/lootopia.git](https://github.com/flonkita/lootopia.git)
cd lootopia
npm install
```

**2. Installer les dépendances du Front et du Back :**

```bash
cd front && npm install
cd ../back && npm install
cd ..
```

**3. Configurer les variables d'environnement :**

- Il faut un fichier .env dans le dossier /front

- Il faut un fichier .env dans le dossier /back

**4. Lancer l'application :**
Lancer à la racine du projet :
```bash
npm run dev
```
**Magie du script** npm run dev : > Cette commande lance simultanément le Frontend (Next.js sur le port 3000), le Backend (Nodemon sur le port 1234), la Base de données (Docker Container) et l'interface Prisma Studio (port 5555). Tout est coloré dans le terminal pour que ce soit lisible !

## 📂 Structure du projet
- **/front** : L'interface utilisateur (Next.js). Contient la carte Leaflet et les pages de connexion/dashboard.
- **/back** : L'API (Express). Gère l'authentification (JWT), la logique des quêtes et la communication avec la base de données.
- **/back/prisma** : Schéma de la base de données et migrations.

## ✅ Fonctionnalités Actuelles (MVP)
[x] Connexion & Authentification JWT.

[x] Dashboard Utilisateur sécurisé.

[x] Affichage d'une carte interactive (Leaflet) avec les points de quête.

[ ] Géolocalisation en temps réel (En cours 🚧).

---

Fait avec passion, patience, et quelques crashs de PC évités de justesse. 💻🔥