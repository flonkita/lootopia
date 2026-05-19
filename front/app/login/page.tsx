"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                email,
                password,
            });

            localStorage.setItem('token', response.data.token);
            router.push('/dashboard');

        } catch (err) { // 🧹 Adieu le "any" !
            console.error("Erreur de connexion:", err);

            let errorMsg = "Identifiants incorrects. Veuillez réessayer.";
            if (axios.isAxiosError(err)) {
                errorMsg = err.response?.data?.message || errorMsg;
            }

            setError(errorMsg);
        }
    };

    return (
        // 🛠️ AJOUT DE flex-col ICI POUR EMPILER LE FORMULAIRE ET LE LIEN !
        <div className="flex flex-col min-h-screen items-center justify-center bg-slate-900 p-4">

            {/* Le bloc blanc du formulaire */}
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Connexion</h2>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 mb-2 text-sm font-semibold">Adresse email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 mb-2 text-sm font-semibold">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                    Se connecter
                </button>
            </form>

            {/* Le lien d'inscription, maintenant bien aligné en dessous */}
            <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                    Pas encore de navire ?
                    <Link href="/register" className="ml-2 text-yellow-400 hover:text-yellow-300 font-bold transition-colors">
                        Créez votre compte de Chasseur !
                    </Link>
                </p>
            </div>

        </div>
    );
}