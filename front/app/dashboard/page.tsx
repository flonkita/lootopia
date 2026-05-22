"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface User {
    id: number;
    email: string;
    username: string;
    xp: number;
    completedHunts: number;
    avatar: string;
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editEmail, setEditEmail] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Cache-Control': 'no-cache' // 🚫 Bloque le cache pour forcer la mise à jour !
                 }
                });

                setUser(response.data);
                setEditEmail(response.data.email);
                setEditUsername(response.data.username || '');

                // 💡 On ne force pas l'écriture de avatarPreview ici ! 
                // On laisse la fonction getAvatarUrl s'occuper de l'affichage de la BDD.

            } catch (error) {
                console.error("Erreur de token :", error);
                localStorage.removeItem('token');
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    // Fonction pour mettre à jour Email / Pseudo
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

            setUser(response.data.user || { ...user, email: editEmail, username: editUsername });
            setIsEditing(false);
            setUpdateMessage({ type: 'success', text: 'Profil mis à jour avec succès ! 🚀' });
            setTimeout(() => setUpdateMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            setUpdateMessage({ type: 'error', text: "Erreur lors de la mise à jour." });
        }
    };

    // 🖼️ GESTION FLUIDE DE L'AVATAR (TACTIQUE A-2)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 1. Correction de la variable d'état pour l'envoi
            setAvatarFile(file);

            // 2. ⚡ Génération de la preview locale instantanée pour le rendu immédiat
            const localUrl = URL.createObjectURL(file);
            setAvatarPreview(localUrl);
        }
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) return;
        setUpdateMessage({ type: '', text: 'Envoi en cours vers la cale...' });

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/avatar`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // On met à jour l'utilisateur local avec sa nouvelle image
            if (user) {
                setUser({ ...user, avatar: response.data.avatarUrl });
            }

            setAvatarFile(null); // On vide le fichier en attente
            setAvatarPreview(null); // ✅ On nettoie la preview locale pour laisser l'image serveur prendre le relais
            setUpdateMessage({ type: 'success', text: 'Avatar hissé avec succès ! 🏴‍☠️' });
            setTimeout(() => setUpdateMessage({ type: '', text: '' }), 3000);

        } catch (error) {
            console.error("Tempête lors de l'upload:", error);
            setUpdateMessage({ type: 'error', text: "Une tempête a empêché l'envoi de l'image." });
        }
    };

    const getAvatarUrl = (avatarName: string | null | undefined) => {
        if (!avatarName) return null;
        if (avatarName.startsWith('http')) return avatarName;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

        // 🎯 Nettoyage : Si le nom contient déjà "/uploads/" ou "uploads/", on le retire
        const cleanName = avatarName.replace(/^\/?uploads\//, '');

        return `${baseUrl}/uploads/${cleanName}`;
    };

    // 💡 Priorité absolue à la preview locale temporaire, sinon l'image en BDD
    const avatarSrc = avatarPreview || getAvatarUrl(user?.avatar);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
                <p className="text-xl animate-pulse">Ouverture des portes du QG... 🏴‍☠️</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white">
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
                <div className="bg-slate-800 p-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors border border-slate-600">
                            ← Carte
                        </Link>
                        <h1 className="text-3xl font-bold">Mon QG 🏴‍☠️</h1>
                    </div>
                    <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold transition-colors">
                        Déconnexion
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                        {/* ⬅️ COLONNE GAUCHE : Profil du Chasseur */}
                        <div className="bg-slate-700 p-6 rounded-lg shadow-inner flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-blue-400">Profil du Chasseur</h2>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="text-sm bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition-colors">
                                        Modifier
                                    </button>
                                )}
                            </div>

                            {updateMessage?.text && (
                                <div className={`mb-4 p-2 rounded text-sm text-center ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : updateMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {updateMessage.text}
                                </div>
                            )}

                            {/* 🖼️ ZONE AVATAR (Contourne définitivement l'erreur Private IP) */}
                            <div className="flex flex-col items-center gap-3 mb-6 pb-6 border-b border-slate-600">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500 flex items-center justify-center bg-slate-800">
                                    {avatarSrc ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={avatarSrc}
                                            alt="Avatar du Chasseur"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // 🎯 Fallback magique inline : Un émoji pirate si le serveur n'a pas l'image
                                                e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='75' x='10'>🏴‍☠️</text></svg>";
                                            }}
                                        />
                                    ) : (
                                        <span className="text-slate-400">Pas de blason</span>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-yellow-500 file:text-slate-900 hover:file:bg-yellow-400 cursor-pointer"
                                />
                                {avatarFile && (
                                    <button onClick={handleUploadAvatar} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-1 px-2 rounded text-sm transition-colors">
                                        Sauvegarder l&apos;image
                                    </button>
                                )}
                            </div>

                            {/* LE RESTE DU PROFIL (Édition ou Lecture) */}
                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Nom de Chasseur</label>
                                        <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="w-full p-2 rounded bg-slate-800 border border-slate-600 focus:border-blue-500 focus:outline-none text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">Email de contact</label>
                                        <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full p-2 rounded bg-slate-800 border border-slate-600 focus:border-blue-500 focus:outline-none text-white" />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-sm font-bold flex-1">Enregistrer</button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-sm font-bold flex-1">Annuler</button>
                                    </div>
                                </form>
                            ) : (
                                <ul className="space-y-2 mt-auto">
                                    <li><span className="text-gray-400">Email :</span><span className="ml-2 font-mono">{user?.email}</span></li>
                                    <li><span className="text-gray-400">ID :</span><span className="ml-2 font-mono">#{user?.id}</span></li>
                                    <li><span className="text-gray-400">Pseudo :</span><span className="ml-2 font-mono">{user?.username}</span></li>
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
                            <p className="mt-6 text-sm text-gray-400 italic">Les statistiques se mettront à jour dès ta première victoire !</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}