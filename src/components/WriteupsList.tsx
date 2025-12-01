import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Target, 
  Calendar, 
  Terminal, 
  Lock, 
  Hash, 
  FileWarning, 
  Filter, 
  Shield,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Writeup } from '../types/writeup';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from './SEOHead';
import { getOptimizedUrl } from '../lib/imageUtils';

export const WriteupsList: React.FC = () => {
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [filteredWriteups, setFilteredWriteups] = useState<Writeup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchWriteups();
  }, []);

  // Filtrage dynamique
  useEffect(() => {
    let results = writeups;

    // Filtre Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(w => 
        w.title.toLowerCase().includes(query) || 
        w.description?.toLowerCase().includes(query) ||
        w.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtre Plateforme
    if (selectedPlatform !== 'all') {
      results = results.filter(w => {
        if (selectedPlatform === 'htb') return w.slug.includes('hackthebox');
        if (selectedPlatform === 'thm') return w.slug.includes('tryhackme');
        if (selectedPlatform === 'rootme') return w.slug.includes('root-me');
        return true;
      });
    }

    setFilteredWriteups(results);
  }, [searchQuery, selectedPlatform, writeups]);

  const fetchWriteups = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('writeups')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWriteups(data || []);
      setFilteredWriteups(data || []);
    } catch (err: any) {
      console.error('Error fetching writeups:', err);
      setError('Impossible de charger les archives. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyStyles = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || '';
    if (d.includes('easy') || d.includes('facile')) return 'text-green-400 border-green-500/20 bg-green-500/5';
    if (d.includes('medium') || d.includes('moyen')) return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
    if (d.includes('hard') || d.includes('difficile') || d.includes('insane')) return 'text-red-500 border-red-500/20 bg-red-500/5';
    return 'text-gray-400 border-gray-500/20 bg-gray-500/5';
  };

  const getPlatformLabel = (slug: string) => {
    if (slug.includes('hackthebox')) return 'HackTheBox';
    if (slug.includes('tryhackme')) return 'TryHackMe';
    if (slug.includes('root-me')) return 'Root-Me';
    return 'CTF';
  };

  const getWriteupImage = (writeup: Writeup) => {
    // 1. Priorité absolue : L'image définie dans la base de données (Supabase)
    if (writeup.images && writeup.images.length > 0) {
      return writeup.images[0];
    }

    // 2. Fallbacks (Ancienne méthode "en dur", à garder au cas où)
    if (writeup.slug === 'hackthebox-cat-analysis') return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/cat.htb.png";
    if (writeup.slug === 'hackthebox-dog') return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/dog.png";
    
    // 3. Image par défaut (Si rien n'est trouvé)
    return "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80";
  };

  return (
    <>
      <SEOHead 
        title="Archives Write-ups & CTF | Tristan Barry"
        description="Base de connaissances techniques : rapports d'intrusion, solutions de CTF (HackTheBox, TryHackMe) et documentation de vulnérabilités."
      />
      
      <div className="min-h-screen pt-32 pb-24 bg-black text-gray-100">
        <div className="container mx-auto px-6">
          
          {/* En-tête de page */}
          <div className="flex flex-col items-center text-center mb-16">
            <div className="p-3 bg-[#1a1a1f] rounded-xl border border-white/10 mb-6">
              <Terminal className="w-10 h-10 text-violet-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Base de Connaissances
            </h1>
            <p className="text-gray-400 max-w-2xl text-lg">
              Documentation technique de mes opérations offensives. <br/>
              <span className="text-sm text-gray-500">HackTheBox • TryHackMe • Root-Me • Labs Personnels</span>
            </p>
          </div>

          {/* Barre de Contrôle (Search & Filter) */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-[#1a1a1f] rounded-2xl border border-white/5">
              
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Rechercher un rapport (nom, tag, CVE...)"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Platform Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                {[
                  { id: 'all', label: 'Tout' },
                  { id: 'htb', label: 'HackTheBox' },
                  { id: 'thm', label: 'TryHackMe' },
                  { id: 'rootme', label: 'Root-Me' }
                ].map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all border
                      ${selectedPlatform === platform.id 
                        ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20' 
                        : 'bg-black/30 text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'}`}
                  >
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* État de chargement / Erreur */}
          {loading ? (
            <div className="flex justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-violet-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Erreur système</h3>
              <p className="text-gray-400">{error}</p>
            </div>
          ) : filteredWriteups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#1a1a1f]/50 rounded-2xl border border-white/5">
              <Shield className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Aucun rapport trouvé</h3>
              <p className="text-gray-400">Essayez de modifier vos critères de recherche.</p>
            </div>
          ) : (
            /* Grille de Résultats */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {filteredWriteups.map((writeup) => {
                const isActiveMachine = false;
                
                return (
                  <div
                    key={writeup.id}
                    onClick={() => !isActiveMachine && navigate(`/writeups/${writeup.slug}`)}
                    className={`group relative bg-[#1a1a1f] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full
                             transition-all duration-300 ${isActiveMachine ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:border-violet-500/30 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]'}`}
                  >
                    {/* Image Header */}
                    <div className="relative h-48 overflow-hidden border-b border-white/5">
                      <img
                        src={getOptimizedUrl(getWriteupImage(writeup), 600)} // <-- Largeur 600px suffisante pour une carte
                         alt={writeup.title}
                         loading="lazy" // Ajoute aussi ça pour la perf
                          className="..."
                       />
                      
                      {/* Badge Platforme */}
                      <div className="absolute top-4 left-4 z-10">
                          <span className="px-2.5 py-1 bg-black/80 backdrop-blur border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-white">
                              {getPlatformLabel(writeup.slug || '')}
                          </span>
                      </div>

                      {/* Overlay Active Machine */}
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

                    {/* Contenu */}
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

                      <h3 className={`text-xl font-bold mb-3 line-clamp-1 ${isActiveMachine ? 'text-gray-500' : 'text-white group-hover:text-violet-400'} transition-colors`}>
                        {writeup.title}
                      </h3>

                      <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2 flex-grow">
                          {isActiveMachine 
                              ? <span className="flex items-center gap-2 text-yellow-500/80 italic"><FileWarning className="w-4 h-4"/> Contenu masqué pour conformité éthique.</span>
                              : writeup.description || "Analyse technique détaillée."}
                      </p>

                      {/* Footer Card */}
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="flex gap-2">
                              {writeup.tags?.slice(0, 2).map((tag, i) => (
                                  <span key={i} className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded flex items-center gap-1">
                                      <Hash className="w-3 h-3 text-violet-500/50" />
                                      {tag}
                                  </span>
                              ))}
                          </div>
                          
                          {!isActiveMachine && (
                              <ArrowRight className="w-4 h-4 text-violet-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};