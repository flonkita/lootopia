// 🏴‍☠️ 1. Récupération de l'ID de la chasse depuis l'URL de Next.js
const urlParams = new URLSearchParams(window.location.search);
const huntId = urlParams.get("huntId");

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
};

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

// 🎯 AJUSTEMENT US10 & EPIC 5 : Le clic sur le coffre
function handleTreasureClick() {
  stopCamera(); // On coupe le flux caméra dès qu'on a trouvé pour économiser la batterie
  showWinScreen();

  // TO DO POUR L'ÉPIC 5 :
  // C'est ici qu'on va déclencher un fetch() vers ton API Express
  // pour dire : "L'utilisateur connecté a fini la chasse 'huntId', donne-lui ses XP !"
}

function handleBackToMenu() {
  stopCamera();
  deactivateAR();
}

function bindEvents() {
  dom.launchBtn.addEventListener("click", startAR);
  dom.backBtn.addEventListener("click", handleBackToMenu);

  // ✅ MODIFICATION : On retire l'écouteur du playAgainBtn pour laisser le 'onclick' HTML de redirection faire son travail !
  dom.treasure.addEventListener("click", handleTreasureClick);
}

function init() {
  Object.keys(SELECTORS).forEach((key) => {
    dom[key] = query(SELECTORS[key]);
  });

  bindEvents();
}

window.addEventListener("DOMContentLoaded", init);
