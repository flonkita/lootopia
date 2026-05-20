"use client";

import dynamic from 'next/dynamic';

// Importation dynamique globale sans Props compliquées !
const CreateHuntMap = dynamic(() => import('../components/CreateHuntMap'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
            <p className="text-yellow-400 font-bold">Ouverture du parchemin de cartographie... 📜</p>
        </div>
    )
});

export default function CreateHuntPage() {
    return (
        <div className="min-h-screen bg-slate-950 p-4 lg:p-8">
            <CreateHuntMap />
        </div>
    );
}