import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { IntroSection } from './cpts/sections/IntroSection';
import { ModulesSection } from './cpts/sections/ModulesSection';
import { StrategySection } from './cpts/sections/StrategySection';
import { ToolsSection } from './cpts/sections/ToolsSection';
import { ExamWeekSection } from './cpts/sections/ExamWeekSection';
import { ReportSection } from './cpts/sections/ReportSection';
import { TipsSection } from './cpts/sections/TipsSection';
import { ConclusionSection } from './cpts/sections/ConclusionSection';

export const CPTSJourneyArticleFrench: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* CPTS Hero Section */}
      <div className="relative mb-16">
        <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-xl border border-violet-900/30 bg-gradient-to-b from-[#0f0f14] via-[#181821] to-[#1a1a1f] p-6 md:p-10">
          <img
            src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/cptsimage.png"
            alt="CPTS Journey Artwork"
            className="w-full h-auto mx-auto object-contain md:max-h-[400px] transition-transform duration-500 hover:scale-[1.03]"
          />
        </div>
      </div>

      {/* Table of Contents */}
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20 mb-12">
        <h2 className="text-xl font-bold text-violet-400 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Table des matières
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            'Introduction & Accroche',
            'Les 28 Modules de la CPTS',
            'Stratégie d\'Apprentissage',
            'Outils & Environnement',
            'La Semaine d\'Examen',
            'Le Rapport de 190 Pages',
            'Tips & Tricks — Cheat-Sheet',
            'Réflexion post-examen & Suite',
            'Ressources & Remerciements',
            'Conclusion & Motivation',
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-400 hover:text-violet-400 transition-colors">
              <ArrowRight className="w-3 h-3" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <IntroSection />
      <ModulesSection />
      <StrategySection />
      <ToolsSection />
      <ExamWeekSection />
      <ReportSection />
      <TipsSection />
      <ConclusionSection />
    </div>
  );
};
