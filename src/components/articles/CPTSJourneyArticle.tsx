import React, { useState } from 'react';
import { Award, Calendar, Target, BookOpen, Brain, Shield, Terminal, Users, Lightbulb, CheckCircle2, Clock, FileText, Zap, Coffee, Monitor, Network, Lock, Code, ArrowRight, TrendingUp, Cpu, Database, ChevronDown, Globe } from 'lucide-react';
import { CPTSJourneyArticleFrench } from './CPTSJourneyArticleFrench';
import { CPTSJourneyArticleEnglish } from './CPTSJourneyArticleEnglish';

export const CPTSJourneyArticle: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'fr'>('fr');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const languages = {
    en: {
      label: 'English',
      flag: '🇺🇸',
      title: 'From eJPT to CPTS: My Journey into Professional Pentesting',
      subtitle: 'A comprehensive 5-month journey to CPTS certification - Complete experience report from junior to professional pentester',
      finalMessage: 'From junior pentester to CPTS certified professional - this journey has been transformative. The road was challenging, but every hour invested was worth it for the skills and confidence gained.',
      journeyComplete: 'Journey Complete'
    },
    fr: {
      label: 'Français',
      flag: '🇫🇷',
      title: 'De l\'eJPT au CPTS : Mon Parcours vers le Pentesting Professionnel',
      subtitle: 'Un parcours complet de 5 mois vers la certification CPTS - Retour d\'expérience complet du niveau junior au professionnel en pentesting',
      finalMessage: 'Du pentester junior au professionnel certifié CPTS - ce parcours a été transformateur. Le chemin était difficile, mais chaque heure investie en valait la peine pour les compétences et la confiance acquises.',
      journeyComplete: 'Parcours Terminé'
    }
  };

  const currentLang = languages[selectedLanguage];

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const selectLanguage = (lang: 'en' | 'fr') => {
    setSelectedLanguage(lang);
    setIsLanguageDropdownOpen(false);
  };

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* Sélecteur de langue */}
      <div className="fixed top-24 right-6 z-50">
        <div className="relative">
          <button
            onClick={toggleLanguageDropdown}
            className="flex items-center gap-2 bg-[#1a1a1f] border border-violet-900/20 hover:border-violet-500/50 
                     px-4 py-2 rounded-lg transition-all duration-300 shadow-lg backdrop-blur-sm"
          >
            <Globe className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium">{currentLang.flag} {currentLang.label}</span>
            <ChevronDown className={`w-4 h-4 text-violet-400 transition-transform duration-300 
                                  ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLanguageDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 bg-[#1a1a1f] border border-violet-900/20 
                          rounded-lg shadow-xl backdrop-blur-sm min-w-[160px] overflow-hidden">
              {Object.entries(languages).map(([key, lang]) => (
                <button
                  key={key}
                  onClick={() => selectLanguage(key as 'en' | 'fr')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-violet-500/10 
                            transition-colors duration-200 ${selectedLanguage === key ? 'bg-violet-500/20' : ''}`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.label}</span>
                  {selectedLanguage === key && (
                    <CheckCircle2 className="w-4 h-4 text-violet-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* En-tête */}
      <header className="text-center mb-16 space-y-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent leading-tight">
          {currentLang.title}
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          {currentLang.subtitle}
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2 bg-[#1a1a1f] px-4 py-2 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>{selectedLanguage === 'en' ? 'January - May 2025' : 'Janvier - Mai 2025'}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1a1a1f] px-4 py-2 rounded-lg">
            <Award className="w-4 h-4 text-violet-400" />
            <span>{selectedLanguage === 'en' ? 'CPTS Certified' : 'Certifié CPTS'}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1a1a1f] px-4 py-2 rounded-lg">
            <FileText className="w-4 h-4 text-green-400" />
            <span>{selectedLanguage === 'en' ? '190-page Report' : 'Rapport de 190 pages'}</span>
          </div>
        </div>
      </header>

      {/* Contenu selon la langue sélectionnée */}
      {selectedLanguage === 'fr' ? <CPTSJourneyArticleFrench /> : <CPTSJourneyArticleEnglish />}
    </article>
  );
};