import React, { useState } from 'react';
import { Server, Network, Shield, Users, Settings, Terminal } from 'lucide-react';
import { ADArchitecture } from './ad/ADArchitecture';
import { ADInstallation } from './ad/ADInstallation';
import { ADConfiguration } from './ad/ADConfiguration';
import { ADScripts } from './ad/ADScripts';

export const ADArticle: React.FC = () => {
  const [activeTab, setActiveTab] = useState('architecture');

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* En-tête */}
      <header className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
          Réseau Active Directory Personnel
        </h1>
        <p className="text-xl text-gray-400">
          Infrastructure complète AD pour tests de sécurité et apprentissage
        </p>
      </header>

      {/* Introduction */}
      <section className="mb-12 bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-6 h-6 text-violet-400" />
          <h2 className="text-2xl font-bold">Pourquoi ce projet ?</h2>
        </div>
        <div className="space-y-6">
          <p className="text-gray-300 leading-relaxed">
            Dans le monde professionnel actuel, Active Directory reste la solution de référence pour la gestion 
            centralisée des identités et des ressources en entreprise. Ce projet naît d'un double objectif : 
            approfondir ma compréhension des infrastructures Windows Server en conditions réelles, et créer un 
            environnement de test sécurisé pour pratiquer les techniques de pentesting sans risque.
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            L'infrastructure mise en place simule un environnement d'entreprise complet, intégrant les dernières 
            versions de Windows Server 2022 et Windows 11, ainsi que des solutions de sécurité comme pfSense pour 
            la gestion du réseau. Cette configuration permet non seulement de maîtriser les aspects techniques 
            de l'administration système, mais aussi d'explorer les vulnérabilités courantes et les méthodes de 
            protection dans un cadre contrôlé.
          </p>

          <p className="text-gray-300 leading-relaxed">
            La virtualisation complète de l'infrastructure offre une flexibilité totale pour tester différentes 
            configurations, automatiser les déploiements via PowerShell, et mettre en place une surveillance 
            centralisée avec Zabbix et Graylog. Cette approche hands-on est essentielle pour développer une 
            expertise pratique en administration système et en cybersécurité.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold">Sécurité</h3>
            </div>
            <p className="text-sm text-gray-400">
              Environnement isolé pour les tests de sécurité et l'audit des configurations
            </p>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold">Gestion</h3>
            </div>
            <p className="text-sm text-gray-400">
              Administration centralisée des utilisateurs et des ressources
            </p>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold">Automatisation</h3>
            </div>
            <p className="text-sm text-gray-400">
              Scripts PowerShell pour le déploiement et la maintenance
            </p>
          </div>
        </div>
      </section>

      {/* Navigation des sections */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['architecture', 'installation', 'configuration', 'scripts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap
              ${activeTab === tab 
                ? 'bg-violet-500 text-white' 
                : 'bg-[#2a2a2f] text-gray-400 hover:bg-violet-500/20'}`}
          >
            {tab === 'architecture' && <Network className="w-4 h-4 inline-block mr-2" />}
            {tab === 'installation' && <Server className="w-4 h-4 inline-block mr-2" />}
            {tab === 'configuration' && <Settings className="w-4 h-4 inline-block mr-2" />}
            {tab === 'scripts' && <Terminal className="w-4 h-4 inline-block mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Contenu dynamique */}
      <div className="space-y-12">
        <section className={activeTab === 'architecture' ? 'block' : 'hidden'}>
          <ADArchitecture />
        </section>

        <section className={activeTab === 'installation' ? 'block' : 'hidden'}>
          <ADInstallation />
        </section>

        <section className={activeTab === 'configuration' ? 'block' : 'hidden'}>
          <ADConfiguration />
        </section>

        <section className={activeTab === 'scripts' ? 'block' : 'hidden'}>
          <ADScripts />
        </section>
      </div>
    </article>
  );
};