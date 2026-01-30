// components/Map.tsx
"use client"; // Indispensable pour dire à Next que c'est du code navigateur

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- 🛠️ FIX : Hack pour rétablir les icônes par défaut de Leaflet ---
// Sans ça, les marqueurs sont invisibles ou cassés.
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

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

const Map = () => {
  // Coordonnées de Bordeaux (Puisqu'on y est ! 😉)
  const position: [number, number] = [44.8378, -0.5792];

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
      
      {/* Un petit marqueur test pour voir si ça marche */}
      <Marker position={position}>
        <Popup>
          Bienvenue à <b>Lootopia</b> ! <br /> Le QG est ici.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;