import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead } from '../components/SEOHead';
import { useArticles } from '../hooks/useArticles';
import { ArticleMetadata } from '../types/article';

const ArticleCard: React.FC<{ article: ArticleMetadata; onClick: () => void; index: number }> = ({ article, onClick, index }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2, delay: index * 0.05 }}
    onClick={onClick}
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
          {article.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 dark:bg-black text-gray-600 dark:text-gray-500 px-2 py-1 rounded border border-gray-200 dark:border-white/5">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 text-sm font-medium">
          <span className="flex items-center gap-1.5 text-gray-500 text-xs font-mono">
            <Clock size={11} /> ~15 min
          </span>
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-white group-hover:bg-violet-600 group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export const ArticlesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { articles: dbArticles = [], isLoading } = useArticles();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(dbArticles.map(a => a.category));
    return Array.from(cats).sort();
  }, [dbArticles]);

  const filtered = useMemo(() => {
    return dbArticles.filter(a => {
      const matchesSearch = !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !activeCategory || a.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [dbArticles, search, activeCategory]);

  return (
    <>
      <SEOHead
        title="Articles Techniques | Tristan Barry"
        description="Guides techniques approfondis sur la cybersécurité, l'Active Directory, le pentesting et plus."
      />
      <div className="min-h-screen bg-background pt-24 pb-20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          {/* Header */}
          <div className="mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-xs font-medium mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guides Techniques</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
              Articles
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
              Guides approfondis sur la cybersécurité, l'Active Directory, le pentesting — écrits pour durer.
            </p>
          </div>

          {/* Search + Filtres */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#13131a] border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-violet-500/50 placeholder-gray-400 transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  !activeCategory
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white dark:bg-[#13131a] text-gray-500 border-gray-200 dark:border-white/10 hover:border-violet-500/50'
                }`}
              >
                Tous
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    activeCategory === cat
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white dark:bg-[#13131a] text-gray-500 border-gray-200 dark:border-white/10 hover:border-violet-500/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grille */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-surface dark:bg-white/5 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Aucun article trouvé.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <AnimatePresence mode='popLayout'>
                {filtered.map((article, i) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    index={i}
                    onClick={() => navigate(`/articles/${article.slug}`)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};
