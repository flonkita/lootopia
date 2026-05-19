"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function Register() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // 1️⃣ Vérification de base (Le feu doux !)
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas ! 🏴‍☠️' });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Le mot de passe doit faire au moins 6 caractères.' });
            return;
        }

        setLoading(true);

        try {
            // 2️⃣ Envoi au Backend
            // ⚠️ Vérifie bien que la route de ton backend est bien /auth/register
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                email,
                username,
                password
            });

            // 3️⃣ Succès : On prévient et on redirige
            setMessage({ type: 'success', text: 'Bienvenue dans la flotte ! Redirection vers le port...' });

            // On laisse 2 petites secondes au pirate pour lire le message de bienvenue
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error) {
            console.error("Erreur d'enrôlement :", error);

            let errorMsg = "Une tempête a empêché la création du compte.";

            // On vérifie si c'est bien une erreur renvoyée par notre Backend via Axios
            if (axios.isAxiosError(error)) {
                errorMsg = error.response?.data?.message || errorMsg;
            }
            // Sinon, on vérifie si c'est une erreur JavaScript classique
            else if (error instanceof Error) {
                errorMsg = error.message;
            }

            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-yellow-400 mb-2">Lootopia 🏴‍☠️</h1>
                    <p className="text-gray-400">Rejoins l&apos;équipage des Chasseurs</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-3 rounded text-sm text-center font-medium ${message.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Pseudo de Pirate</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none text-white transition-all"
                            placeholder="Ex: Barbe Noire"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none text-white transition-all"
                            placeholder="pirate@mer.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none text-white transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none text-white transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? 'Signature du pacte... ⏳' : "S'enrôler !"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-700 pt-6">
                    <p className="text-gray-400 text-sm">
                        Déjà membre de l&apos;équipage ?
                        <Link href="/login" className="ml-2 text-blue-400 hover:text-blue-300 font-bold transition-colors">
                            Jeter l&apos;ancre ici !
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}