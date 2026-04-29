"use client";

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Réparation des icônes Leaflet sous Next.js
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Le composant invisible qui écoute les clics sur la carte
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
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
    const [city, setCity] = useState('Bordeaux'); // La plus belle ville pour commencer !
    const [difficulty, setDifficulty] = useState(1);

    // --- ÉTATS DE LA CARTE ---
    const [steps, setSteps] = useState<{ latitude: number; longitude: number; title: string; description: string }[]>([]);

    // Ajout d'une étape au clic
    const handleMapClick = (lat: number, lng: number) => {
        setSteps([...steps, { latitude: lat, longitude: lng, title: `Étape ${steps.length + 1}`, description: '' }]);
    };

    // Mise à jour du texte d'une étape précise
    const updateStepText = (index: number, field: 'title' | 'description', value: string) => {
        const newSteps = [...steps];
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    // 🆕 Suppression d'une étape
    const removeStep = (indexToRemove: number) => {
        setSteps(steps.filter((_, index) => index !== indexToRemove));
    };

    // Envoi à l'API
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (steps.length === 0) return alert("Il faut au moins une étape sur la carte !");

        const huntData = {
            title,
            description,
            difficulty,
            city,
            creatorId: 1, // ⚠️ À remplacer plus tard par l'ID du vrai joueur connecté !
            startLat: steps[0].latitude, // La première étape sert de point de départ
            startLng: steps[0].longitude,
            steps: steps.map((step, index) => ({
                order: index + 1,
                title: step.title,
                description: step.description,
                latitude: step.latitude,
                longitude: step.longitude
            }))
        };

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/hunts`, huntData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("🎉 Chasse créée avec succès !");
            // On vide tout après la victoire
            setSteps([]);
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la création de la chasse.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-900 text-white p-6 rounded-xl">

            {/* COLONNE GAUCHE : LE FORMULAIRE ET LES ÉTAPES */}
            <div className="lg:col-span-1 space-y-6 max-h-[700px] overflow-y-auto pr-2">
                <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-lg space-y-4">
                    <h2 className="text-2xl font-bold text-yellow-400">Créer une Quête 🏴‍☠️</h2>

                    <input type="text" placeholder="Titre de la chasse" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-slate-700 rounded" required />
                    <textarea placeholder="Description générale" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-slate-700 rounded" />

                    <div className="flex gap-2">
                        <input type="text" placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} className="w-1/2 p-2 bg-slate-700 rounded" />
                        <select value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} className="w-1/2 p-2 bg-slate-700 rounded">
                            <option value={1}>Facile</option>
                            <option value={2}>Moyen</option>
                            <option value={3}>Difficile</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-green-500 hover:bg-green-600 font-bold py-2 rounded transition">
                        Publier la Chasse
                    </button>
                </form>

                {/* LISTE DES ÉTAPES CLIQUEES */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold border-b border-slate-700 pb-2">Les Indices ({steps.length})</h3>
                    {steps.length === 0 && <p className="text-sm text-gray-400 italic">Clique sur la carte pour placer ta première étape...</p>}

                    {steps.map((step, index) => (
                        <div key={index} className="bg-slate-800 p-3 rounded-lg border-l-4 border-yellow-500">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs text-gray-400">Étape {index + 1} 📍</p>
                                {/* 🆕 Le bouton de suppression */}
                                <button
                                    type="button"
                                    onClick={() => removeStep(index)}
                                    className="text-red-400 hover:text-red-500 hover:bg-red-900/30 p-1 rounded transition-colors text-xs font-bold"
                                    title="Supprimer cette étape"
                                >
                                    ❌
                                </button>
                            </div>

                            <input
                                type="text" value={step.title} onChange={e => updateStepText(index, 'title', e.target.value)}
                                placeholder="Ex: Le vieux chêne" className="w-full p-1 text-sm bg-slate-700 rounded mb-2" required
                            />
                            <textarea
                                value={step.description} onChange={e => updateStepText(index, 'description', e.target.value)}
                                placeholder="L'indice à trouver..." className="w-full p-1 text-sm bg-slate-700 rounded" required
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* COLONNE DROITE : LA CARTE */}
            <div className="lg:col-span-2 h-[700px] border-4 border-slate-700 rounded-xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-400 bg-slate-900/80 px-4 py-2 rounded-full pointer-events-none text-sm border border-slate-600">
                    Cliquez n&apos; importe où pour placer un marqueur
                </div>

                <MapContainer center={[44.8378, -0.5792]} zoom={13} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler onMapClick={handleMapClick} />

                    {/* Affichage dynamique des marqueurs */}
                    {steps.map((step, index) => (
                        <Marker key={index} position={[step.latitude, step.longitude]}>
                            <Popup><b>Étape {index + 1}</b><br />{step.title}</Popup>
                        </Marker>
                    ))}

                    {/* La fameuse ligne "à vol d'oiseau" entre les étapes */}
                    {steps.length > 1 && (
                        <Polyline positions={steps.map(s => [s.latitude, s.longitude])} color="#EAB308" weight={4} dashArray="10, 10" />
                    )}
                </MapContainer>
            </div>

        </div>
    );
}