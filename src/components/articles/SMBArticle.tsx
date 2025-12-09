import React, { useState } from 'react';
import { Server, Wifi, MonitorSmartphone, CheckCircle2, AlertCircle, ArrowRight, Code, Lightbulb } from 'lucide-react';

interface ComparisonItem { name: string; advantages: string[]; disadvantages: string[]; }

export const SMBArticle: React.FC = () => {
  const [showAdvantages, setShowAdvantages] = useState(true);

  const comparisonData: ComparisonItem[] = [
    { name: "SMB", advantages: ["Qualité native 4K HDR", "Aucun transcodage", "Lecture instantanée"], disadvantages: ["Nécessite bon Wi-Fi", "Config technique"] },
    { name: "USB", advantages: ["Très stable", "Pas de latence"], disadvantages: ["Déplacement physique", "Pas compatible DV"] },
    { name: "Chromecast", advantages: ["Simple", "Compatible tout"], disadvantages: ["Compression vidéo", "Perte qualité audio"] },
    { name: "DLNA", advantages: ["Standard universel", "Config simple"], disadvantages: ["Transcodage fréquent", "Pas de HDR/DV"] }
  ];

  const NetworkDiagram = () => (
    <svg className="w-full h-64" viewBox="0 0 800 300">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" className="fill-violet-600 dark:fill-violet-500" />
        </marker>
      </defs>
      {/* Fond du diagramme */}
      <rect x="0" y="0" width="800" height="300" className="fill-gray-100 dark:fill-[#1a1a1f]" rx="10" />
      
      {/* Téléphone */}
      <g transform="translate(100,100)">
        <rect x="0" y="0" width="120" height="200" rx="10" className="fill-violet-100 dark:fill-violet-900/20 stroke-violet-600 dark:stroke-violet-500" strokeWidth="2" />
        <text x="60" y="50" textAnchor="middle" className="text-sm fill-violet-700 dark:fill-violet-400 font-bold">Android</text>
        <text x="60" y="70" textAnchor="middle" className="text-sm fill-violet-700 dark:fill-violet-400">SMB Server</text>
      </g>

      {/* Routeur */}
      <g transform="translate(350,150)">
        <rect x="0" y="0" width="100" height="100" rx="10" className="fill-violet-100 dark:fill-violet-900/20 stroke-violet-600 dark:stroke-violet-500" strokeWidth="2" />
        <text x="50" y="50" textAnchor="middle" className="text-sm fill-violet-700 dark:fill-violet-400 font-bold">Wi-Fi</text>
        <text x="50" y="70" textAnchor="middle" className="text-sm fill-violet-700 dark:fill-violet-400">Router</text>
      </g>

      {/* TV */}
      <g transform="translate(580,100)">
        <rect x="0" y="0" width="120" height="200" rx="10" className="fill-violet-100 dark:fill-violet-900/20 stroke-violet-600 dark:stroke-violet-500" strokeWidth="2" />
        <text x="60" y="50" textAnchor="middle" className="text-sm fill-violet-700 dark:fill-violet-400 font-bold">TV</text>
        <text x="60" y="70" textAnchor="middle" className="text-sm fill-violet-700 dark:fill-violet-400">Kodi</text>
      </g>

      {/* Lignes */}
      <line x1="220" y1="200" x2="350" y2="200" className="stroke-violet-600 dark:stroke-violet-500 animate-pulse" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <line x1="450" y1="200" x2="580" y2="200" className="stroke-violet-600 dark:stroke-violet-500 animate-pulse" strokeWidth="2" markerEnd="url(#arrowhead)" />
    </svg>
  );

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      <header className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-violet-800 dark:from-violet-400 dark:to-violet-600 bg-clip-text text-transparent">
          Mini-Projet : Serveur SMB Mobile pour Streaming 4K HDR
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Transformez votre smartphone en serveur de streaming portable
        </p>
      </header>

      {/* Introduction */}
      <section className="mb-12 bg-surface dark:bg-[#1a1a1f] p-6 rounded-lg border border-gray-200 dark:border-violet-900/20 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pourquoi un serveur SMB mobile ?</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          Ce mini-projet transforme votre smartphone Android en serveur de streaming portable. L'avantage principal ? Votre médiathèque vous suit partout.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-[#2a2a2f] p-4 rounded-lg border border-gray-100 dark:border-transparent">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Ultra Portable</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Votre serveur vous suit partout</p>
          </div>
          <div className="bg-gray-50 dark:bg-[#2a2a2f] p-4 rounded-lg border border-gray-100 dark:border-transparent">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Performance</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Profitez du Wi-Fi 6</p>
          </div>
          <div className="bg-gray-50 dark:bg-[#2a2a2f] p-4 rounded-lg border border-gray-100 dark:border-transparent">
            <div className="flex items-center gap-2 mb-2">
              <MonitorSmartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Simplicité</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configuration rapide</p>
          </div>
        </div>
      </section>

      {/* Schéma */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Wifi className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Architecture du Système</h2>
        </div>
        <div className="bg-surface dark:bg-[#1a1a1f] rounded-lg border border-gray-200 dark:border-violet-900/20 p-6 shadow-sm dark:shadow-none">
          <NetworkDiagram />
        </div>
      </section>

      {/* Guide */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Code className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guide d'Installation</h2>
        </div>
        <div className="space-y-6">
          <div className="bg-surface dark:bg-[#1a1a1f] p-6 rounded-lg border border-gray-200 dark:border-violet-900/20 shadow-sm dark:shadow-none">
            <h3 className="text-xl font-semibold mb-4 text-violet-700 dark:text-violet-400">1. Configuration du Serveur SMB</h3>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-violet-100 dark:bg-violet-500/20 p-2 rounded-full mt-1"><CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" /></div>
                <div>
                  <p className="font-semibold mb-2 text-gray-900 dark:text-white">Installation</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Téléchargez "SMB Server"</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-violet-100 dark:bg-violet-500/20 p-2 rounded-full mt-1"><CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" /></div>
                <div className="w-full">
                  <p className="font-semibold mb-2 text-gray-900 dark:text-white">Configuration</p>
                  <div className="bg-gray-100 dark:bg-[#2a2a2f] p-4 rounded-lg mb-2 border border-gray-200 dark:border-transparent">
                    <pre className="text-sm text-violet-700 dark:text-violet-400"><code>Nom: Films{'\n'}Port: 4455</code></pre>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Comparaison */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ArrowRight className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comparaison</h2>
          </div>
          <button onClick={() => setShowAdvantages(!showAdvantages)} className="px-4 py-2 bg-violet-100 dark:bg-violet-500/10 rounded-lg text-violet-700 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/20 transition-colors">
            {showAdvantages ? 'Voir les inconvénients' : 'Voir les avantages'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {comparisonData.map((item, index) => (
            <div key={index} className="bg-surface dark:bg-[#1a1a1f] p-6 rounded-lg border border-gray-200 dark:border-violet-900/20 hover:border-violet-300 dark:hover:border-violet-500/50 transition-all duration-300 shadow-sm dark:shadow-none">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{item.name}</h3>
              <ul className="space-y-2">
                {(showAdvantages ? item.advantages : item.disadvantages).map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {showAdvantages ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-1" /> : <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-1" />}
                    <span className={showAdvantages ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
};