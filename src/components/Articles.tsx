import React from 'react';
import { BookOpen, ArrowRight, Clock, ChevronRight, Trophy, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';

export const Articles: React.FC = () => {
  const { articles = [], isLoading } = useArticles();
  const navigate = useNavigate();
  const latest = articles.slice(0, 3);

  return (
    <section id="articles" className="py-24 bg-background transition-colors duration-300 relative">
      <div className="container mx-auto px-6 relative z-10">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-surface dark:bg-[#1a1a1f] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <BookOpen className="w-8 h-8 text-violet-600 dark:text-violet-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Articles Techniques</h2>
              <p className="text-gray-600 dark:text-gray-500 text-sm mt-1">Guides approfondis sur la cybersécurité et l'Active Directory</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/articles')}
            className="group flex items-center gap-2 text-sm font-medium bg-surface dark:bg-[#1a1a1f] text-gray-700 dark:text-gray-300 px-5 py-3 rounded-xl
                     border border-gray-200 dark:border-white/10 hover:border-violet-500/50 hover:text-violet-600 dark:hover:text-white transition-all duration-300 shadow-sm dark:shadow-none"
          >
            <span>Tous les articles</span>
            <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* ── Featured: CPTS Journey ── */}
        <div
          onClick={() => navigate('/articles/cpts-journey')}
          className="group relative rounded-2xl overflow-hidden cursor-pointer mb-6
                     border border-violet-500/25 hover:border-violet-500/60
                     hover:shadow-[0_24px_60px_-12px_rgba(139,92,246,0.35)] hover:-translate-y-1
                     transition-all duration-300"
        >
          {/* Fond dégradé + grille */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#12101a] via-[#1a1527] to-[#0f0f14]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          {/* Glow violet */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/15 transition-colors duration-500" />

          <div className="relative z-10 flex flex-col md:flex-row items-stretch gap-0">

            {/* Image CPTS — côté droit sur desktop */}
            <div className="order-first md:order-last md:w-64 lg:w-80 flex-shrink-0 relative overflow-hidden min-h-[160px] md:min-h-0">
              <img
                src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/cptsimage.png"
                alt="CPTS Journey"
                className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105 p-4"
              />
              <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent to-[#12101a] pointer-events-none" />
            </div>

            {/* Contenu */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
              <div>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300">
                    <Trophy size={10} /> Article phare
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/5 border border-white/10 text-gray-400">
                    Certification HTB
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/5 border border-white/10 text-gray-400">
                    <Globe size={10} /> FR / EN
                  </span>
                </div>

                {/* Titre */}
                <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-violet-300 transition-colors duration-200 mb-3 leading-snug">
                  CPTS Journey — De l'eJPT à la certification Hack The Box
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 max-w-xl">
                  5 mois de préparation, un examen de 10 jours, un rapport de 190 pages.
                  Retour d'expérience complet : outils, stratégie, semaine d'examen, tips & tricks.
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                  <span className="flex items-center gap-1"><Clock size={11} /> ~45 min</span>
                  <span className="text-white/10">·</span>
                  <span>190 pages de rapport</span>
                </div>
                <span className="flex items-center gap-1.5 text-sm font-bold text-violet-400 group-hover:gap-2.5 transition-all duration-200">
                  Lire l'article <ChevronRight size={15} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cards DB */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-surface dark:bg-[#1a1a1f] animate-pulse rounded-2xl border border-gray-200 dark:border-white/5" />
            ))}
          </div>
        ) : latest.length === 0 ? null : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map((article) => (
              <div
                key={article.id}
                onClick={() => navigate(`/articles/${article.slug}`)}
                className="group relative rounded-2xl border border-gray-200 dark:border-white/5 cursor-pointer
                           hover:border-violet-500/40 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.25)] hover:-translate-y-1
                           transition-all duration-300 flex flex-col overflow-hidden min-h-[220px]"
              >
                {article.cover_image_url ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${article.cover_image_url})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-surface dark:bg-[#1a1a1f]" />
                )}

                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                <div className="relative z-10 p-6 flex flex-col gap-3 flex-1">
                  <span className={`inline-flex self-start px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border
                    ${article.cover_image_url
                      ? 'bg-black/40 border-white/20 text-white backdrop-blur-sm'
                      : 'bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-300'}`}>
                    {article.category}
                  </span>

                  <h3 className={`font-bold text-lg leading-snug line-clamp-2 flex-1 group-hover:text-violet-400 transition-colors
                    ${article.cover_image_url ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {article.title}
                  </h3>

                  <div className={`flex items-center justify-between pt-3 border-t
                    ${article.cover_image_url ? 'border-white/10' : 'border-gray-100 dark:border-white/5'}`}>
                    <div className={`flex items-center gap-1.5 text-xs font-mono
                      ${article.cover_image_url ? 'text-white/60' : 'text-gray-400'}`}>
                      <Clock size={11} />
                      <span>~15 min</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-violet-400 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                      Lire <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
