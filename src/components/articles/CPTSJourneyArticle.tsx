import React, { useState } from 'react';
import { Award, Calendar, CheckCircle2, FileText } from 'lucide-react';
import { CPTSJourneyArticleFrench } from './CPTSJourneyArticleFrench';
import { CPTSJourneyArticleEnglish } from './CPTSJourneyArticleEnglish';

export const CPTSJourneyArticle: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'fr'>('en');

  const languages = {
    en: {
      label: 'English',
      flag: '🇺🇸',
      title: 'CPTS Review : from INE EJPT to HackTheBox CPTS certified',
      subtitle: 'A focused 5-month journey to CPTS certification – From eJPT foundations to hands-on professional grade hacking',
    },
    fr: {
      label: 'Français',
      flag: '🇫🇷',
      title: 'CPTS Review : De l\'EJPT a la CPTS de HackTheBox',
      subtitle: 'Un parcours complet de 5 mois vers la certification CPTS - Retour d\'expérience complet du niveau junior a la validation de la CPTS',
    }
  };

  const currentLang = languages[selectedLanguage];

  const selectLanguage = (lang: 'en' | 'fr') => {
    if (lang === selectedLanguage) return;
    setSelectedLanguage(lang);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* Language toggle — fixed pill */}
      <div className="fixed top-24 right-6 z-50">
        <div className="flex items-center bg-[#1a1a1f] border border-violet-900/30 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm">
          {(['en', 'fr'] as const).map((lang, i) => (
            <React.Fragment key={lang}>
              {i > 0 && <div className="w-px h-6 bg-violet-900/40" />}
              <button
                onClick={() => selectLanguage(lang)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200
                  ${selectedLanguage === lang
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-violet-500/10'
                  }`}
              >
                <span>{languages[lang].flag}</span>
                <span className="hidden sm:inline">{languages[lang].label}</span>
              </button>
            </React.Fragment>
          ))}
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