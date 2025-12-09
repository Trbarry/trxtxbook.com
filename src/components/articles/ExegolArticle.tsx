import React, { useState } from 'react';
import { Terminal, Shield, Server, Rocket, Container, Lock, Users, GitBranch, Network, ArrowRight, Settings, PenTool as Tool } from 'lucide-react';

export const ExegolArticle: React.FC = () => {
  const [activeTab, setActiveTab] = useState('presentation');

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      <header className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-violet-800 dark:from-violet-400 dark:to-violet-600 bg-clip-text text-transparent">Exegol : L'Environnement d'Attaque</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Alternative moderne à Kali Linux basée sur Docker</p>
      </header>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {[{ id: 'presentation', icon: Rocket, label: 'Présentation' }, { id: 'installation', icon: Terminal, label: 'Installation' }].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === id ? 'bg-violet-600 text-white' : 'bg-white dark:bg-[#2a2a2f] text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-500/20 border border-gray-200 dark:border-transparent'}`}>
            <Icon className="w-4 h-4 inline-block mr-2" />{label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <section className={activeTab === 'presentation' ? 'block' : 'hidden'}>
          <div className="bg-surface dark:bg-[#1a1a1f] p-6 rounded-lg border border-gray-200 dark:border-violet-900/20 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-6"><Rocket className="w-6 h-6 text-violet-600 dark:text-violet-400" /><h2 className="text-xl font-bold text-gray-900 dark:text-white">Présentation Générale</h2></div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Exegol est un environnement Linux conteneurisé basé sur Docker, conçu pour les pentesters.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-[#2a2a2f] p-4 rounded-lg"><div className="flex items-center gap-2 mb-2"><Container className="w-5 h-5 text-violet-600 dark:text-violet-400" /><h3 className="font-semibold text-gray-900 dark:text-white">Docker</h3></div><p className="text-sm text-gray-600 dark:text-gray-400">Léger et portable</p></div>
              <div className="bg-gray-50 dark:bg-[#2a2a2f] p-4 rounded-lg"><div className="flex items-center gap-2 mb-2"><Shield className="w-5 h-5 text-violet-600 dark:text-violet-400" /><h3 className="font-semibold text-gray-900 dark:text-white">Sécurité</h3></div><p className="text-sm text-gray-600 dark:text-gray-400">Isolation totale</p></div>
              <div className="bg-gray-50 dark:bg-[#2a2a2f] p-4 rounded-lg"><div className="flex items-center gap-2 mb-2"><Tool className="w-5 h-5 text-violet-600 dark:text-violet-400" /><h3 className="font-semibold text-gray-900 dark:text-white">Outils</h3></div><p className="text-sm text-gray-600 dark:text-gray-400">Suite pré-installée</p></div>
            </div>
          </div>
        </section>

        <section className={activeTab === 'installation' ? 'block' : 'hidden'}>
          <div className="bg-surface dark:bg-[#1a1a1f] p-6 rounded-lg border border-gray-200 dark:border-violet-900/20 shadow-sm dark:shadow-none">
            <h3 className="text-xl font-semibold text-violet-600 dark:text-violet-400 mb-6">Installation Rapide</h3>
            <div className="bg-gray-50 dark:bg-[#2a2a2f] p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Linux / WSL</h4>
              <pre className="bg-gray-900 dark:bg-[#1a1a1f] p-4 rounded-lg overflow-x-auto"><code className="text-sm text-violet-400">git clone https://github.com/ShutdownRepo/exegol.git{'\n'}cd exegol{'\n'}./install.sh{'\n'}exegol install full</code></pre>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
};