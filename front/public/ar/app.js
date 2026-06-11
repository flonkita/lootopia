// 🏴‍☠️ 1. Récupération des paramètres de navigation et du Token JWT
const urlParams = new URLSearchParams(window.location.search);
const huntId = urlParams.get("huntId");
const token = localStorage.getItem("token");

// 🛰️ URL DYNAMIQUE : On récupère l'URL transmise par Next.js (avec un fallback local au cas où)
const apiUrl = urlParams.get("apiUrl") || "http://localhost:1234";

console.log("🏴‍☠️ Configuration Lootopia AR :");
console.log("- Chasse ID :", huntId);
console.log("- API Connectée sur :", apiUrl);

// 🎯 2. Configuration des sélecteurs du DOM
const SELECTORS = {
  menu: "#menu",
  launchBtn: "#launch-btn",
  arView: "#ar-view",
  backBtn: "#back-btn",
  status: "#status",
  treasure: "#treasure-box",
  winScreen: "#win-screen",
  claimBtn: "#btn-claim", // Le bouton de l'écran de victoire
  video: "#camera-video",
};

// 💾 3. État de l'application (State)
const STATE = {
  videoStream: null,
  treasureDistance: 3,
  statusText: {
    find: "🔍 Tourne-toi pour trouver le trésor !",
    found: "🎉 Trésor trouvé !",
  },
  isSubmitting: false, // 🔒 Notre verrou anti-double clic
};

const dom = {};

// 🛠️ 4. Fonctions Utilitaires d'Affichage
function query(selector) {
  return document.querySelector(selector);
}

function updateStatus(text) {
  dom.status.textContent = text;
}

function getRandomPosition(distance) {
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.sin(angle) * distance,
    y: 0,
    z: -Math.cos(angle) * distance,
  };
}

function placeTreasure() {
  const position = getRandomPosition(STATE.treasureDistance);
  dom.treasure.setAttribute(
    "position",
    `${position.x} ${position.y} ${position.z}`,
  );
  dom.treasure.setAttribute("visible", "true");
}

function showElement(element) {
  element.classList.add("active");
}

function hideElement(element) {
  element.classList.remove("active");
}

function showWinScreen() {
  dom.winScreen.classList.add("show");
  dom.treasure.setAttribute("visible", "false");
  updateStatus(STATE.statusText.found);
}

function hideWinScreen() {
  dom.winScreen.classList.remove("show");
}

// 🎥 5. Gestion de la Caméra et de la Réalité Augmentée
function stopCamera() {
  if (!STATE.videoStream) return;
  STATE.videoStream.getTracks().forEach((track) => track.stop());
  STATE.videoStream = null;
  if (dom.video) dom.video.srcObject = null;
}

function activateAR() {
  dom.menu.style.display = "none";
  showElement(dom.arView);
  updateStatus(STATE.statusText.find);
}

function deactivateAR() {
  hideWinScreen();
  hideElement(dom.arView);
  dom.menu.style.display = "flex";
}

function initializeCamera(stream) {
  STATE.videoStream = stream;
  if (dom.video) dom.video.srcObject = stream;
}

function startAR() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("❌ Votre appareil ne prend pas en charge la caméra.");
    return;
  }

  // Lancement du flux vidéo arrière pour l'expérience RA
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      initializeCamera(stream);
      placeTreasure();
      activateAR();
    })
    .catch((err) => {
      console.error("Accès caméra refusé :", err);
      alert(
        "❌ Accès à la caméra refusé. Autorisation requise pour la Réalité Augmentée.",
      );
    });
}

// 💰 6. EPIC 5 : Envoi des coordonnées GPS et validation du Butin en BDD
async function handleTreasureClick() {
  if (STATE.isSubmitting) return;
  STATE.isSubmitting = true;

  if (!huntId || !token) {
    console.error("Configuration manquante (ID de chasse ou Token absent).");
    STATE.isSubmitting = false;
    return;
  }

  // 1️⃣ On affiche l'écran de victoire
  showWinScreen();
  dom.winScreen.querySelector("p").innerHTML = `⚡ Enregistrement du butin au QG...`;
  
  // 🛡️ SÉCURITÉ : On cache le bouton "Empocher" pour empêcher l'utilisateur de quitter trop vite
  if (dom.claimBtn) {
    dom.claimBtn.style.display = "none";
  }

  // 📡 Capture de la position GPS pour le bouclier anti-triche backend
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Nettoyage de l'adresse API dynamique
      const cleanApiUrl = apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;

      try {
        console.log(`🛰️ Envoi de la validation à : ${cleanApiUrl}/progression/complete`);
        
        const response = await fetch(`${cleanApiUrl}/progression/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            huntId: huntId,
            userLat: userLat,
            userLng: userLng,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("🏆 Butin validé avec succès en base PostgreSQL !", data);
          
          localStorage.setItem("completedHunts", data.nextCompletedHunts || "1");
          
          // 🎉 Le serveur a répondu : on affiche le gain et on affiche ENFIN le bouton de sortie
          dom.winScreen.querySelector("p").innerHTML = 
            `Félicitations ! Tu as déterré le coffre et <span style="color: #4ade80; font-weight: bold;">gagné ${data.xpReward || 100} XP</span> !`;
          
          if (dom.claimBtn) {
            dom.claimBtn.style.display = "inline-block"; // Le joueur peut maintenant cliquer en toute sécurité
          }
        } else {
          console.error("❌ Refus du serveur :", data.message);
          dom.winScreen.querySelector("p").innerHTML = `<span style="color: #ef4444;">❌ Erreur : ${data.message}</span>`;
          STATE.isSubmitting = false;
          if (dom.claimBtn) dom.claimBtn.style.display = "inline-block"; // Permet de repartir en cas de refus
        }
      } catch (error) {
        console.error("❌ Erreur réseau d'API :", error);
        dom.winScreen.querySelector("p").innerHTML = `<span style="color: #ef4444;">❌ Impossible de joindre le serveur de progression.</span>`;
        STATE.isSubmitting = false;
        if (dom.claimBtn) dom.claimBtn.style.display = "inline-block";
      }
    },
    (err) => {
      console.error("❌ Erreur signal GPS :", err);
      alert("⚠️ Signal GPS insuffisant pour valider l'anti-triche. Réactive ta localisation !");
      STATE.isSubmitting = false;
      if (dom.claimBtn) dom.claimBtn.style.display = "inline-block";
    },
    { enableHighAccuracy: true, timeout: 3000 } // Ajout d'un timeout de sécurité de 3 secondes
  );
}

// Cette fonction ne se déclenche QUE si l'utilisateur clique sur le bouton "Empocher"
function handleBackToMenu() {
  stopCamera();
  deactivateAR();
  // On redirige vers la home en forçant le rechargement de la page pour nettoyer le cache Next.js
  window.location.replace("/");
}

// 🪢 7. Événements de branchement
function bindEvents() {
  dom.launchBtn.addEventListener("click", startAR);
  dom.backBtn.addEventListener("click", handleBackToMenu);
  dom.treasure.addEventListener("click", handleTreasureClick);
  dom.claimBtn.addEventListener("click", handleBackToMenu); // Redirection au clic sur "Empocher"
}

// ⚓ 8. L'unique fonction d'initialisation du fichier
function init() {
  Object.keys(SELECTORS).forEach((key) => {
    dom[key] = query(SELECTORS[key]);
  });

  bindEvents();
  console.log("⚓ Module Lootopia AR paré à l'abordage !");
}

// Déclenchement propre au chargement complet du DOM
window.addEventListener("DOMContentLoaded", init);
