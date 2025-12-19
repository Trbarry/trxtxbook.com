import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getOptimizedUrl } from '../lib/imageUtils';
import { Shield, Award, Calendar, Terminal, ArrowLeft, Lock, AlertTriangle, Target, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Writeup } from '../types/writeup';

interface WriteupDetailProps {
  writeup: Writeup;
}

export const WriteupDetail: React.FC<WriteupDetailProps> = ({ writeup }) => {
  const navigate = useNavigate();
  const isActiveMachine = false;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDifficultyColor = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || '';
    if (d.includes('easy') || d.includes('facile')) return 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20 bg-green-100 dark:bg-green-500/5';
    if (d.includes('medium') || d.includes('moyen')) return 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 bg-orange-100 dark:bg-orange-500/5';
    if (d.includes('hard') || d.includes('difficile')) return 'text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20 bg-red-100 dark:bg-red-500/5';
    if (d.includes('insane')) return 'text-purple-600 dark:text-purple-500 border-purple-200 dark:border-purple-500/20 bg-purple-100 dark:bg-purple-500/5';
    return 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20 bg-gray-100 dark:bg-gray-500/5';
  };

  const getWriteupImage = () => {
    // 1. Priorité aux images stockées en base de données
    if (writeup.images && writeup.images.length > 0) return writeup.images[0];

    // 2. Fallbacks Hardcodés (Sécurité & Performance)
    if (writeup.slug === 'hackthebox-forest') return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/foresthtb.png";
    if (writeup.slug === 'hackthebox-cat-analysis') return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/cat.htb.png";
    if (writeup.slug === 'hackthebox-dog') return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/dog.png";
    if (writeup.slug === 'hackthebox-reddish') return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/reddish.webp";
    if (writeup.slug === 'tryhackme-skynet') return "https://tryhackme-images.s3.amazonaws.com/room-icons/1559e2e8a4e1a3.png";
    
    // Ajout spécifique pour Soccer avec le lien fourni
    if (writeup.slug === 'htb-soccer') return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/soccerhtb.png";

    // 3. Image par défaut si aucun slug ne correspond
    return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80";
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
      
      <button
        onClick={() => navigate('/writeups')}
        className="group mb-8 flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <div className="p-1 rounded-lg border border-gray-200 dark:border-white/10 group-hover:border-violet-500/50 bg-white dark:bg-[#1a1a1f] transition-all">
            <ArrowLeft className="w-4 h-4" />
        </div>
        <span>Retour aux archives</span>
      </button>

      <div className="bg-surface dark:bg-[#1a1a1f] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden relative shadow-sm dark:shadow-none">
        
        {/* Header Image */}
        <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent dark:from-[#1a1a1f] dark:via-[#1a1a1f]/50 dark:to-transparent z-10" />
            <img
              src={getOptimizedUrl(getWriteupImage(), 1200)}
              alt={writeup.title}
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-black/60 backdrop-blur border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-violet-600 dark:text-violet-300 uppercase tracking-wider flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        {writeup.platform || 'CTF'}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getDifficultyColor(writeup.difficulty)}`}>
                        {writeup.difficulty}
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">{writeup.title}</h1>
                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(writeup.created_at)}</span>
                    <span className="flex items-center gap-2"><Award className="w-4 h-4" /> {writeup.points} pts</span>
                </div>
            </div>

            {isActiveMachine && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
                    <div className="bg-yellow-500/10 p-6 rounded-full border border-yellow-500/20 mb-6 animate-pulse">
                        <Lock className="w-16 h-16 text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Rapport Classifié</h2>
                    <p className="text-yellow-500/80 max-w-lg font-mono text-sm border border-yellow-500/20 bg-yellow-500/5 p-4 rounded-lg">
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        Machine active. Publication bloquée.
                    </p>
                </div>
            )}
        </div>

        {/* Contenu Markdown */}
        {!isActiveMachine && (
            <div className="p-8 md:p-12">
                <div className="prose prose-gray dark:prose-invert prose-violet max-w-none 
                    prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white 
                    prose-h2:text-2xl prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-white/10 prose-h2:pb-4 prose-h2:mt-12
                    prose-code:text-violet-600 dark:prose-code:text-violet-300 prose-code:bg-gray-100 dark:prose-code:bg-black/50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-gray-900 dark:prose-pre:bg-[#0a0a0f] prose-pre:border prose-pre:border-gray-700 dark:prose-pre:border-white/10
                    prose-strong:text-gray-900 dark:prose-strong:text-white 
                    prose-a:text-violet-600 dark:prose-a:text-violet-400 hover:prose-a:text-violet-500 dark:hover:prose-a:text-violet-300">
                    
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {writeup.content}
                    </ReactMarkdown>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/5 flex flex-wrap gap-2">
                    <Terminal className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                    {writeup.tags?.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 rounded-full text-xs text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1 hover:border-violet-500/50 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-default">
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