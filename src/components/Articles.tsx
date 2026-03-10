import React from 'react';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-surface dark:bg-[#1a1a1f] animate-pulse rounded-2xl border border-gray-200 dark:border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latest.map((article) => (
              <div
                key={article.id}
                onClick={() => navigate(`/articles/${article.slug}`)}
                className="group relative bg-surface dark:bg-[#1a1a1f] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col h-full
                           hover:border-violet-500/30 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]
                           transition-all duration-300 cursor-pointer shadow-sm dark:shadow-none"
              >
                {/* Image Header */}
                <div className="relative h-56 overflow-hidden border-b border-gray-100 dark:border-white/5">
                  <div className="absolute inset-0 bg-violet-900/20 group-hover:bg-transparent transition-colors z-10 duration-500" />
                  {article.cover_image_url ? (
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-900/30 via-[#1a1a1f] to-[#0f0f14]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface dark:from-[#1a1a1f] via-surface/40 dark:via-[#1a1a1f]/40 to-transparent opacity-90 z-10" />
                  <div className="absolute top-4 right-4 z-20">
                    <span className="bg-white/90 dark:bg-black/80 backdrop-blur-md text-gray-900 dark:text-white px-3 py-1.5 rounded-lg
                                     flex items-center gap-1.5 text-[10px] font-bold border border-gray-200 dark:border-white/10 uppercase tracking-wide shadow-sm">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6 flex-1 flex flex-col relative z-20">
                  <div className="-mt-10 mb-4">
                    <div className="w-12 h-12 bg-surface dark:bg-[#1a1a1f] rounded-xl border border-gray-200 dark:border-white/10 p-1 flex items-center justify-center shadow-lg dark:shadow-xl group-hover:border-violet-500/50 transition-colors">
                      <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-3 line-clamp-2">
                    {article.title}
                  </h3>

                  {article.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3 flex-grow">
                      {article.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-4 mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {article.tags?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 dark:bg-black text-gray-600 dark:text-gray-500 px-2 py-1 rounded border border-gray-200 dark:border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 text-sm font-medium">
                      <span className="flex items-center gap-1.5 text-gray-500 text-xs font-mono">
                        <Clock size={11} /> ~{article.reading_time} min
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-white group-hover:bg-violet-600 group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
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
