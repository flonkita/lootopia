"use client";

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import Link from 'next/link';

// Réparation des icônes Leaflet sous Next.js
const startIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const stepIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

interface MapClickHandlerProps {
    onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function CreateHuntMap() {
    // --- ÉTATS DU FORMULAIRE ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('Bordeaux');
    const [difficulty, setDifficulty] = useState(1);
    const [status, setStatus] = useState('brouillon'); // 🎯 NOUVEAU (US6) : Brouillon par défaut !

    // --- ÉTATS DE GÉOLOCALISATION ---
    const [startLat, setStartLat] = useState<number | null>(null); // 🏁 Point de départ distinct
    const [startLng, setStartLng] = useState<number | null>(null);
    const [steps, setSteps] = useState<{ latitude: number; longitude: number; title: string; description: string; order: number }[]>([]);

    // Mode de clic actuel
    const [placementMode, setPlacementMode] = useState<"start" | "step">("start");

    // Ajout d'un point au clic sur la carte
    const handleMapClick = (lat: number, lng: number) => {
        if (placementMode === "start") {
            setStartLat(lat);
            setStartLng(lng);
            setPlacementMode("step"); // Bascule automatique vers le mode étape
        } else {
            setSteps([...steps, {
                latitude: lat,
                longitude: lng,
                title: `Étape ${steps.length + 1}`,
                description: '',
                order: steps.length + 1
            }]);
        }
    };

    const updateStepText = (index: number, field: 'title' | 'description', value: string) => {
        const newSteps = [...steps];
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const removeStep = (indexToRemove: number) => {
        const filtered = steps.filter((_, index) => index !== indexToRemove);
        // On recalcule le bon ordre des étapes restantes
        const reordered = filtered.map((step, idx) => ({
            ...step,
            order: idx + 1,
            title: step.title.startsWith("Étape ") ? `Étape ${idx + 1}` : step.title
        }));
        setSteps(reordered);
    };

    // Envoi de la cargaison complète au Backend Express via Prisma
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (startLat === null || startLng === null) {
            return alert("Mille sabords ! Place d'abord un point de départ en OR sur la carte ! 🏁");
        }

        const huntData = {
            title,
            description,
            difficulty,
            city,
            status, // 📁 Enregistre "brouillon" ou "publie"
            startLat,
            startLng,
            creatorId: 1, // À lier au state utilisateur global plus tard
            steps: steps.map((step) => ({
                order: step.order,
                title: step.title,
                description: step.description,
                latitude: step.latitude,
                longitude: step.longitude
            }))
        };

        console.log("⚓ CARGAISON ENVOYÉE AU BACKEND :", huntData);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/hunts`, huntData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`🎉 Chasse enregistrée avec succès au statut ${status} !`);

            // Nettoyage complet après la victoire
            setTitle('');
            setDescription('');
            setStartLat(null);
            setStartLng(null);
            setSteps([]);
            setPlacementMode("start");
        } catch (error) {
            console.error(error);
            alert("Une tempête a empêché la création de la chasse.");
        }
    };

    return (
        <div className="space-y-6 bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-2xl">

            {/* 🆕 BARRE DE NAVIGATION ET TITRE SUPÉRIEUR */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-yellow-500 tracking-wide">📜 Créer une Chasse au Trésor</h1>
                    <p className="text-xs text-gray-400 mt-1">Dessine les contours d&apos;une nouvelle aventure pour Lootopia</p>
                </div>

                {/* Liens de navigation rapides */}
                <div className="flex gap-2 w-full sm:w-auto">
                    <Link
                        href="/"
                        className="flex-1 sm:flex-none text-center bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold py-2 px-4 rounded-lg text-xs transition-colors border border-slate-700 shadow-md"
                    >
                        🏠 Retour au Port
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex-1 sm:flex-none text-center bg-slate-950 hover:bg-slate-800 text-yellow-500 font-bold py-2 px-4 rounded-lg text-xs transition-colors border border-slate-800 shadow-md"
                    >
                        🏴‍☠️ Mon Tableau de Bord
                    </Link>
                </div>
            </div>

            {/* 🛠️ CONTENEUR DE LA GRILLE BIEN RESTRUCTURÉ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLONNE GAUCHE : CONFIGURATION ET INDICES */}
                <div className="lg:col-span-1 space-y-6 max-h-[750px] overflow-y-auto pr-2">
                    <form onSubmit={handleSubmit} className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4 shadow-lg">
                        <h2 className="text-2xl font-bold text-yellow-400 border-b border-slate-700 pb-2">Créer une Quête 🏴‍☠️</h2>

                        <div className="space-y-1">
                            <label className="text-xs text-yellow-500 font-semibold uppercase">Nom de l&apos;aventure</label>
                            <input type="text" placeholder="Ex: Le Secret de la Grosse Cloche" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 bg-slate-950 rounded border border-slate-700 focus:outline-none focus:border-yellow-500 transition-colors" required />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-yellow-500 font-semibold uppercase">Histoire / Description</label>
                            <textarea placeholder="Raconte les mystères..." value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 bg-slate-950 rounded border border-slate-700 h-20 focus:outline-none focus:border-yellow-500 transition-colors" />
                        </div>

                        <div className="flex gap-3">
                            <div className="w-1/2 space-y-1">
                                <label className="text-xs text-yellow-500 font-semibold uppercase">Ville</label>
                                <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full p-2.5 bg-slate-950 rounded border border-slate-700 focus:outline-none" />
                            </div>
                            <div className="w-1/2 space-y-1">
                                <label className="text-xs text-yellow-500 font-semibold uppercase">Difficulté</label>
                                <select value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} className="w-full p-2.5 bg-slate-950 rounded border border-slate-700 text-white font-medium">
                                    <option value={1}>🟢 Facile</option>
                                    <option value={2}>🟡 Moyen</option>
                                    <option value={3}>🔴 Difficile</option>
                                </select>
                            </div>
                        </div>

                        {/* 🎯 SÉLECTEUR DE STATUT BROUILLON / PUBLIÉ */}
                        <div className="space-y-1">
                            <label className="text-xs text-yellow-500 font-semibold uppercase">Visibilité de la Quête (US6)</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2.5 bg-slate-950 rounded border border-slate-700 text-yellow-400 font-bold focus:outline-none">
                                <option value="brouillon">📁 Mode Brouillon (Sauvegarder l&apos;idée)</option>
                                <option value="publie">🌍 Mode Publié (Visible par les joueurs)</option>
                            </select>
                        </div>

                        <button type="submit" className="w-full bg-linear-to-r from-yellow-600 to-amber-700 hover:from-yellow-500 hover:to-amber-600 text-white font-extrabold py-3 rounded-lg transition-all shadow-md uppercase tracking-wide text-sm pt-2">
                            💾 Enregistrer l&apos;Aventure
                        </button>
                    </form>

                    {/* LISTE DES INDICES */}
                    <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                        <h3 className="text-lg font-bold border-b border-slate-800 pb-2 flex justify-between items-center">
                            <span>📋 Structure du parcours</span>
                            <span className="text-xs bg-blue-900 px-2 py-0.5 rounded-full text-blue-300">{steps.length} étapes</span>
                        </h3>

                        {startLat && (
                            <div className="text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-2.5 rounded-lg flex justify-between items-center font-medium">
                                <span>🏁 Point de départ enregistré</span>
                                <button type="button" onClick={() => { setStartLat(null); setPlacementMode("start"); }} className="text-red-400 font-bold px-1 hover:text-red-500">✕</button>
                            </div>
                        )}

                        {steps.length === 0 && !startLat && <p className="text-xs text-gray-400 italic text-center py-4">Clique sur la carte pour définir le point de départ global.</p>}

                        {steps.map((step, index) => (
                            <div key={index} className="bg-slate-800 p-3 rounded-lg border-l-4 border-blue-500 relative space-y-2 shadow-md">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-blue-400">Étape {step.order} 📍</span>
                                    <button type="button" onClick={() => removeStep(index)} className="text-red-400 hover:text-red-500 text-xs font-bold px-1">✕</button>
                                </div>

                                <input
                                    type="text" value={step.title} onChange={e => updateStepText(index, 'title', e.target.value)}
                                    placeholder="Titre du lieu" className="w-full p-2 text-xs bg-slate-950 border border-slate-700 rounded text-white" required
                                />
                                <textarea
                                    value={step.description} onChange={e => updateStepText(index, 'description', e.target.value)}
                                    placeholder="L'énigme ou indice pour y arriver..." className="w-full p-2 text-xs bg-slate-950 border border-slate-700 rounded text-white h-14" required
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLONNE DROITE : LA CARTE INTERACTIVE */}
                <div className="lg:col-span-2 h-[700px] border border-slate-700 rounded-xl overflow-hidden shadow-inner relative">
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 mountaineer z-400 bg-slate-950/90 px-4 py-2 rounded-full border border-slate-700 shadow-xl text-center">
                        {placementMode === "start" ? (
                            <p className="text-xs text-yellow-400 font-bold animate-pulse">🎯 Clique pour placer le POINT DE DÉPART global (Marqueur Or)</p>
                        ) : (
                            <p className="text-xs text-blue-400 font-bold">📍 Clique pour ajouter l&apos;Étape {steps.length + 1} (Marqueurs Bleus)</p>
                        )}
                    </div>

                    <div className="absolute bottom-4 right-4 z-400 space-x-2">
                        <button type="button" onClick={() => setPlacementMode("start")} className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all border ${placementMode === "start" ? "bg-yellow-600 border-yellow-500 text-white" : "bg-slate-950 border-slate-800 text-gray-400"}`}>🏁 Mode Départ</button>
                        <button type="button" onClick={() => setPlacementMode("step")} className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all border ${placementMode === "step" ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-gray-400"}`}>📍 Mode Étapes</button>
                    </div>

                    <MapContainer center={[44.8378, -0.5792]} zoom={13} className="h-full w-full">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapClickHandler onMapClick={handleMapClick} />

                        {/* Marqueur du Point de Départ (Or) */}
                        {startLat !== null && startLng !== null && (
                            <Marker position={[startLat, startLng]} icon={startIcon}>
                                <Popup><b className="text-yellow-600">🏁 Point de Départ Initial</b></Popup>
                            </Marker>
                        )}

                        {/* Affichage des Marqueurs d'Étapes (Bleu) */}
                        {steps.map((step, index) => (
                            <Marker key={index} position={[step.latitude, step.longitude]} icon={stepIcon}>
                                <Popup><b>Étape {step.order}</b><br />{step.title}</Popup>
                            </Marker>
                        ))}

                        {/* Lignes à vol d'oiseau reliant le départ et toutes les étapes */}
                        {startLat !== null && startLng !== null && steps.length > 0 && (
                            <Polyline
                                positions={[
                                    [startLat, startLng],
                                    ...steps.map(s => [s.latitude, s.longitude] as [number, number])
                                ]}
                                color="#EAB308"
                                weight={3}
                                dashArray="8, 8"
                            />
                        )}
                    </MapContainer>
                </div>

            </div>
        </div>
    );
}