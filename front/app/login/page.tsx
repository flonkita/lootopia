"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Réinitialiser l'erreur avant de tenter la connexion

        try {
            // Appel à l'API pour se connecter
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                email,
                password,
            });

            // 2. On sauvegarde le token JWT dans le navigateur
            localStorage.setItem('token', response.data.token);

            // 3. 🚀 Redirection vers le dashboard utilisateur !
            router.push('/dashboard');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            // Si le back-end refuse (mauvais mot de passe, etc.), on affiche l'erreur
            console.error("Erreur de connexion:", err);
            setError(err.response?.data?.message || "Identifiants incorrects. Veuillez réessayer.");
        }
    };
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>

                {/* 🆕 Zone d'affichage des erreurs */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 mb-2">Adresse email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 mb-2">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Se connecter
                </button>
            </form>
        </div>
    );
}