# 🏴‍☠️ Lootopia

Bienvenue sur le dépôt de **Lootopia**, l'application web de chasse au trésor géolocalisée et immersive ! 🗺️📍

---

## 🛠️ Stack Technique

| Couche | Technologies |
|---|---|
| **Frontend** | Next.js (App Router), React, Tailwind CSS, Leaflet (Cartographie), AR.js / A-Frame (Réalité Augmentée) |
| **Backend** | Node.js, Express, Axios |
| **Base de données** | PostgreSQL (via Docker) & Prisma ORM |
| **Outils de dev** | Concurrently, Nodemon |

---

## ⚙️ Prérequis

Avant de monter dans le navire, assure-toi d'avoir installé :

- **Node.js** (version 18+ recommandée)
- **Docker Desktop** (doit être en cours d'exécution en arrière-plan)
- **Git**

---

## 🚀 Installation & Démarrage rapide

> Nous avons mis en place un super-script pour tout lancer en une seule commande !

### 1. Cloner le projet et installer les dépendances globales

```bash
git clone https://github.com/flonkita/lootopia.git
cd lootopia
npm install
```

### 2. Installer les dépendances du Front et du Back

```bash
cd front && npm install
cd ../back && npm install
cd ..
```

### 3. Configurer les variables d'environnement

- Crée un fichier `.env` dans le dossier `/front`
- Crée un fichier `.env` dans le dossier `/back`

### 3.5. Synchroniser et Populer la Base de Données

> ⚠️ Si tu viens de pull une mise à jour, applique les nouvelles migrations et injecte les parcours de test :

```bash
cd back
npx prisma migrate dev
npx prisma db seed
cd ..
```

### 4. Lancer l'application

Lance la commande suivante **à la racine du projet** :

```bash
npm run dev
```

> ✨ **Magie du script `npm run dev`** : Cette commande lance simultanément le **Frontend** (Next.js sur le port `3000`), le **Backend** (Nodemon sur le port `1234`), la **Base de données** (Docker Container) et l'interface **Prisma Studio** (port `5555`). Tout est coloré dans le terminal pour que ce soit lisible !

---

## 📂 Structure du projet

```
/
├── front/                  # Interface utilisateur (Next.js)
│   ├── public/ar/          # Module autonome de Réalité Augmentée (AR.js + modèles .glb)
│   └── ...
└── back/                   # API (Express)
    ├── prisma/             # Schéma BDD, migrations et scripts de seeding
    └── ...
```

- **`/front`** : L'interface utilisateur (Next.js). Contient la carte Leaflet et les composants de jeu.
- **`/front/public/ar`** : Le module autonome de Réalité Augmentée (AR.js et modèles 3D `.glb`).
- **`/back`** : L'API (Express). Gère l'authentification (JWT), la logique des quêtes et la communication avec PostgreSQL.
- **`/back/prisma`** : Schéma de la base de données, migrations et scripts de seeding.

---

## 🗺️ Core Gameplay & AR Integration *(Milestone - May 2026)*

La boucle de gameplay principale est entièrement fonctionnelle, optimisée pour le **mobile**, et calibrée pour des tests réels autour du campus **Sup de Vinci Bordeaux (Chartrons)**.

### 🧪 Workflow de Test sur Smartphone (Wi-Fi Local)

1. **Seeding des données** : Assure-toi d'avoir exécuté `npx prisma db seed` dans le dossier `/back`. Cela génère un utilisateur de test et deux parcours *(un parcours réel aux Chartrons et une quête démo ultra-localisée calibrée pile sur le **84 Cours de la Martinique**)*.

2. **Accès Mobile** : Configure tes variables d'environnement front/back avec l'adresse IP locale de ton PC (ex: `http://10.111.0.225:3000`). Connecte ton smartphone sur le même réseau Wi-Fi.

3. **Chasse au Trésor** : Lance *"L'Épreuve du Tech-Pirate"*. Grâce au calcul mathématique de la **formule Haversine**, la distance s'actualise en temps réel. Une fois sous la barre des **50 mètres**, le bouton **⛏️ CREUSER !** s'active, coupant la carte pour ouvrir instantanément l'appareil photo. Trouve le coffre en 3D dans la pièce, clique dessus, et empoche ton butin pour revenir au QG !

---

## ✅ Fonctionnalités Actuelles (MVP)

 [x] Connexion & Authentification JWT sécurisée.

 [x] Dashboard Utilisateur complet avec édition de profil.

 [x] **EPIC 2** : Formulaire de création de chasses et système de seeding relationnel (Prisma).

 [x] **EPIC 3** : Affichage cartographique (Leaflet) avec géolocalisation haute précision et suivi GPS en temps réel (`navigator.geolocation.watchPosition`).

 [x] **EPIC 3** : Algorithme de détection de proximité (Haversine) et HUD mobile immersif (React Portal plein écran).

 [x] **EPIC 4** : Transition et affichage d'un coffre au trésor en Réalité Augmentée 3D (AFrame / AR.js) avec bypass des modales de blocage des capteurs mobiles.
 
 [ ] **EPIC 5** : Sauvegarde de fin de quête et attribution automatique de l'XP en BDD *(En cours 🚧)*.

---

> *Fait avec passion, patience, et quelques oignons fondus à feu très doux. 💻🔥*  
> **Onion-driven development rules!**