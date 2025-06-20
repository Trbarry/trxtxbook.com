import React, { useState } from 'react';
import { Terminal, Laptop, Rocket, Settings, HelpCircle } from 'lucide-react';
import { Introduction } from './Introduction';
import { Installation } from './Installation';
import { Configuration } from './Configuration';
import { Usage } from './Usage';
import { FAQ } from './FAQ';

export const LinuxMintArticle: React.FC = () => {
  const [activeTab, setActiveTab] = useState('presentation');

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* En-tête */}
      <header className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
          Linux Mint : Une Bouffée d'Air Frais pour Votre Ancien PC
        </h1>
        <p className="text-xl text-gray-400">
          Trop lent sous Windows 11 ? Linux Mint redonne fluidité, sécurité et simplicité à votre PC, même avec seulement 4 Go de RAM.
        </p>
      </header>

      {/* Navigation */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'presentation', icon: Rocket, label: 'Présentation' },
          { id: 'installation', icon: Terminal, label: 'Installation' },
          { id: 'configuration', icon: Settings, label: 'Configuration' },
          { id: 'usage', icon: Laptop, label: 'Utilisation' },
          { id: 'faq', icon: HelpCircle, label: 'FAQ' }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap
              ${activeTab === id 
                ? 'bg-green-500 text-white' 
                : 'bg-[#2a2a2f] text-gray-400 hover:bg-green-500/20'}`}
          >
            <Icon className="w-4 h-4 inline-block mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="space-y-8">
        <section className={activeTab === 'presentation' ? 'block' : 'hidden'}>
          <Introduction />
        </section>

        <section className={activeTab === 'installation' ? 'block' : 'hidden'}>
          <Installation />
        </section>

        <section className={activeTab === 'configuration' ? 'block' : 'hidden'}>
          <Configuration />
        </section>

        <section className={activeTab === 'usage' ? 'block' : 'hidden'}>
          <Usage />
        </section>

        <section className={activeTab === 'faq' ? 'block' : 'hidden'}>
          <FAQ />
        </section>
      </div>
    </article>
  );
};