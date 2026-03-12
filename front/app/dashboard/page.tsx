"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

// On définit le type pour avoir l'autocomplétion
interface User {
    id: number;
    email: string;
    username: string;
    xp: number;
    completedHunts: number;
}

export default function Dashboard() {
    // États pour stocker les infos de l'utilisateur et le statut de chargement
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // States pour l'édition du profil
    const [isEditing, setIsEditing] = useState(false);
    const [editEmail, setEditEmail] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

    // Le router de Next.js pour naviguer
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            // 1. On cherche le sésame dans le coffre-fort du navigateur
            const token = localStorage.getItem('token');

            if (!token) {
                // Pas de token ? Expulsé vers le login !
                router.push('/login');
                return;
            }

            try {
                // 2. On utilise le token pour prouver au back-end qu'on a le droit d'être là
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}` // C'est ici qu'on montre patte blanche
                    }
                });

                // 3. On sauvegarde les infos de l'utilisateur pour les afficher
                setUser(response.data);
                setEditEmail(response.data.email);
                setEditUsername(response.data.username || '');
            } catch (error) {
                console.error("Erreur de token :", error);
                // Si le token est faux ou expiré, on nettoie et on dégage
                localStorage.removeItem('token');
                router.push('/login');
            } finally {
                // Quoi qu'il arrive, on a fini de charger
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    // Fonction pour envoyer les modifications au backend
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateMessage({ type: '', text: '' });
        const token = localStorage.getItem('token');

        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update`, {
                email: editEmail,
                username: editUsername,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Met à jour l'affichage avec les nouvelles données
            setUser(response.data.user || { ...user, email: editEmail, username: editUsername });
            setIsEditing(false);
            setUpdateMessage({ type: 'success', text: 'Profil mis à jour avec succès ! 🚀' });

            // Efface le message après 3 secondes
            setTimeout(() => setUpdateMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            setUpdateMessage({ type: 'error', text: "Erreur lors de la mise à jour." });
        }
    };

    // Écran d'attente pendant qu'on vérifie le token (le fameux feu doux)
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
                <p className="text-xl animate-pulse">Ouverture des portes du QG... 🏴‍☠️</p>
            </div>
        );
    }

    // Le vrai Dashboard une fois connecté
    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white">
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">

                {/* En-tête du Dashboard */}
                {/* En-tête du Dashboard */}
                <div className="bg-slate-800 p-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        {/* 🆕 Le bouton de retour à l'accueil */}
                        <Link
                            href="/"
                            className="bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors border border-slate-600"
                        >
                            ← Carte
                        </Link>
                        <h1 className="text-3xl font-bold">Mon QG 🏴‍☠️</h1>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            router.push('/login');
                        }}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                        Déconnexion
                    </button>
                </div>

                {/* Contenu principal */}
                <div className="p-6">
                    {/* 🆕 Grille pour séparer le profil et les stats en 2 colonnes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                        {/* ⬅️ COLONNE GAUCHE : Profil du Chasseur */}
                        <div className="bg-slate-700 p-6 rounded-lg shadow-inner">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-blue-400">Profil du Chasseur</h2>
                                {/* Bouton pour activer le mode édition */}
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition-colors"
                                    >
                                        Modifier
                                    </button>
                                )}
                            </div>

                            {/* Message de confirmation (Vert ou Rouge) */}
                            {updateMessage?.text && (
                                <div className={`mb-4 p-2 rounded text-sm text-center ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {updateMessage.text}
                                </div>
                            )}

                            {isEditing ? (
                                /* 🛠️ MODE ÉDITION : Le Formulaire */
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Nom de Chasseur</label>
                                        <input
                                            type="text"
                                            value={editUsername}
                                            onChange={(e) => setEditUsername(e.target.value)}
                                            className="w-full p-2 rounded bg-slate-800 border border-slate-600 focus:border-blue-500 focus:outline-none text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Email de contact</label>
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            className="w-full p-2 rounded bg-slate-800 border border-slate-600 focus:border-blue-500 focus:outline-none text-white"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-sm font-bold flex-1">
                                            Sauvegarder
                                        </button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-sm font-bold flex-1">
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* 📖 MODE LECTURE : Ta liste classique */
                                <ul className="space-y-2">
                                    <li>
                                        <span className="text-gray-400">Email de contact :</span>
                                        <span className="ml-2 font-mono">{user?.email}</span>
                                    </li>
                                    <li>
                                        <span className="text-gray-400">ID Chasseur :</span>
                                        <span className="ml-2 font-mono">#{user?.id}</span>
                                    </li>
                                    <li>
                                        <span className="text-gray-400">Nom de Chasseur :</span>
                                        <span className="ml-2 font-mono">{user?.username}</span>
                                    </li>
                                </ul>
                            )}
                        </div>

                        {/* ➡️ COLONNE DROITE : Progression */}
                        <div className="bg-slate-700 p-6 rounded-lg shadow-inner flex flex-col justify-center items-center text-center">
                            <h2 className="text-xl font-semibold mb-6 text-yellow-400">Progression</h2>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                                    <span className="block text-gray-400 text-sm mb-1">Score Total</span>
                                    <span className="text-3xl font-bold text-white">{user?.xp || 0} <span className="text-lg text-yellow-500">XP</span></span>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                                    <span className="block text-gray-400 text-sm mb-1">Chasses</span>
                                    <span className="text-3xl font-bold text-white">{user?.completedHunts || 0}</span>
                                </div>
                            </div>

                            <p className="mt-6 text-sm text-gray-400 italic">
                                Les statistiques se mettront à jour dès ta première victoire !
                            </p>
                        </div>

                    </div>

                    <blockquote className="border-l-4 border-blue-500 bg-slate-700/50 p-4 rounded-r italic text-gray-300">
                        &quot;Prêt à reprendre la chasse là où tu t&apos;étais arrêté ?&quot;
                    </blockquote>
                </div>

            </div>
        </div>
    );
}