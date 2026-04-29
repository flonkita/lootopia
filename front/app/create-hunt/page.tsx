'use client'

import dynamic from 'next/dynamic';
import React from 'react';
import Link from 'next/link';

const CreateMap = dynamic(() => import('../components/CreateHuntMap'), {
    ssr: false,
    loading: () => <div className="h-96 w-full flex items-center justify-center bg-gray-100">Chargement de la carte...</div>
});

export default function CreateHuntPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-slate-900">
            <div className="z-10 max-w-5xl w-full flex flex-col items-center font-mono text-sm mb-8 gap-4">

                {/* 🆕 Le bouton de retour vers la terre ferme */}
                <div className="w-full flex justify-start">
                    <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors border border-slate-600">
                        ← Retour à l&apos;accueil
                    </Link>
                </div>

                <h1 className="text-4xl font-bold text-white text-center w-full">
                    Créer une chasse au trésor 🏴‍☠️
                </h1>
            </div>
            <CreateMap />
        </main>
    )
}