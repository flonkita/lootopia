// components/Map.tsx
"use client"; // Indispensable pour dire à Next que c'est du code navigateur

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
// import { Cossette_Texte } from "next/font/google";

// --- 🛠️ FIX : Hack pour rétablir les icônes par défaut de Leaflet ---
// Sans ça, les marqueurs sont invisibles ou cassés.
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;
// -------------------------------------------------------------------

// Définition des Types
interface Step {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  order: number;
  description: string;
}

interface Hunt {
  id: number;
  title: string;
  description: string;
  steps: Step[]; // Une chasse contient une liste d'étapes
}

const Map = () => {
  // On stocke les chasses récupérées depuis l'API
  const [hunts, setHunts] = useState<Hunt[]>([]);
  // Coordonnées de Bordeaux (Puisqu'on y est ! 😉)
  const position: [number, number] = [44.8378, -0.5792];

  useEffect(() => {
    const fetchHunts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/hunts`,
        );
        console.log("Chasses récupérées :", response.data);
        setHunts(response.data.data); // On suppose que les données sont dans response.data.data
      } catch (error) {
        console.error("Erreur lors de la récupération des chasses :", error);
      }
    };

    fetchHunts();
  }, []);

  return (
    // h-full et w-full pour prendre toute la place du conteneur parent
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={true}
      className="h-full w-full rounded-lg shadow-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* On boucle sur les chasses pour créer les marqueurs */}

      {hunts.map((hunt: Hunt) => {
        // On place le marqueur sur la PREMIÈRE étape de la chasse
        // Si la chasse n'a pas d'étapes, on ne l'affiche pas (sécurité)
        // const startStep =
        //   hunt.steps && hunt.steps.length > 0 ? hunt.steps[0] : null;

        // if (!startStep) return null;

        // 1. On trie les étapes par ordre croissant
          const sortedSteps = [...hunt.steps].sort((a, b) => a.order - b.order);
          const startStep = sortedSteps[0];

        // 🆕 2. On prépare le tableau de coordonnées pour la ligne [[lat, long], [lat, long]]
        // Leaflet a besoin de ce format précis pour tracer
        const pathPositions: [number, number][] = sortedSteps.map(step => [step.latitude, step.longitude]);


        return (
            <div key={hunt.id}>
          <Marker
            position={[startStep.latitude, startStep.longitude]}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg">{hunt.title}</h3>
                <p className="text-gray-600 mb-2">{hunt.description}</p>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Commencer cette chasse ! 🏴‍☠️
                </button>
              </div>
            </Popup>
          </Marker>
                <Polyline 
                pathOptions={{ color: 'red', weight: 4, opacity: 0.7, dashArray: '10, 10' }} 
                positions={pathPositions} color="blue" />
            </div>
        );
      })}
    </MapContainer>
  );
};

export default Map;
