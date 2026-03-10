import React from 'react';
import { BookOpen, ArrowRight, Clock, ChevronRight } from 'lucide-react';
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

        {/* Cards DB */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-surface dark:bg-[#1a1a1f] animate-pulse rounded-2xl border border-gray-200 dark:border-white/5" />
            ))}
          </div>
        ) : (
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
