import React, { useState } from 'react';
import { Terminal, Shield, Server, Code, Settings, Container, Network, ArrowRight, Users, PenTool as Tool, Rocket, GitBranch, Lock } from 'lucide-react';

export const ExegolArticle: React.FC = () => {
  const [activeTab, setActiveTab] = useState('presentation');

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
      
      {/* Docker Host */}
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
          Docker Host
        </text>
      </g>

      {/* Exegol Container 1 */}
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
          Exegol
        </text>
        <text x="60" y="65" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          Red Team
        </text>
      </g>

      {/* Exegol Container 2 */}
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
          Exegol
        </text>
        <text x="60" y="65" textAnchor="middle" fill="#8b5cf6" className="text-sm">
          Bug Bounty
        </text>
      </g>

      {/* Connexions */}
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
          Exegol : L'Environnement d'Attaque de Référence en Cybersécurité
        </h1>
        <p className="text-xl text-gray-400">
          Alternative moderne et flexible à Kali Linux pour les tests d'intrusion professionnels
        </p>
      </header>

      {/* Navigation */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'presentation', icon: Rocket, label: 'Présentation' },
          { id: 'installation', icon: Terminal, label: 'Installation' },
          { id: 'configuration', icon: Settings, label: 'Configuration' },
          { id: 'usage', icon: Shield, label: 'Utilisation' },
          { id: 'comparison', icon: Server, label: 'Comparaison' }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap
              ${activeTab === id 
                ? 'bg-violet-500 text-white' 
                : 'bg-[#2a2a2f] text-gray-400 hover:bg-violet-500/20'}`}
          >
            <Icon className="w-4 h-4 inline-block mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="space-y-8">
        {/* Présentation */}
        <section className={activeTab === 'presentation' ? 'block' : 'hidden'}>
          <div className="space-y-6">
            {/* Introduction */}
            <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
              <div className="flex items-center gap-3 mb-6">
                <Rocket className="w-6 h-6 text-violet-400" />
                <h2 className="text-xl font-bold">Présentation Générale</h2>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-6">
                Exegol est un environnement Linux conteneurisé basé sur Docker, conçu pour les professionnels 
                de la cybersécurité, notamment les pentesters, red teamers et chercheurs en sécurité. Développé 
                par Dramelac et Shutdown, ce projet vise à fournir un espace de travail isolé, reproductible et 
                polyvalent pour réaliser des tests de sécurité offensive.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#2a2a2f] p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Container className="w-5 h-5 text-violet-400" />
                    <h3 className="font-semibold">Conteneurisation</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Environnement Docker léger et portable
                  </p>
                </div>
                <div className="bg-[#2a2a2f] p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-violet-400" />
                    <h3 className="font-semibold">Sécurité</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Isolation complète des tests
                  </p>
                </div>
                <div className="bg-[#2a2a2f] p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Tool className="w-5 h-5 text-violet-400" />
                    <h3 className="font-semibold">Outils</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Suite complète de pentesting
                  </p>
                </div>
              </div>
            </div>

            {/* Pourquoi Exegol */}
            <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-violet-400" />
                <h2 className="text-xl font-bold">Pourquoi Exegol ?</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-[#2a2a2f] p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Rocket className="w-5 h-5 text-violet-400 mt-1" />
                      <div>
                        <h4 className="font-semibold">Léger et Rapide</h4>
                        <p className="text-sm text-gray-400">
                          Fonctionne via Docker, sans surcharger les ressources
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#2a2a2f] p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Terminal className="w-5 h-5 text-violet-400 mt-1" />
                      <div>
                        <h4 className="font-semibold">Facile à Déployer</h4>
                        <p className="text-sm text-gray-400">
                          En une seule commande, un environnement opérationnel
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#2a2a2f] p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Settings className="w-5 h-5 text-violet-400 mt-1" />
                      <div>
                        <h4 className="font-semibold">Modulaire</h4>
                        <p className="text-sm text-gray-400">
                          Possibilité d'ajouter/supprimer des outils facilement
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#2a2a2f] p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="w-5 h-5 text-violet-400 mt-1" />
                      <div>
                        <h4 className="font-semibold">Sécurisé et Isolé</h4>
                        <p className="text-sm text-gray-400">
                          Limite les risques d'infection et de conflits logiciels
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* L'équipe */}
            <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-violet-400" />
                <h2 className="text-xl font-bold">Qui est derrière Exegol ?</h2>
              </div>

              <div className="space-y-6">
                <p className="text-gray-300">
                  Le projet est principalement développé par Shutdown, un expert en cybersécurité 
                  ayant une grande expérience en pentesting et red teaming. Il a été rejoint par 
                  Dramelac, un autre spécialiste qui a contribué au développement et à l'amélioration 
                  de l'environnement.
                </p>

                <div className="bg-[#2a2a2f] p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <GitBranch className="w-5 h-5 text-violet-400" />
                    <h4 className="font-semibold">Projet Open Source</h4>
                  </div>
                  <p className="text-sm text-gray-400">
                    Exegol s'inscrit dans une démarche open-source, avec une communauté active qui 
                    propose des mises à jour régulières et des améliorations constantes.
                  </p>
                  <a 
                    href="https://github.com/ShutdownRepo/exegol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <span>Voir sur GitHub</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Architecture */}
            <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
              <div className="flex items-center gap-3 mb-6">
                <Network className="w-6 h-6 text-violet-400" />
                <h2 className="text-xl font-bold">Architecture Docker</h2>
              </div>
              <NetworkDiagram />
            </div>
          </div>
        </section>

        {/* Installation */}
        <section className={activeTab === 'installation' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold text-violet-400 mb-6">Guide d'Installation</h3>
            
            <div className="space-y-6">
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">1. Installation sous Linux</h4>
                <pre className="bg-[#1a1a1f] p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-violet-400">
                    # Installation de Docker{'\n'}
                    sudo apt update && sudo apt install docker.io -y{'\n'}
                    sudo systemctl enable --now docker{'\n'}
                    sudo usermod -aG docker $USER{'\n\n'}
                    # Installation d'Exegol{'\n'}
                    git clone https://github.com/ShutdownRepo/exegol.git{'\n'}
                    cd exegol{'\n'}
                    ./install.sh{'\n'}
                    exegol install full
                  </code>
                </pre>
              </div>

              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">2. Installation sous Windows (WSL2)</h4>
                <pre className="bg-[#1a1a1f] p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-violet-400">
                    # Dans Ubuntu WSL2{'\n'}
                    sudo apt update && sudo apt install docker.io -y{'\n'}
                    git clone https://github.com/ShutdownRepo/exegol.git{'\n'}
                    cd exegol && ./install.sh{'\n'}
                    exegol install full
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section className={activeTab === 'configuration' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold text-violet-400 mb-6">Configuration de l'Environnement</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Container className="w-5 h-5 text-violet-400" />
                  <h4 className="font-semibold">Configuration Docker</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Isolation réseau complète</li>
                  <li>• Volumes persistants</li>
                  <li>• Optimisation des ressources</li>
                  <li>• Support multi-architecture</li>
                </ul>
              </div>
              
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-5 h-5 text-violet-400" />
                  <h4 className="font-semibold">Personnalisation</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Sélection des outils</li>
                  <li>• Configuration réseau</li>
                  <li>• Paramètres de sécurité</li>
                  <li>• Scripts d'automatisation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Utilisation */}
        <section className={activeTab === 'usage' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold text-violet-400 mb-6">Cas d'Usage</h3>
            
            <div className="space-y-6">
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Commandes de Base</h4>
                <pre className="bg-[#1a1a1f] p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-violet-400">
                    # Démarrer un conteneur{'\n'}
                    exegol start myPentestEnv{'\n\n'}
                    # Accès root & persistance{'\n'}
                    exegol -r myPentestEnv
                  </code>
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#2a2a2f] p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-violet-400">Red Team</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Tests d'intrusion</li>
                    <li>• Post-exploitation</li>
                    <li>• Pivoting réseau</li>
                    <li>• Persistence</li>
                  </ul>
                </div>
                
                <div className="bg-[#2a2a2f] p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-violet-400">Bug Bounty</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Web Application Testing</li>
                    <li>• API Testing</li>
                    <li>• Mobile Testing</li>
                    <li>• Network Testing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparaison */}
        <section className={activeTab === 'comparison' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <h3 className="text-xl font-semibold text-violet-400 mb-6">Exegol vs Kali Linux</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#2a2a2f] p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-violet-400">Exegol (Docker)</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>✓ Installation ultra-rapide</li>
                    <li>✓ Léger et optimisé</li>
                    <li>✓ Isolement complet</li>
                    <li>✓ Compatible CI/CD</li>
                    <li>✓ Snapshots instantanés</li>
                  </ul>
                </div>
                
                <div className="bg-[#2a2a2f] p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-violet-400">Kali Linux</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Installation lourde</li>
                    <li>• Ressources importantes</li>
                    <li>• Exposition directe à l'OS</li>
                    <li>• Difficile à automatiser</li>
                    <li>• Pas de snapshots natifs</li>
                  </ul>
                </div>
              </div>

              <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4">
                <p className="text-violet-400 text-sm italic">
                  Exegol offre une approche moderne du pentesting, combinant la puissance de Docker 
                  avec la flexibilité d'un environnement conteneurisé. Idéal pour les équipes Red Team 
                  et les professionnels de la cybersécurité.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
};