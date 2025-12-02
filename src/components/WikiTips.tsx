import React, { useState, useEffect } from 'react';
import { Coins, Zap, Check, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface WikiTipProps {
  pageId: string;
  initialLikes: number;
}

export const WikiTip: React.FC<WikiTipProps> = ({ pageId, initialLikes }) => {
  // On force 0 si initialLikes est null/undefined
  const [likes, setLikes] = useState(initialLikes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const storageKey = `wiki_like_${pageId}`;
    if (localStorage.getItem(storageKey)) {
      setHasLiked(true);
    }
    // Mise à jour si la prop change (navigation entre pages)
    setLikes(initialLikes || 0);
  }, [pageId, initialLikes]);

  const handleTip = async () => {
    if (hasLiked || isSending) return;

    setIsSending(true);
    const newCount = likes + 1;
    setLikes(newCount);
    setHasLiked(true);
    localStorage.setItem(`wiki_like_${pageId}`, 'true');

    // Explosion de couleurs
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#8b5cf6', '#3b82f6', '#10b981', '#fbbf24'],
      disableForReducedMotion: true
    });

    try {
      await supabase.rpc('increment_wiki_likes', { page_id: pageId });
    } catch (err) {
      console.error("Erreur tip:", err);
      // On ne rollback pas l'UI pour ne pas frustrer l'utilisateur
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-16 pt-10 border-t border-white/5 flex flex-col items-center justify-center text-center">
      <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        Signal reçu ?
      </h4>
      <p className="text-gray-400 text-sm mb-8 max-w-md">
        Si cette note t'a été utile, envoie un <span className="text-violet-400 font-medium">crédit de données</span> pour soutenir la base.
      </p>

      <motion.button
        whileHover={!hasLiked ? { scale: 1.02 } : {}}
        whileTap={!hasLiked ? { scale: 0.98 } : {}}
        onClick={handleTip}
        disabled={hasLiked}
        className={`
          relative group flex items-center p-1.5 rounded-2xl border transition-all duration-500
          ${hasLiked 
            ? 'bg-[#1a1a20] border-green-500/30 cursor-default' 
            : 'bg-[#13131a] border-violet-500/30 hover:border-violet-500/60 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]'
          }
        `}
      >
        {/* Partie Gauche : Icône + Texte */}
        <div className={`
          flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300
          ${hasLiked ? 'bg-green-500/10' : 'bg-white/5 group-hover:bg-violet-500/10'}
        `}>
          <div className={`p-1.5 rounded-full ${hasLiked ? 'text-green-400' : 'text-yellow-400'}`}>
            <AnimatePresence mode='wait'>
              {hasLiked ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="coin"
                  initial={{ scale: 1 }}
                  exit={{ scale: 0, rotate: 180 }}
                >
                  <Coins className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className={`font-bold text-sm uppercase tracking-wider ${hasLiked ? 'text-green-400' : 'text-white'}`}>
            {hasLiked ? "Envoyé" : "Envoyer un Tip"}
          </span>
        </div>

        {/* Séparateur */}
        <div className="w-px h-8 bg-white/10 mx-2"></div>

        {/* Partie Droite : Compteur (Bien visible maintenant) */}
        <div className="px-6 flex flex-col items-center justify-center min-w-[80px]">
          <span className={`text-2xl font-bold font-mono leading-none ${hasLiked ? 'text-white' : 'text-violet-400 group-hover:text-violet-300'}`}>
            {likes}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mt-1">
            Crédits
          </span>
        </div>

        {/* Effet de lueur d'arrière-plan */}
        {!hasLiked && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
      </motion.button>

      {/* Petit message fun post-click */}
      <AnimatePresence>
        {hasLiked && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] text-green-400 font-mono"
          >
            <Trophy className="w-3 h-3" />
            <span>Achievement: Supporter Officiel</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};