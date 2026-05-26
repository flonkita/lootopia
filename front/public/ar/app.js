// 🏴‍☠️ 1. Récupération de l'ID de la chasse et du Token JWT
const urlParams = new URLSearchParams(window.location.search);
const huntId = urlParams.get("huntId");
const token = localStorage.getItem("token"); // 🔑 Récupère le token de connexion de Lootopia

console.log("🏴‍☠️ Chasse active récupérée en RA :", huntId);

const SELECTORS = {
  menu: "#menu",
  launchBtn: "#launch-btn",
  arView: "#ar-view",
  backBtn: "#back-btn",
  status: "#status",
  treasure: "#treasure-box",
  winScreen: "#win-screen",
  playAgainBtn: "#play-again-btn",
  video: "#camera-video",
};

const STATE = {
  videoStream: null,
  treasureDistance: 3,
  statusText: {
    find: "🔍 Tourne-toi pour trouver le trésor !",
    found: "🎉 Trésor trouvé !",
  },
  isSubmitting: false, // 🔒 Notre nouveau verrou de sécurité
};

async function init() {
  console.log("🎬 Initialisation du module RA...");

  // 🛡️ RADAR DE SÉCURITÉ : On teste les permissions avant qu'AR.js ne se lance
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        console.log("✅ Caméra activée avec succès !");
        // Optionnel : Si tu stockes le flux dans ton STATE
        STATE.videoStream = stream;
      })
      .catch((err) => {
        console.error("❌ Erreur de caméra :", err);

        // On affiche le message d'erreur rouge bien visible sur l'écran du téléphone
        // Assure-toi que "dom.statusDisplay" ou ton élément de texte existe bien
        const statusElement =
          document.querySelector("#status-text") || dom?.statusDisplay;
        if (statusElement) {
          statusElement.innerHTML =
            "❌ Erreur : L'accès à la caméra est requis pour la Réalité Augmentée !";
          statusElement.style.color = "#ef4444"; // Un beau rouge alerte
        }
      });
  } else {
    console.error(
      "❌ Les API MediaDevices ne sont pas supportées sur ce navigateur.",
    );
  }

  // ... Le reste de ton code d'initialisation de la scène AR ...
}

// Lancement au chargement
window.onload = init;

const dom = {};

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

function stopCamera() {
  if (!STATE.videoStream) {
    return;
  }
  STATE.videoStream.getTracks().forEach((track) => track.stop());
  STATE.videoStream = null;
  dom.video.srcObject = null;
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
  dom.video.srcObject = stream;
}

// ... (startAR reste inchangé)
function startAR() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("❌ Votre appareil ne prend pas en charge la caméra.");
    return;
  }

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      initializeCamera(stream);
      placeTreasure();
      activateAR();
    })
    .catch(() => {
      alert("❌ Accès à la caméra refusé");
    });
}

// 🎯 AJUSTEMENT ÉPIC 5 : Envoi de l'XP au clic sur le coffre
async function handleTreasureClick() {
  // 🛡️ Si on est déjà en train d'envoyer la progression, on ignore complètement les autres clics
  if (STATE.isSubmitting) return;

  // Activer le verrou immédiatement
  STATE.isSubmitting = true;

  // On affiche l'écran de victoire par-dessus la caméra active
  showWinScreen();

  if (!huntId || !token) {
    STATE.isSubmitting = false; // On libère le verrou si erreur de config
    return;
  }
  // 1. On fige l'écran et on coupe la caméra
  showWinScreen();

  if (!huntId || !token) return;

  try {
    const response = await fetch(
      "http://10.111.0.103:1234/api/progression/complete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ huntId: huntId }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      console.log("🏆 Réponse Backend :", data.message);
      // Optionnel : Tu peux mettre à jour un texte dans ton winScreen pour afficher l'XP gagnée !
      dom.winScreen.querySelector("p").innerHTML =
        `Félicitations ! Tu as déterré le coffre et <span style="color: #4ade80; font-weight: bold;">gagné ${data.xpReward} XP</span> !`;
    } else {
      console.error("❌ Erreur lors de l'attribution d'XP :", data.message);
    }
  } catch (error) {
    console.error(
      "❌ Impossible de joindre le serveur de progression :",
      error,
    );
  }
}

function handleBackToMenu() {
  stopCamera();
  deactivateAR();
}

function bindEvents() {
  dom.launchBtn.addEventListener("click", startAR);
  dom.backBtn.addEventListener("click", handleBackToMenu);
  dom.treasure.addEventListener("click", handleTreasureClick);
}

function init() {
  Object.keys(SELECTORS).forEach((key) => {
    dom[key] = query(SELECTORS[key]);
  });

  bindEvents();
}

window.addEventListener("DOMContentLoaded", init);
