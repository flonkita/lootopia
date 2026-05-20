"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

// Icônes Leaflet personnalisées
const playerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const huntIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// --- 📐 FORMULE MATHÉMATIQUE DE HAVERSINE ---
const getDistanceHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

interface Step {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  order: number;
}

interface Hunt {
  id: number;
  title: string;
  description: string;
  difficulty: number;
  city: string;
  startLat: number;
  startLng: number;
  status: string;
  steps: Step[];
}

function RecenterMap({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

export default function Map() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [playerPos, setPlayerPos] = useState<[number, number] | null>(null);
  const [selectedHunt, setSelectedHunt] = useState<Hunt | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [distanceToTarget, setDistanceToTarget] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("Florent"); // 🤠 Pseudo par défaut pour tes tests mobiles

  // 1️⃣ Chargement des chasses
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/hunts`)
      .then(res => {
        const rawHunts = res.data.data || res.data;
        if (Array.isArray(rawHunts)) {
          const publishedHunts = rawHunts.filter((h: Hunt) => h.status === 'publie');
          setHunts(publishedHunts);
        }
      })
      .catch(err => console.error("Erreur chargement chasses", err));
  }, []);

  // 2️⃣ Chargement du pseudo utilisateur
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        setTimeout(() => setUsername(storedUsername), 0);
      }
    }
  }, []);

  // 3️⃣ Géolocalisation
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPlayerPos([position.coords.latitude, position.coords.longitude]);
      },
      (error) => console.error("Erreur GPS", error),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 4️⃣ Calcul de distance
  useEffect(() => {
    if (!playerPos || !selectedHunt) {
      setTimeout(() => setDistanceToTarget(null), 0);
      return;
    }

    let targetLat = selectedHunt.startLat;
    let targetLng = selectedHunt.startLng;

    if (currentStepIndex !== -1) {
      const currentStep = selectedHunt.steps[currentStepIndex];
      if (currentStep) {
        targetLat = currentStep.latitude;
        targetLng = currentStep.longitude;
      }
    }

    const dist = getDistanceHaversine(playerPos[0], playerPos[1], targetLat, targetLng);
    setTimeout(() => setDistanceToTarget(dist), 0);
  }, [playerPos, selectedHunt, currentStepIndex]);

  const handleStartHunt = (hunt: Hunt) => {
    setSelectedHunt(hunt);
    setCurrentStepIndex(-1);
  };

  const handleCancelHunt = () => {
    if (confirm("🏴‍☠️ Abandonner l'aventure et retourner au port ?")) {
      setSelectedHunt(null);
      setCurrentStepIndex(0);
      setDistanceToTarget(null);
    }
  };

  const handleDig = () => {
    if (distanceToTarget === null) return;

    if (distanceToTarget > 50) {
      alert(`🪓 Rien ici ! Le trésor est encore à ${Math.round(distanceToTarget)} mètres.`);
      return;
    }

    if (currentStepIndex === -1) {
      if (selectedHunt && selectedHunt.steps.length > 0) {
        alert("🏁 Balise de départ validée ! Place aux indices !");
        setCurrentStepIndex(0);
      } else {
        alert("🎉 Tu as atteint le point final !");
        setSelectedHunt(null);
      }
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (selectedHunt && nextIndex < selectedHunt.steps.length) {
      alert(`✨ Étape ${currentStepIndex + 1} validée !`);
      setCurrentStepIndex(nextIndex);
    } else {
      alert("🏆 MILLE SABORDS ! Le coffre final est à toi ! 💰🪙");
      setSelectedHunt(null);
    }
  };

  // 🌍 LE CONTENU DE NOTRE CARTE + SON HUD
  const mapContent = (
    <div className={`w-full overflow-hidden flex flex-col justify-end transition-all duration-300 ${selectedHunt
        ? "fixed top-0 left-0 right-0 bottom-0 h-screen w-screen z-999999 bg-slate-950"
        : "relative h-[65vh] rounded-2xl border border-slate-800 shadow-2xl"
      }`}>
      {/* CARTE */}
      <div className="absolute inset-0 w-full h-full z-10">
        <MapContainer center={[44.8378, -0.5792]} zoom={15} className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {playerPos && (
            <>
              <Marker position={playerPos} icon={playerIcon}>
                <Popup>
                  <div className="text-slate-900 font-bold text-center text-xs">
                    🤠 Navire de : <span className="text-yellow-600 font-black">{username}</span>
                  </div>
                </Popup>
              </Marker>
              <Circle center={playerPos} radius={50} pathOptions={{ color: '#EAB308', fillColor: '#EAB308', fillOpacity: 0.15 }} />
              <RecenterMap position={playerPos} />
            </>
          )}

          {!selectedHunt && hunts.map((hunt) => (
            <Marker key={hunt.id} position={[hunt.startLat, hunt.startLng]} icon={huntIcon}>
              <Popup>
                <div className="text-slate-900 p-1 min-w-[150px]">
                  <h3 className="font-bold text-sm text-amber-700">🏴‍☠️ {hunt.title}</h3>
                  <p className="text-[11px] text-gray-600 my-1 line-clamp-2">{hunt.description}</p>
                  <button
                    onClick={() => handleStartHunt(hunt)}
                    className="w-full mt-1 bg-yellow-500 text-slate-950 font-bold py-1 px-2 rounded text-[11px] cursor-pointer"
                  >
                    Commencer
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {selectedHunt && (
            currentStepIndex === -1 ? (
              <Marker position={[selectedHunt.startLat, selectedHunt.startLng]} icon={huntIcon}>
                <Popup><b>🏁 Départ : {selectedHunt.title}</b></Popup>
              </Marker>
            ) : (
              selectedHunt.steps[currentStepIndex] && (
                <Marker position={[selectedHunt.steps[currentStepIndex].latitude, selectedHunt.steps[currentStepIndex].longitude]} icon={huntIcon}>
                  <Popup><b>📍 Objectif : {selectedHunt.steps[currentStepIndex].title}</b></Popup>
                </Marker>
              )
            )
          )}
        </MapContainer>
      </div>

      {/* INTERFACE JOUEUR (HUD) */}
      {selectedHunt && (
        <div className="relative z-100000 w-full bg-slate-900/95 border-t border-slate-700 text-white rounded-t-2xl p-4 shadow-2xl backdrop-blur-md flex flex-col gap-3 pb-8 max-h-[40vh]">
          <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto opacity-60"></div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-yellow-500 tracking-wider uppercase block">Quête Active 🏴‍☠️</span>
              <h2 className="text-sm font-black text-white tracking-wide truncate">{selectedHunt.title}</h2>
            </div>
            <button onClick={handleCancelHunt} className="bg-red-950/60 hover:bg-red-900 text-red-400 py-1 px-2.5 rounded-xl text-xs font-bold transition-all ml-2">
              ✕ Quitter
            </button>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 overflow-y-auto max-h-[12vh]">
            {currentStepIndex === -1 ? (
              <div>
                <span className="text-[10px] font-bold text-amber-500 block mb-0.5">Objectif initial :</span>
                <p className="text-xs text-gray-300 italic">Rejoins le point de rassemblement global pour débloquer le premier indice.</p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-bold text-blue-400 block mb-0.5">
                  📍 Étape {currentStepIndex + 1}/{selectedHunt.steps.length} : {selectedHunt.steps[currentStepIndex]?.title}
                </span>
                <p className="text-xs text-yellow-100 font-medium leading-relaxed">
                  &ldquo;{selectedHunt.steps[currentStepIndex]?.description || "Ouvre l'œil !"}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800">
            <div className="text-xs flex items-center gap-1 shrink-0">
              <span className="text-gray-400 text-[11px]">📡 Signal :</span>
              {distanceToTarget !== null ? (
                <span className={`font-mono font-bold text-xs ${distanceToTarget <= 50 ? "text-green-400 animate-pulse" : "text-yellow-400"}`}>
                  {Math.round(distanceToTarget)}m
                </span>
              ) : (
                <span className="text-red-400 text-[10px] italic">Recherche...</span>
              )}
            </div>

            <button
              onClick={handleDig}
              disabled={distanceToTarget === null}
              className={`flex-1 font-extrabold py-2 px-3 rounded-xl shadow-lg uppercase tracking-wider text-xs transition-all border ${distanceToTarget !== null && distanceToTarget <= 50
                  ? "bg-green-600 hover:bg-green-500 border-green-400 text-white animate-bounce cursor-pointer"
                  : "bg-slate-800 border-slate-700 text-gray-500 cursor-not-allowed opacity-50"
                }`}
            >
              {distanceToTarget !== null && distanceToTarget <= 50 ? "⛏️ Creuser !" : "❌ Trop loin"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 🚪 PORTAIL : Si une chasse est active, on s'injecte directement dans le <body> pour briser le CSS parent !
  if (selectedHunt && typeof window !== "undefined") {
    return createPortal(mapContent, document.body);
  }

  return mapContent;
}