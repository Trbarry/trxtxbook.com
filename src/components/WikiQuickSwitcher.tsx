import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, ChevronRight, Hash } from 'lucide-react';
import { useWikiSearch } from '../hooks/useWikiPages';
import { WikiPageMetadata, WikiSearchResult } from '../types/wiki';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (page: WikiPageMetadata) => void;
}

export const WikiQuickSwitcher: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, query: activeQuery } = useWikiSearch(query);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Scroll l'item sélectionné dans le viewport
  useEffect(() => {
    const item = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      onSelect(results[selectedIndex]);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (page: WikiSearchResult) => {
    onSelect(page);
    onClose();
  };

  // Highlight le terme recherché dans le texte
  const highlight = (text: string, term: string) => {
    if (!term || term.length < 2) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase()
        ? <mark key={i} className="bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl bg-white dark:bg-[#13131a] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-white/10">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher dans toutes les notes..."
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-base focus:outline-none"
              />
              {isLoading && (
                <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin shrink-0" />
              )}
              <kbd className="hidden sm:inline text-[10px] text-gray-400 border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 font-mono">
                ESC
              </kbd>
            </div>

            {/* Résultats */}
            <div ref={listRef} className="max-h-[58vh] overflow-y-auto custom-scrollbar">
              {query.length < 2 ? (
                <div className="px-6 py-10 text-center">
                  <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Recherche dans le titre, le contenu et les tags</p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Tape au moins 2 caractères</p>
                </div>
              ) : results.length === 0 && !isLoading ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-gray-400">Aucun résultat pour <span className="text-gray-700 dark:text-gray-200 font-semibold">"{query}"</span></p>
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {results.map((result, i) => (
                    <button
                      key={result.id}
                      data-index={i}
                      onClick={() => handleSelect(result)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-start gap-3 border ${
                        i === selectedIndex
                          ? 'bg-violet-500/10 border-violet-500/30'
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 transition-colors ${
                        i === selectedIndex ? 'bg-violet-500/20 text-violet-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                      }`}>
                        <FileText size={14} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-sm font-bold truncate ${
                            i === selectedIndex ? 'text-violet-600 dark:text-violet-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {highlight(result.title, activeQuery)}
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 truncate">
                          {result.category}
                        </div>

                        {result.snippet && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-mono">
                            {result.snippet.replace(/[#*`>]/g, '').trim()}
                          </p>
                        )}

                        {result.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.tags.slice(0, 5).map(tag => (
                              <span key={tag} className={`flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded font-mono ${
                                tag.toLowerCase().includes(activeQuery.toLowerCase())
                                  ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400'
                                  : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                              }`}>
                                <Hash size={8} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <ChevronRight size={14} className={`shrink-0 mt-1 transition-colors ${
                        i === selectedIndex ? 'text-violet-500' : 'text-gray-300 dark:text-gray-600'
                      }`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/10 flex items-center gap-4 text-[10px] text-gray-400 bg-gray-50/50 dark:bg-white/2">
              <span className="flex items-center gap-1.5">
                <kbd className="border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 font-mono bg-white dark:bg-white/5">↑↓</kbd>
                naviguer
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 font-mono bg-white dark:bg-white/5">↵</kbd>
                ouvrir
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 font-mono bg-white dark:bg-white/5">Esc</kbd>
                fermer
              </span>
              {results.length > 0 && (
                <span className="ml-auto text-gray-300 dark:text-gray-600">
                  {results.length} résultat{results.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
