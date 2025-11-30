import React from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Shield, 
  Award, 
  Calendar, 
  Tag, 
  Terminal, 
  ArrowLeft, 
  Lock, 
  AlertTriangle,
  Target,
  Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Writeup } from '../types/writeup';

interface WriteupDetailProps {
  writeup: Writeup;
}

export const WriteupDetail: React.FC<WriteupDetailProps> = ({ writeup }) => {
  const navigate = useNavigate();
  
  // Logique pour les machines actives (Protection éthique)
  const isActiveMachine = writeup.slug === 'hackthebox-cat-analysis' || writeup.slug === 'hackthebox-dog';

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || '';
    if (d.includes('easy') || d.includes('facile')) return 'text-green-400 border-green-500/20 bg-green-500/5';
    if (d.includes('medium') || d.includes('moyen')) return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
    if (d.includes('hard') || d.includes('difficile')) return 'text-red-500 border-red-500/20 bg-red-500/5';
    return 'text-gray-400 border-gray-500/20 bg-gray-500/5';
  };

  const getWriteupImage = () => {
    if (writeup.slug === 'hackthebox-cat-analysis') return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/cat.htb.png";
    if (writeup.slug === 'hackthebox-dog') return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/dog.png";
    return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80";
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
      
      {/* Bouton Retour */}
      <button
        onClick={() => navigate('/writeups')}
        className="group mb-8 flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <div className="p-1 rounded-lg border border-white/10 group-hover:border-violet-500/50 bg-[#1a1a1f] transition-all">
            <ArrowLeft className="w-4 h-4" />
        </div>
        <span>Retour aux archives</span>
      </button>

      {/* BLOC PRINCIPAL */}
      <div className="bg-[#1a1a1f] rounded-2xl border border-white/5 overflow-hidden relative">
        
        {/* Header Image */}
        <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-[#1a1a1f]/50 to-transparent z-10" />
            <img
              src={getWriteupImage()}
              alt={writeup.title}
              className={`w-full h-full object-cover ${isActiveMachine ? 'blur-md opacity-50' : 'opacity-80'}`}
            />

            {/* Titre & Badges sur l'image */}
            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-lg text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        {writeup.platform || 'CTF'}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getDifficultyColor(writeup.difficulty)}`}>
                        {writeup.difficulty}
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{writeup.title}</h1>
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(writeup.created_at)}</span>
                    <span className="flex items-center gap-2"><Award className="w-4 h-4" /> {writeup.points} pts</span>
                </div>
            </div>

            {/* Overlay si Machine Active */}
            {isActiveMachine && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
                    <div className="bg-yellow-500/10 p-6 rounded-full border border-yellow-500/20 mb-6 animate-pulse">
                        <Lock className="w-16 h-16 text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Rapport Classifié</h2>
                    <p className="text-yellow-500/80 max-w-lg font-mono text-sm border border-yellow-500/20 bg-yellow-500/5 p-4 rounded-lg">
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        Machine actuellement active sur la plateforme. La publication de ce write-up est bloquée pour respecter les règles éthiques.
                    </p>
                </div>
            )}
        </div>

        {/* Contenu du Writeup */}
        {!isActiveMachine && (
            <div className="p-8 md:p-12">
                <div className="prose prose-invert prose-violet max-w-none 
                    prose-headings:font-bold prose-headings:text-white 
                    prose-h2:text-2xl prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-4 prose-h2:mt-12
                    prose-code:text-violet-300 prose-code:bg-black/50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-[#0a0a0f] prose-pre:border prose-pre:border-white/10
                    prose-strong:text-white prose-a:text-violet-400 hover:prose-a:text-violet-300">
                    
                    <ReactMarkdown>{writeup.content}</ReactMarkdown>
                </div>

                {/* Footer Tags */}
                <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-2">
                    <Terminal className="w-5 h-5 text-gray-500 mr-2" />
                    {writeup.tags?.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-[#0a0a0f] border border-white/10 rounded-full text-xs text-gray-400 font-mono flex items-center gap-1 hover:border-violet-500/50 hover:text-violet-300 transition-colors cursor-default">
                            <Hash className="w-3 h-3 opacity-50" />
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};