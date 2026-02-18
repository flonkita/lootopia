"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// On définit le type pour avoir l'autocomplétion
interface User {
    id: number;
    email: string;
    username: string;
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
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
                <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Mon QG 🏴‍☠️</h1>
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
                    <div className="bg-slate-700 p-6 rounded-lg mb-6 shadow-inner">
                        <h2 className="text-xl font-semibold mb-4 text-blue-400">Profil du Chasseur</h2>
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
                    </div>

                    <blockquote className="border-l-4 border-blue-500 bg-slate-700/50 p-4 rounded-r italic text-gray-300">
                        &quot;Prêt à reprendre la chasse là où tu t&apos;étais arrêté ?&quot;
                    </blockquote>
                </div>

            </div>
        </div>
    );
}