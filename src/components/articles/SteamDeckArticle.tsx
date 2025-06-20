import React, { useState } from 'react';
import { Terminal, Laptop, Cpu, Car as SdCard, Power, Shield, Wrench, HelpCircle } from 'lucide-react';

interface ComparisonItem {
  name: string;
  steamOS: {
    supported: boolean;
    details: string;
  };
  kaliSD: {
    supported: boolean;
    details: string;
  };
}

export const SteamDeckArticle: React.FC = () => {
  const [activeTab, setActiveTab] = useState('installation');

  const comparisonData: ComparisonItem[] = [
    {
      name: "Gaming",
      steamOS: {
        supported: true,
        details: "Performance native maximale"
      },
      kaliSD: {
        supported: false,
        details: "Non optimisé pour le gaming"
      }
    },
    {
      name: "Pentesting",
      steamOS: {
        supported: false,
        details: "Pas d'outils natifs"
      },
      kaliSD: {
        supported: true,
        details: "Suite complète d'outils"
      }
    },
    {
      name: "Stockage SSD",
      steamOS: {
        supported: true,
        details: "Utilisation du SSD interne"
      },
      kaliSD: {
        supported: false,
        details: "Stockage sur carte SD uniquement"
      }
    },
    {
      name: "Boot rapide",
      steamOS: {
        supported: true,
        details: "Démarrage en quelques secondes"
      },
      kaliSD: {
        supported: false,
        details: "Nécessite sélection dans BIOS"
      }
    }
  ];

  const BootDiagram = () => (
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
      
      {/* BIOS */}
      <g transform="translate(350,50)">
        <rect
          x="0"
          y="0"
          width="100"
          height="60"
          rx="10"
          className="fill-violet-900/20 stroke-violet-500"
          strokeWidth="2"
        />
        <text x="50" y="35" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          BIOS
        </text>
      </g>

      {/* SteamOS */}
      <g transform="translate(200,150)">
        <rect
          x="0"
          y="0"
          width="120"
          height="100"
          rx="10"
          className="fill-violet-900/20 stroke-violet-500"
          strokeWidth="2"
        />
        <text x="60" y="45" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          SteamOS
        </text>
        <text x="60" y="65" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          (SSD)
        </text>
      </g>

      {/* Kali Linux */}
      <g transform="translate(480,150)">
        <rect
          x="0"
          y="0"
          width="120"
          height="100"
          rx="10"
          className="fill-violet-900/20 stroke-violet-500"
          strokeWidth="2"
        />
        <text x="60" y="45" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          Kali Linux
        </text>
        <text x="60" y="65" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          (SD Card)
        </text>
      </g>

      {/* Lignes de connexion */}
      <line
        x1="400"
        y1="110"
        x2="260"
        y2="150"
        stroke="#8b5cf6"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
      <line
        x1="400"
        y1="110"
        x2="540"
        y2="150"
        stroke="#8b5cf6"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* En-tête */}
      <header className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
          Steam Deck Kali Linux : Station de Pentesting Mobile
        </h1>
        <p className="text-xl text-gray-400">
          Transformez votre Steam Deck en plateforme de pentesting sans compromettre ses capacités gaming
        </p>
      </header>

      {/* Introduction */}
      <section className="mb-12 bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <div className="flex items-center gap-3 mb-4">
          <Laptop className="w-6 h-6 text-violet-400" />
          <h2 className="text-2xl font-bold">Pourquoi ce projet ?</h2>
        </div>
        <p className="text-gray-300 mb-6">
          Le Steam Deck est bien plus qu'une console de jeu : c'est un PC portable Linux complet avec un 
          potentiel énorme pour la cybersécurité. Ce projet exploite ce potentiel en créant une solution 
          de dual boot non-invasive, permettant d'utiliser Kali Linux depuis une carte SD tout en préservant 
          l'expérience gaming native de SteamOS.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <SdCard className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold">Non-Invasif</h3>
            </div>
            <p className="text-sm text-gray-400">
              Installation sur carte SD, SteamOS intact
            </p>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold">Pentesting</h3>
            </div>
            <p className="text-sm text-gray-400">
              Suite complète d'outils Kali Linux
            </p>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Power className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold">Portable</h3>
            </div>
            <p className="text-sm text-gray-400">
              Station de travail mobile complète
            </p>
          </div>
        </div>
      </section>

      {/* Navigation des sections */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['installation', 'comparaison', 'script', 'faq'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap
              ${activeTab === tab 
                ? 'bg-violet-500 text-white' 
                : 'bg-[#2a2a2f] text-gray-400 hover:bg-violet-500/20'}`}
          >
            {tab === 'installation' && <Terminal className="w-4 h-4 inline-block mr-2" />}
            {tab === 'comparaison' && <Cpu className="w-4 h-4 inline-block mr-2" />}
            {tab === 'script' && <Wrench className="w-4 h-4 inline-block mr-2" />}
            {tab === 'faq' && <HelpCircle className="w-4 h-4 inline-block mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Contenu dynamique */}
      <div className="space-y-12">
        {/* Section Installation */}
        <section className={activeTab === 'installation' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold text-violet-400 mb-6">Guide d'Installation</h3>
            <div className="space-y-6">
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">1. Préparation de la carte SD</h4>
                <pre className="bg-[#1a1a1f] p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-violet-400">
                    # Formater la carte SD en ext4{'\n'}
                    sudo mkfs.ext4 /dev/mmcblk0p1{'\n'}
                    # Monter la carte SD{'\n'}
                    sudo mount /dev/mmcblk0p1 /mnt/sdcard
                  </code>
                </pre>
              </div>

              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">2. Installation de Kali Linux</h4>
                <pre className="bg-[#1a1a1f] p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-violet-400">
                    # Télécharger l'image Kali{'\n'}
                    wget https://kali.download/arm-images/kali-2025.1/kali-linux-2025.1-steam-deck.img.xz{'\n'}
                    # Décompresser et flasher{'\n'}
                    xz -d kali-linux-2025.1-steam-deck.img.xz{'\n'}
                    sudo dd if=kali-linux-2025.1-steam-deck.img of=/dev/mmcblk0 bs=4M status=progress
                  </code>
                </pre>
              </div>

              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">3. Configuration du GRUB</h4>
                <pre className="bg-[#1a1a1f] p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-violet-400">
                    # Éditer la configuration GRUB{'\n'}
                    sudo nano /etc/default/grub{'\n'}
                    # Ajouter l'entrée pour Kali{'\n'}
                    GRUB_TIMEOUT=5{'\n'}
                    GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Section Comparaison */}
        <section className={activeTab === 'comparaison' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold text-violet-400 mb-6">Comparaison SteamOS vs Kali Linux</h3>
            <div className="grid grid-cols-1 gap-4">
              {comparisonData.map((item, index) => (
                <div key={index} className="bg-[#2a2a2f] p-4 rounded-lg">
                  <h4 className="font-semibold mb-4">{item.name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {item.steamOS.supported ? (
                          <Shield className="w-4 h-4 text-green-400" />
                        ) : (
                          <Shield className="w-4 h-4 text-red-400" />
                        )}
                        <span className="font-medium">SteamOS</span>
                      </div>
                      <p className="text-sm text-gray-400">{item.steamOS.details}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {item.kaliSD.supported ? (
                          <Shield className="w-4 h-4 text-green-400" />
                        ) : (
                          <Shield className="w-4 h-4 text-red-400" />
                        )}
                        <span className="font-medium">Kali SD</span>
                      </div>
                      <p className="text-sm text-gray-400">{item.kaliSD.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Script */}
        <section className={activeTab === 'script' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold text-violet-400 mb-6">Automatisation de l'Installation</h3>
            <div className="space-y-6">
              <p className="text-gray-300">
                Pour simplifier le processus d'installation et le rendre plus reproductible, il serait intéressant 
                de développer un script d'installation automatique. Ce script pourrait :
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#2a2a2f] p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-violet-400">Fonctionnalités Potentielles</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-violet-400 mt-1" />
                      <span className="text-gray-300">Vérification automatique des prérequis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-violet-400 mt-1" />
                      <span className="text-gray-300">Préparation et formatage de la carte SD</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-violet-400 mt-1" />
                      <span className="text-gray-300">Installation de Kali Linux et des outils</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-violet-400 mt-1" />
                      <span className="text-gray-300">Configuration du dual boot</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#2a2a2f] p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-violet-400">Avantages</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-violet-400 mt-1" />
                      <span className="text-gray-300">Installation rapide et sans erreur</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-violet-400 mt-1" />
                      <span className="text-gray-300">Processus reproductible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-violet-400 mt-1" />
                      <span className="text-gray-300">Maintenance et mises à jour facilitées</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-violet-400 mt-1" />
                      <span className="text-gray-300">Documentation intégrée</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-violet-500/10 p-4 rounded-lg border border-violet-500/20">
                <p className="text-violet-400 text-sm">
                  Le développement d'un tel script est en cours et sera bientôt disponible. Il permettra 
                  d'automatiser l'ensemble du processus d'installation tout en offrant des options de 
                  personnalisation avancées.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section FAQ */}
        <section className={activeTab === 'faq' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold text-violet-400 mb-6">Questions Fréquentes</h3>
            <div className="space-y-6">
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Est-ce que cela affecte la garantie ?</h4>
                <p className="text-gray-400">
                  Non, l'installation sur carte SD ne modifie pas le système principal et ne void pas la garantie.
                </p>
              </div>
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Quelle taille de carte SD recommandez-vous ?</h4>
                <p className="text-gray-400">
                  Une carte SD de 128 Go minimum est recommandée pour avoir assez d'espace pour Kali et ses outils.
                </p>
              </div>
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Les performances sont-elles affectées ?</h4>
                <p className="text-gray-400">
                  Les performances de SteamOS restent inchangées. Kali sur SD sera légèrement plus lent qu'une installation SSD.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Schéma de Boot */}
      <section className="mt-12">
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <h3 className="text-xl font-semibold text-violet-400 mb-6">Schéma du Processus de Boot</h3>
          <BootDiagram />
        </div>
      </section>
    </article>
  );
};