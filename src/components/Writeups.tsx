import React, { useState, useEffect } from 'react';
import { getOptimizedUrl } from '../lib/imageUtils';
import { 
  Target, 
  ArrowRight, 
  AlertCircle, 
  Calendar, 
  Terminal, 
  Shield, 
  Lock, 
  Eye,
  Hash
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Writeup } from '../types/writeup';
import { useNavigate } from 'react-router-dom';

export const Writeups: React.FC = () => {
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWriteups();
  }, []);

  const fetchWriteups = async () => {
    try {
      setError(null);
      // On récupère les 3 derniers writeups publiés
      const { data, error } = await supabase
        .from('writeups')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setWriteups(data || []);
    } catch (err: any) {
      console.error('Error fetching writeups:', err);
      setError('Impossible de charger les rapports récents.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'facile': case 'easy': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'moyen': case 'medium': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'difficile': case 'hard': case 'insane': return 'text-red-500 border-red-500/30 bg-red-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const getPlatformIcon = (slug: string) => {
    if (slug.includes('hackthebox')) return 'HTB';
    if (slug.includes('tryhackme')) return 'THM';
    if (slug.includes('root-me')) return 'RM';
    return 'CTF';
  };

  const getWriteupImage = (writeup: Writeup) => {
    if (writeup.images && writeup.images.length > 0) {
      return writeup.images[0];
    }
    
    if (writeup.slug === 'hackthebox-cat-analysis') return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/cat.htb.png";
    if (writeup.slug === 'hackthebox-dog') return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/dog.png";
    return "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80";
  };

  return (
    <section id="writeups" className="py-24 bg-black relative">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1a1a1f] rounded-xl border border-white/10">
              <Terminal className="w-8 h-8 text-violet-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Rapports d'Intrusion</h2>
              <p className="text-gray-500 text-sm mt-1">Documentation technique des machines compromises</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/writeups')}
            className="group flex items-center gap-2 text-sm font-medium bg-[#1a1a1f] text-gray-300 px-5 py-3 rounded-xl
                     border border-white/10 hover:border-violet-500/50 hover:text-white transition-all duration-300"
          >
            <span>Archives complètes</span>
            <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* État de chargement / Erreur */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-[#1a1a1f] rounded-xl border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-400">{error}</p>
          </div>
        ) : (
          /* Grille des Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {writeups.map((writeup) => {
              // Logique "Machine Active"
              const isActiveMachine = false;
              
              return (
                <div
                  key={writeup.id}
                  onClick={() => !isActiveMachine && navigate(`/writeups/${writeup.slug}`)}
                  className={`group relative bg-[#1a1a1f] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full
                           transition-all duration-300 ${isActiveMachine ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:-translate-y-2 hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]'}`}
                >
                  {/* Image Header */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                    src={getOptimizedUrl(getWriteupImage(writeup), 600)}
                     alt={writeup.title}
                    loading="lazy"
                     className="..."
                     />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-[#1a1a1f]/60 to-transparent" />
                    
                    {/* Badge Platforme */}
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-white shadow-xl">
                            {getPlatformIcon(writeup.slug || '')}
                        </span>
                    </div>

                    {/* Overlay Machine Active */}
                    {isActiveMachine && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                        <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/20 mb-2">
                            <Lock className="w-6 h-6 text-yellow-500" />
                        </div>
                        <span className="text-yellow-500 font-bold text-sm tracking-widest uppercase border border-yellow-500/30 px-3 py-1 rounded bg-black/50">
                            Classified / Active
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-6 pt-2 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getDifficultyColor(writeup.difficulty)}`}>
                            {writeup.difficulty || 'Unknown'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(writeup.created_at).toLocaleDateString('fr-FR')}
                        </div>
                    </div>

                    <h3 className={`text-xl font-bold mb-3 line-clamp-1 ${isActiveMachine ? 'text-gray-500' : 'text-white group-hover:text-violet-400'} transition-colors`}>
                      {writeup.title}
                    </h3>

                    <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2 flex-grow">
                        {isActiveMachine 
                            ? "Le rapport est verrouillé car la machine est toujours active sur la plateforme. Conformité éthique." 
                            : writeup.description || "Analyse technique détaillée de la compromission : reconnaissance, exploitation et élévation de privilèges."}
                    </p>

                    {/* Footer Card */}
                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="flex items-center gap-3">
                            {writeup.tags?.slice(0, 2).map((tag, i) => (
                                <div key={i} className="flex items-center gap-1 text-xs text-gray-500">
                                    <Hash className="w-3 h-3 text-violet-500/50" />
                                    {tag}
                                </div>
                            ))}
                        </div>
                        
                        {!isActiveMachine && (
                            <div className="flex items-center gap-2 text-xs font-bold text-violet-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                Lire le rapport
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};