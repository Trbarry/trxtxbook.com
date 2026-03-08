import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Hash, AlertTriangle, Heart, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { TableOfContents } from '../components/TableOfContents';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { ReadingProgressBar } from '../components/ReadingProgressBar';
import { useArticle, useArticles, useArticleViews, useLikeArticle } from '../hooks/useArticles';
import { extractHeadings } from '../lib/markdownUtils';

const getReadingTime = (text: string): number => {
  const words = text.trim().split(/\s+/g).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { article, isLoading } = useArticle(slug);
  const { articles = [] } = useArticles();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const views = useArticleViews(slug);
  const { liked, count: likeCount, toggle: toggleLike } = useLikeArticle(article);

  const toc = React.useMemo(
    () => (article?.content ? extractHeadings(article.content) : []),
    [article?.content]
  );

  const related = React.useMemo(
    () => articles.filter(a => a.slug !== slug && a.category === article?.category).slice(0, 3),
    [articles, slug, article?.category]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-background text-center px-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Article introuvable</h2>
        <p className="text-gray-500 mb-6">Cet article n'existe pas ou a été déplacé.</p>
        <button onClick={() => navigate('/articles')} className="px-6 py-2 bg-violet-600 text-white rounded-lg font-bold">
          Retour aux articles
        </button>
      </div>
    );
  }

  return (
    <>
      <ReadingProgressBar />

      <SEOHead
        title={`${article.title} | Tristan Barry`}
        description={article.description || `Guide technique : ${article.title}`}
        keywords={article.tags?.join(', ')}
        type="article"
        publishedTime={article.created_at}
      />

      {/* Cover banner */}
      {article.cover_image_url && (
        <div className="relative w-full h-64 md:h-80 mt-16 overflow-hidden">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        </div>
      )}

      <div className={`min-h-screen bg-background pb-20 transition-colors duration-300 ${article.cover_image_url ? 'pt-4' : 'pt-24'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-10">

          {/* CONTENU PRINCIPAL */}
          <div className="flex-1 min-w-0">

            {/* Retour */}
            <button
              onClick={() => navigate('/articles')}
              className="group mb-8 flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <div className="p-1 rounded-lg border border-gray-200 dark:border-white/10 group-hover:border-violet-500/50 bg-white dark:bg-[#1a1a1f] transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span>Retour aux articles</span>
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero */}
              <div className="mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
                <span className="inline-block px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-[10px] font-bold uppercase tracking-wider rounded-full mb-4">
                  {article.category}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
                  {article.title}
                </h1>
                {article.description && (
                  <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                    {article.description}
                  </p>
                )}

                {/* Méta */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full border border-gray-200 dark:border-white/10">
                    <Clock className="w-3 h-3" />{getReadingTime(article.content)} min de lecture
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full border border-gray-200 dark:border-white/10">
                    <Eye className="w-3 h-3" />{views.toLocaleString('fr-FR')} vues
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full border border-gray-200 dark:border-white/10">
                    <Calendar className="w-3 h-3" />Mis à jour le {new Date(article.updated_at).toLocaleDateString('fr-FR')}
                  </span>
                  {article.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-white/10">
                      <Hash className="w-3 h-3" />{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contenu Markdown */}
              <MarkdownRenderer content={article.content} onImageClick={setSelectedImage} />

              {/* Like button */}
              <div className="mt-16 flex justify-center">
                <button
                  onClick={toggleLike}
                  disabled={liked}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 ${
                    liked
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-500 cursor-default'
                      : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 hover:border-violet-500/50 hover:text-violet-500 hover:bg-violet-500/5'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 transition-transform ${liked ? 'fill-violet-500 scale-110' : 'group-hover:scale-110'}`}
                  />
                  <span className="font-mono text-sm font-bold">{likeCount}</span>
                  <span className="text-sm">{liked ? 'Merci !' : 'Cet article vous a aidé ?'}</span>
                </button>
              </div>

              {/* Articles liés */}
              {related.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Articles liés</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {related.map(rel => (
                      <button
                        key={rel.id}
                        onClick={() => navigate(`/articles/${rel.slug}`)}
                        className="text-left p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-violet-500/30 transition-all group"
                      >
                        <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-violet-500 transition-colors line-clamp-2">
                          {rel.title}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{rel.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* TOC */}
          {toc.length > 0 && <TableOfContents items={toc} />}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage} className="max-w-full max-h-full rounded-xl shadow-2xl" alt="Zoom"
            />
            <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
