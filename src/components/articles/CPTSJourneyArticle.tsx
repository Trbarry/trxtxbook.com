import React from 'react';
import { useSearchParams } from 'react-router-dom';
import './CPTSJourneyArticle.css';
import { Award, Calendar, FileText } from 'lucide-react';
import { CPTSJourneyArticleFrench } from './CPTSJourneyArticleFrench';
import { CPTSJourneyArticleEnglish } from './CPTSJourneyArticleEnglish';

export const CPTSJourneyArticle: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const selectedLanguage = params.get('lang') === 'fr' ? 'fr' : 'en';

  const languages = {
    en: {
      label: 'English',
      title: 'From INE eJPT to Hack The Box CPTS',
      subtitle: 'A focused 5-month journey to CPTS certification – From eJPT foundations to hands-on professional grade hacking',
    },
    fr: {
      label: 'Français',
      title: 'De l’eJPT à la CPTS de Hack The Box',
      subtitle: 'Un parcours complet de 5 mois vers la certification CPTS - retour d’expérience du niveau junior à la validation de la CPTS',
    }
  };

  const currentLang = languages[selectedLanguage];

  const selectLanguage = (lang: 'en' | 'fr') => {
    if (lang === selectedLanguage) return;
    const next = new URLSearchParams(params);
    next.set('lang', lang);
    setParams(next, { replace: true });
  };

  return (
    <article lang={selectedLanguage} className="mx-auto max-w-4xl px-5 pb-12 sm:px-8">
      <header className="mb-9 border-b border-line pb-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm font-semibold text-accent">Hack The Box / CPTS</span>
          <div role="group" aria-label={selectedLanguage === 'fr' ? 'Langue de lecture' : 'Reading language'} className="flex gap-1 rounded-md border border-line bg-surface p-1">
            {(['en', 'fr'] as const).map(lang => (
              <button key={lang} type="button" lang={lang}
                onClick={() => selectLanguage(lang)} aria-pressed={selectedLanguage === lang}
                className={`min-h-10 rounded px-3 text-sm font-medium ${selectedLanguage === lang
                  ? 'bg-accent text-surface'
                  : 'text-muted hover:text-text'}`}
              >
                {languages[lang].label}
              </button>
            ))}
          </div>
        </div>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-text sm:text-5xl">
          {currentLang.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{currentLang.subtitle}</p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <Calendar aria-hidden="true" className="h-4 w-4" />
            {selectedLanguage === 'en' ? 'January – May 2025' : 'Janvier – mai 2025'}
          </span>
          <span className="inline-flex items-center gap-2">
            <Award aria-hidden="true" className="h-4 w-4" />
            {selectedLanguage === 'en' ? 'CPTS Certified' : 'Certifié CPTS'}
          </span>
          <span className="inline-flex items-center gap-2">
            <FileText aria-hidden="true" className="h-4 w-4" />
            {selectedLanguage === 'en' ? '190-page Report' : 'Rapport de 190 pages'}
          </span>
        </div>
      </header>
      <div className="cpts-reading">
        {selectedLanguage === 'fr' ? <CPTSJourneyArticleFrench /> : <CPTSJourneyArticleEnglish />}
      </div>
    </article>
  );
};