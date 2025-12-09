import React, { useState } from 'react';
import { Server, Wifi, MonitorSmartphone, CheckCircle2, AlertCircle, ArrowRight, Code, Lightbulb } from 'lucide-react';

interface ComparisonItem {
  name: string;
  advantages: string[];
  disadvantages: string[];
}

export const SMBArticle: React.FC = () => {
  const [showAdvantages, setShowAdvantages] = useState(true);

  const comparisonData: ComparisonItem[] = [
    {
      name: "SMB",
      advantages: [
        "Qualité native 4K HDR",
        "Aucun transcodage",
        "Support Dolby Vision/Atmos",
        "Lecture instantanée"
      ],
      disadvantages: [
        "Nécessite un bon réseau Wi-Fi",
        "Configuration initiale technique",
        "Dépend de la stabilité réseau"
      ]
    },
    {
      name: "USB",
      advantages: [
        "Très stable",
        "Pas de latence",
        "Simple d'utilisation",
        "Indépendant du réseau"
      ],
      disadvantages: [
        "Nécessite un déplacement physique",
        "Pas toujours compatible Dolby Vision",
        "Copie des fichiers nécessaire"
      ]
    },
    {
      name: "Chromecast",
      advantages: [
        "Très simple à utiliser",
        "Interface intuitive",
        "Compatible tout appareil",
        "Pas de configuration"
      ],
      disadvantages: [
        "Compression vidéo",
        "Perte qualité audio",
        "Consommation batterie élevée",
        "Latence possible"
      ]
    },
    {
      name: "DLNA",
      advantages: [
        "Standard universel",
        "Compatible TV/Console",
        "Configuration simple",
        "Découverte auto"
      ],
      disadvantages: [
        "Transcodage fréquent",
        "Pas de support HDR/DV",
        "Navigation lente",
        "Bugs fréquents"
      ]
    }
  ];

  const NetworkDiagram = () => (
    <svg className="w-full h-64" viewBox="0 0 800 300">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#8b5cf6"
          />
        </marker>
      </defs>
      
      {/* Fond avec effet gradient */}
      <rect x="0" y="0" width="800" height="300" fill="#1a1a1f" rx="10" />
      
      {/* Téléphone (Serveur SMB) */}
      <g transform="translate(100,100)">
        <rect
          x="0"
          y="0"
          width="120"
          height="200"
          rx="10"
          className="fill-violet-900/20 stroke-violet-500"
          strokeWidth="2"
        />
        <text x="60" y="50" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          Android
        </text>
        <text x="60" y="70" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          SMB Server
        </text>
      </g>

      {/* Routeur Wi-Fi */}
      <g transform="translate(350,150)">
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx="10"
          className="fill-violet-900/20 stroke-violet-500"
          strokeWidth="2"
        />
        <text x="50" y="50" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          Wi-Fi
        </text>
        <text x="50" y="70" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          Router
        </text>
      </g>

      {/* TV avec Kodi */}
      <g transform="translate(580,100)">
        <rect
          x="0"
          y="0"
          width="120"
          height="200"
          rx="10"
          className="fill-violet-900/20 stroke-violet-500"
          strokeWidth="2"
        />
        <text x="60" y="50" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          TV
        </text>
        <text x="60" y="70" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          Kodi
        </text>
      </g>

      {/* Lignes de connexion */}
      <line
        x1="220"
        y1="200"
        x2="350"
        y2="200"
        stroke="#8b5cf6"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        className="animate-pulse"
      />
      <line
        x1="450"
        y1="200"
        x2="580"
        y2="200"
        stroke="#8b5cf6"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        className="animate-pulse"
      />
    </svg>
  );

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* En-tête */}
      <header className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
          Mini-Projet : Serveur SMB Mobile pour Streaming 4K HDR
        </h1>
        <p className="text-xl text-gray-400">
          Transformez votre smartphone en serveur de streaming portable
        </p>
      </header>

      {/* Introduction */}
      <section className="mb-12 bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-6 h-6 text-violet-400" />
          <h2 className="text-2xl font-bold">Pourquoi un serveur SMB mobile ?</h2>
        </div>
        <p className="text-gray-300 mb-6">
          Ce mini-projet transforme votre smartphone Android en serveur de streaming portable, offrant une alternative 
          flexible aux solutions traditionnelles comme les NAS ou les serveurs PC. L'avantage principal ? 
          Votre médiathèque vous suit partout, tout en conservant une qualité de lecture optimale.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Ultra Portable</h3>
            </div>
            <p className="text-sm text-gray-400">
              Votre serveur vous suit partout, idéal en déplacement
            </p>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold">Performance</h3>
            </div>
            <p className="text-sm text-gray-400">
              Profitez du Wi-Fi 6 de votre smartphone
            </p>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MonitorSmartphone className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold">Simplicité</h3>
            </div>
            <p className="text-sm text-gray-400">
              Configuration rapide, utilisation immédiate
            </p>
          </div>
        </div>
      </section>

      {/* Schéma du réseau */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Wifi className="w-6 h-6 text-violet-400" />
          <h2 className="text-2xl font-bold">Architecture du Système</h2>
        </div>
        <div className="bg-[#1a1a1f] rounded-lg border border-violet-900/20 p-6">
          <NetworkDiagram />
        </div>
      </section>

      {/* Guide d'installation */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Code className="w-6 h-6 text-violet-400" />
          <h2 className="text-2xl font-bold">Guide d'Installation</h2>
        </div>
        <div className="space-y-6">
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold mb-4 text-violet-400">1. Configuration du Serveur SMB</h3>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-violet-500/20 p-2 rounded-full mt-1">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold mb-2">Installation de l'application</p>
                  <p className="text-gray-400 text-sm">
                    Téléchargez "SMB Server - Samba Server" depuis le Play Store
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-violet-500/20 p-2 rounded-full mt-1">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold mb-2">Configuration du partage</p>
                  <div className="bg-[#2a2a2f] p-4 rounded-lg mb-2">
                    <pre className="text-sm text-violet-400">
                      <code>
                        Nom du partage: Films{'\n'}
                        Chemin: /storage/emulated/0/Films{'\n'}
                        Port: 4455{'\n'}
                        Accès: Lecture seule
                      </code>
                    </pre>
                  </div>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold mb-4 text-violet-400">2. Configuration de Kodi</h3>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-violet-500/20 p-2 rounded-full mt-1">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold mb-2">Ajout de la source vidéo</p>
                  <div className="bg-[#2a2a2f] p-4 rounded-lg mb-2">
                    <pre className="text-sm text-violet-400">
                      <code>
                        Protocole: SMB{'\n'}
                        Adresse: smb://192.168.1.XX:4455/Films{'\n'}
                        Nom: Films Android
                      </code>
                    </pre>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Tableau comparatif */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ArrowRight className="w-6 h-6 text-violet-400" />
            <h2 className="text-2xl font-bold">Comparaison des Solutions</h2>
          </div>
          <button
            onClick={() => setShowAdvantages(!showAdvantages)}
            className="px-4 py-2 bg-violet-500/10 rounded-lg text-violet-400 hover:bg-violet-500/20 transition-colors"
          >
            {showAdvantages ? 'Voir les inconvénients' : 'Voir les avantages'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {comparisonData.map((item, index) => (
            <div
              key={index}
              className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20 hover:border-violet-500/50 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold mb-4">{item.name}</h3>
              <ul className="space-y-2">
                {(showAdvantages ? item.advantages : item.disadvantages).map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {showAdvantages ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 mt-1" />
                    )}
                    <span className={showAdvantages ? 'text-green-300' : 'text-red-300'}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Pour aller plus loin */}
      <section className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-violet-400" />
          <h2 className="text-2xl font-bold">Pour Aller Plus Loin</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold mb-4 text-violet-400">Optimisations Avancées</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1" />
                <span>Configurer le Wake Lock pour éviter la mise en veille</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1" />
                <span>Optimiser les paramètres réseau pour le Wi-Fi 6</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1" />
                <span>Mettre en place une sauvegarde automatique</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold mb-4 text-violet-400">Limitations & Solutions</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-1" />
                <div>
                  <span className="font-semibold">Espace de stockage limité</span>
                  <p className="text-sm text-gray-400">Utilisez une carte SD haute performance pour étendre le stockage</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-1" />
                <div>
                  <span className="font-semibold">Autonomie de la batterie</span>
                  <p className="text-sm text-gray-400">Connectez le téléphone à un chargeur lors des sessions longues</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </article>
  );
};