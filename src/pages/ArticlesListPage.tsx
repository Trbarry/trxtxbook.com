import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Clock, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEOHead } from '../components/SEOHead';
import { useArticles } from '../hooks/useArticles';
import { ArticleMetadata } from '../types/article';

const ArticleCard: React.FC<{ article: ArticleMetadata; onClick: () => void; index: number }> = ({ article, onClick, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    onClick={onClick}
    className="group relative bg-white dark:bg-[#13131a]/80 border border-gray-200 dark:border-white/5 rounded-2xl p-6 cursor-pointer hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 flex flex-col gap-4 overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-violet-600 transition-all duration-300 rounded-l-2xl" />
    <div className="flex items-center justify-between">
      <span className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-[10px] font-bold uppercase tracking-wider rounded-full">{article.category}</span>
      <ChevronRight size={16} className="text-gray-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-violet-500 transition-colors leading-snug line-clamp-2 mb-2">{article.title}</h3>
      {article.description && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">{article.description}</p>}
    </div>
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
      <div className="flex flex-wrap gap-1.5">
        {article.tags?.slice(0, 2).map(tag => (<span key={tag} className="text-[9px] bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-gray-500 font-mono">#{tag}</span>))}
      </div>
      <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono whitespace-nowrap">
        <span className="flex items-center gap-1"><Clock size={10} />~15 min</span>
        <span className="flex items-center gap-1"><Calendar size={10} />{new Date(article.updated_at).toLocaleDateString('fr-FR')}</span>
      </div>
    </div>
  </motion.div>
);

export const ArticlesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { articles = [], isLoading } = useArticles();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => Array.from(new Set(articles.map(a => a.category))).sort(), [articles]);

  const filtered = useMemo(() => articles.filter(a => {
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()) || a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !activeCategory || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  }), [articles, search, activeCategory]);

  return (
    <>
      <SEOHead title="Articles Techniques | Tristan Barry" description="Guides techniques approfondis sur la cybersécurité, l'Active Directory, le pentesting et plus." />
      <div className="min-h-screen bg-background pt-24 pb-20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-xs font-medium mb-4">
              <BookOpen className="w-3.5 h-3.5" /><span>Guides Techniques</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-4">Articles</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">Guides approfondis sur la cybersécurité, l'Active Directory, le pentesting — écrits pour durer.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher un article..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#13131a] border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-violet-500/50 placeholder-gray-400 transition-colors" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setActiveCategory(null)} className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${!activeCategory ? 'bg-violet-600 text-white border-violet-600' : 'bg-white dark:bg-[#13131a] text-gray-500 border-gray-200 dark:border-white/10 hover:border-violet-500/50'}`}>Tous</button>
              {categories.map(cat => (<button key={cat} onClick={() => setActiveCategory(cat === activeCategory ? null : cat)} className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeCategory === cat ? 'bg-violet-600 text-white border-violet-600' : 'bg-white dark:bg-[#13131a] text-gray-500 border-gray-200 dark:border-white/10 hover:border-violet-500/50'}`}>{cat}</button>))}
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 dark:bg-white/5 animate-pulse rounded-2xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500"><BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" /><p className="font-medium">Aucun article trouvé.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article, i) => (<ArticleCard key={article.id} article={article} index={i} onClick={() => navigate(`/articles/${article.slug}`)} />))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
