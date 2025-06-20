import React, { useState } from 'react';
import { Terminal, Shield, Target, Code, Clock, Award, PenTool as Tool, BookOpen, ArrowRight } from 'lucide-react';

interface WriteupArticleProps {
  title: string;
  platform: string;
  difficulty: string;
  points: number;
  content: string;
  tags: string[];
}

export const WriteupArticle: React.FC<WriteupArticleProps> = ({
  title,
  platform,
  difficulty,
  points,
  content,
  tags
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'facile':
        return 'text-green-400';
      case 'moyen':
        return 'text-yellow-400';
      default:
        return 'text-red-400';
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* En-tête */}
      <header className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
          {title}
        </h1>
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm bg-violet-500/10 text-violet-300 px-3 py-1 rounded-full flex items-center gap-2">
            <Target className="w-4 h-4" />
            {platform}
          </span>
          <span className={`text-sm bg-violet-500/10 px-3 py-1 rounded-full flex items-center gap-2 ${getDifficultyColor(difficulty)}`}>
            <Shield className="w-4 h-4" />
            {difficulty}
          </span>
          <span className="text-sm bg-violet-500/10 text-violet-300 px-3 py-1 rounded-full flex items-center gap-2">
            <Award className="w-4 h-4" />
            {points} points
          </span>
        </div>
      </header>

      {/* Navigation */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'overview', icon: Target, label: 'Aperçu' },
          { id: 'exploitation', icon: Code, label: 'Exploitation' },
          { id: 'tools', icon: Tool, label: 'Outils' },
          { id: 'remediation', icon: Shield, label: 'Remédiation' }
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
        {/* Aperçu */}
        <section className={activeTab === 'overview' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-violet-400" />
              <h2 className="text-xl font-bold">Aperçu de la Machine</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-violet-400" />
                  <h3 className="font-semibold">Difficulté</h3>
                </div>
                <p className={`${getDifficultyColor(difficulty)}`}>{difficulty}</p>
              </div>
              
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-violet-400" />
                  <h3 className="font-semibold">Points</h3>
                </div>
                <p className="text-violet-400">{points}</p>
              </div>
              
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-violet-400" />
                  <h3 className="font-semibold">Temps Estimé</h3>
                </div>
                <p className="text-gray-400">2-3 heures</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-violet-400">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-sm bg-[#2a2a2f] text-gray-300 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Exploitation */}
        <section className={activeTab === 'exploitation' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="w-6 h-6 text-violet-400" />
              <h2 className="text-xl font-bold">Processus d'Exploitation</h2>
            </div>
            
            <div className="prose prose-invert max-w-none">
              {/* Contenu Markdown ici */}
            </div>
          </div>
        </section>

        {/* Outils */}
        <section className={activeTab === 'tools' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <div className="flex items-center gap-3 mb-6">
              <Tool className="w-6 h-6 text-violet-400" />
              <h2 className="text-xl font-bold">Outils Utilisés</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Reconnaissance</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-violet-400" />
                    <span>nmap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-violet-400" />
                    <span>dirsearch</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Exploitation</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-violet-400" />
                    <span>sqlmap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-violet-400" />
                    <span>burpsuite</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Remédiation */}
        <section className={activeTab === 'remediation' ? 'block' : 'hidden'}>
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-violet-400" />
              <h2 className="text-xl font-bold">Remédiation</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-violet-400">Recommandations</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-violet-400 mt-1" />
                    <span>Mettre à jour les composants vulnérables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-violet-400 mt-1" />
                    <span>Implémenter une politique de sécurité stricte</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Références */}
      <div className="mt-8">
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-violet-400" />
            <h2 className="text-xl font-bold">Références</h2>
          </div>
          
          <div className="space-y-3">
            <a 
              href="https://owasp.org" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors group"
            >
              <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
              <span>OWASP Top 10</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};