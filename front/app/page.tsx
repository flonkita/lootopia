"use client";
import dynamic from 'next/dynamic';

// 👇 L'import magique qui évite l'erreur "window is not defined"
// Remplacez le chemin par le chemin relatif correct si le fichier Map.tsx se trouve dans 'components' à la racine du projet front
const MapWithNoSSR = dynamic(() => import('./components/Map'), { 
  ssr: false,
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-gray-100">Chargement de la carte...</div>
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-slate-900">
      
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-8">
        <h1 className="text-4xl font-bold text-white text-center w-full">
          Lootopia 🏴‍☠️
        </h1>
      </div>

      {/* Conteneur de la carte avec une taille définie */}
      <div className="w-full max-w-4xl h-[500px] border-4 border-white/20 rounded-xl overflow-hidden">
        <MapWithNoSSR />
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left mt-10">
        <a href="/login" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className={`mb-3 text-2xl font-semibold text-white`}>
            Connexion <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-gray-300`}>
            Rejoins l&apos;aventure.
          </p>
        </a>
      </div>
    </main>
  );
}