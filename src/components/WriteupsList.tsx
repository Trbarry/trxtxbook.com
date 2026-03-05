import React, { useState, useEffect } from 'react';
import { Search, Calendar, Terminal, Lock, Hash, FileWarning, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { Writeup } from '../types/writeup';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from './SEOHead';
import { getOptimizedUrl, getWriteupCoverImage } from '../lib/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';

import { useWriteups } from '../hooks/useWriteups';

export const WriteupsList: React.FC = () => {
  const { writeups = [], isLoading, error: fetchError } = useWriteups();
  const [filteredWriteups, setFilteredWriteups] = useState<Writeup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    let results = writeups;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(w => 
        w.title.toLowerCase().includes(query) || 
        w.description?.toLowerCase().includes(query) || 
        w.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    if (selectedPlatform !== 'all') {
      results = results.filter(w => {
        const s = w.slug.toLowerCase();
        if (selectedPlatform === 'htb') return s.includes('hackthebox') || s.startsWith('htb-');
        if (selectedPlatform === 'thm') return s.includes('tryhackme') || s.startsWith('thm-');
        if (selectedPlatform === 'rootme') return s.includes('root-me');
        return true;
      });
    }
    setFilteredWriteups(results);
  }, [searchQuery, selectedPlatform, writeups]);

  const getDifficultyStyles = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || '';
    if (d.includes('easy') || d.includes('facile')) return 'text-green-600 dark:text-green-400 border-green-500/20 bg-green-500/10';
    if (d.includes('medium') || d.includes('moyen')) return 'text-orange-600 dark:text-orange-400 border-orange-500/20 bg-orange-500/10';
    if (d.includes('hard') || d.includes('difficile')) return 'text-red-600 dark:text-red-500 border-red-500/20 bg-red-100 dark:bg-red-500/5';
    if (d.includes('insane')) return 'text-purple-600 dark:text-purple-500 border-purple-500/20 bg-purple-500/10';
    return 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-500/20 bg-gray-100 dark:bg-gray-500/5';
  };

  const getDifficultyGlow = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || '';
    if (d.includes('easy') || d.includes('facile')) return 'group-hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)] group-hover:border-green-500/40';
    if (d.includes('medium') || d.includes('moyen')) return 'group-hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.2)] group-hover:border-orange-500/40';
    if (d.includes('hard') || d.includes('difficile')) return 'group-hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.25)] group-hover:border-red-500/40';
    if (d.includes('insane')) return 'group-hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)] group-hover:border-purple-500/50';
    return 'group-hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.2)] group-hover:border-violet-500/40';
  };

  const getDifficultyHoverGradient = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || '';
    if (d.includes('easy') || d.includes('facile')) return 'bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_70%)]';
    if (d.includes('medium') || d.includes('moyen')) return 'bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.08),transparent_70%)]';
    if (d.includes('hard') || d.includes('difficile')) return 'bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.08),transparent_70%)]';
    if (d.includes('insane')) return 'bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.12),transparent_70%)]';
    return 'bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_70%)]';
  };

  const getDifficultyAccent = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || '';
    if (d.includes('easy') || d.includes('facile')) return 'bg-green-500';
    if (d.includes('medium') || d.includes('moyen')) return 'bg-orange-500';
    if (d.includes('hard') || d.includes('difficile')) return 'bg-red-500';
    if (d.includes('insane')) return 'bg-purple-600';
    return 'bg-violet-600';
  };

  const getPlatformLabel = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('hackthebox') || s.startsWith('htb-')) return 'HackTheBox';
    if (s.includes('tryhackme') || s.startsWith('thm-')) return 'TryHackMe';
    if (s.includes('root-me')) return 'Root-Me';
    return 'CTF';
  };

  return (
    <>
      <SEOHead title="Archives Write-ups & CTF | Tristan Barry" description="Base de connaissances techniques regroupant mes rapports d'intrusion, analyses de vulnérabilités et résolutions de CTF sur HackTheBox, TryHackMe et d'autres plateformes." />
      
      <div className="min-h-screen pt-32 pb-24 bg-background transition-colors duration-300 text-gray-900 dark:text-gray-100">
        <div className="container mx-auto px-6">
          
          <div className="flex flex-col items-center text-center mb-16">
            <div className="p-3 bg-surface dark:bg-[#1a1a1f] rounded-xl border border-gray-200 dark:border-white/10 mb-6 shadow-md dark:shadow-none">
              <Terminal className="w-10 h-10 text-violet-600 dark:text-violet-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Base de Connaissances
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">
              Documentation technique de mes opérations offensives.
            </p>
          </div>

          {/* Barre de Contrôle */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-surface dark:bg-[#1a1a1f] rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg dark:shadow-none">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Rechercher un rapport (nom, tag, CVE...)"
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                {[ { id: 'all', label: 'Tout' }, { id: 'htb', label: 'HackTheBox' }, { id: 'thm', label: 'TryHackMe' }, { id: 'rootme', label: 'Root-Me' } ].map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all border
                      ${selectedPlatform === platform.id 
                        ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20' 
                        : 'bg-white dark:bg-black/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-violet-600 dark:hover:text-white'}`}
                  >
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-2 border-violet-500 border-t-transparent"></div></div>
          ) : filteredWriteups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface dark:bg-[#1a1a1f]/50 rounded-2xl border border-gray-200 dark:border-white/5">
              <Shield className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-500">Aucun rapport trouvé</h3>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <AnimatePresence mode='popLayout'>
                {filteredWriteups.map((writeup) => {
                  const isActiveMachine = writeup.is_active ?? false;
                  
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      key={writeup.id}
                      onClick={() => !isActiveMachine && navigate(`/writeups/${writeup.slug}`)}
                      className={`group relative bg-surface dark:bg-[#1a1a1f] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col h-full shadow-sm dark:shadow-none
                               transition-all duration-300 ${isActiveMachine ? 'cursor-not-allowed opacity-80' : `cursor-pointer hover:-translate-y-1 ${getDifficultyGlow(writeup.difficulty || '')}`}`}
                    >
                      {/* Effet de Gradient au Survol */}
                      {!isActiveMachine && (
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${getDifficultyHoverGradient(writeup.difficulty || '')}`} />
                      )}

                      {/* Accent de difficulté */}
                      {!isActiveMachine && (
                        <div className={`absolute left-0 top-0 bottom-0 w-1 z-30 opacity-0 group-hover:opacity-100 group-hover:w-1.5 transition-all duration-300 ${getDifficultyAccent(writeup.difficulty || '')}`} />
                      )}
                      <div className="relative h-48 overflow-hidden border-b border-gray-100 dark:border-white/5">
                        <img src={getOptimizedUrl(getWriteupCoverImage(writeup), 600)} alt={writeup.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute top-4 left-4 z-10">
                            <span className="px-2.5 py-1 bg-white/90 dark:bg-black/80 backdrop-blur border border-gray-200 dark:border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                                {getPlatformLabel(writeup.slug || '')}
                            </span>
                        </div>
                        {isActiveMachine && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-[2px]">
                            <div className="flex items-center gap-2 text-yellow-500 mb-2">
                                <Lock className="w-5 h-5" />
                                <span className="font-bold tracking-widest uppercase">Restricted</span>
                            </div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide border border-yellow-500/20 px-2 py-1 rounded bg-yellow-500/5">
                                Active Machine
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getDifficultyStyles(writeup.difficulty)}`}>
                                {writeup.difficulty || 'N/A'}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(writeup.created_at).toLocaleDateString('fr-FR')}
                            </div>
                        </div>

                        <h3 className={`text-xl font-bold mb-3 line-clamp-1 ${isActiveMachine ? 'text-gray-500' : 'text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400'} transition-colors`}>
                          {writeup.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2 flex-grow">
                            {isActiveMachine ? <span className="flex items-center gap-2 text-yellow-500/80 italic"><FileWarning className="w-4 h-4"/> Masqué (Machine active)</span> : writeup.description}
                        </p>

                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex gap-2">
                                {writeup.tags?.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="text-[10px] text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded flex items-center gap-1">
                                        <Hash className="w-3 h-3 text-violet-500/50" /> {tag}
                                    </span>
                                ))}
                            </div>
                            {!isActiveMachine && <ArrowRight className="w-4 h-4 text-violet-600 dark:text-violet-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};