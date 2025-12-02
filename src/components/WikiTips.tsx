import React, { useState, useEffect } from 'react';
import { Coins, Heart, Zap, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti'; // Optionnel : npm install canvas-confetti @types/canvas-confetti si tu veux des particules

interface WikiTipProps {
  pageId: string;
  initialLikes: number;
}

export const WikiTip: React.FC<WikiTipProps> = ({ pageId, initialLikes }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà liké cette page
    const storageKey = `wiki_like_${pageId}`;
    if (localStorage.getItem(storageKey)) {
      setHasLiked(true);
    }
    setLikes(initialLikes);
  }, [pageId, initialLikes]);

  const handleTip = async () => {
    if (hasLiked || isSending) return;

    setIsSending(true);

    // 1. Optimistic UI update (mise à jour immédiate pour l'utilisateur)
    setLikes(prev => prev + 1);
    setHasLiked(true);
    localStorage.setItem(`wiki_like_${pageId}`, 'true');

    // 2. Animation Cyber (Confettis violets et bleus)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#8b5cf6', '#3b82f6', '#ffffff']
    });

    // 3. Appel Supabase
    try {
      const { error } = await supabase.rpc('increment_wiki_likes', { page_id: pageId });
      if (error) throw error;
    } catch (err) {
      console.error("Erreur lors de l'envoi du tip:", err);
      // Rollback si erreur (optionnel, souvent on laisse pour l'UX)
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center justify-center text-center">
      <h4 className="text-lg font-bold text-white mb-2">Cette note t'a été utile ?</h4>
      <p className="text-gray-400 text-sm mb-6 max-w-md">
        Laisse un "Tip Virtuel" pour alimenter l'algorithme et m'encourager à documenter davantage.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleTip}
        disabled={hasLiked}
        className={`
          relative group flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-300
          ${hasLiked 
            ? 'bg-green-500/10 border-green-500/30 text-green-400 cursor-default' 
            : 'bg-[#1a1a20] border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
          }
        `}
      >
        <div className="relative">
          <AnimatePresence mode='wait'>
            {hasLiked ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Check className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="coin"
                initial={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Coins className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="font-mono font-bold text-lg">
          {hasLiked ? "Tip Envoyé" : "Envoyer un Tip"}
        </span>

        <div className="w-px h-4 bg-white/10 mx-1"></div>

        <div className="flex items-center gap-1.5 text-sm">
          <Zap className={`w-3.5 h-3.5 ${hasLiked ? 'text-green-400' : 'text-yellow-400'}`} />
          <span>{likes}</span>
        </div>

        {/* Effet de particules CSS simple si pas de librairie confetti */}
        {!hasLiked && (
          <span className="absolute inset-0 rounded-full ring-2 ring-white/0 group-hover:ring-white/10 group-hover:scale-110 transition-all duration-500"></span>
        )}
      </motion.button>
      
      {hasLiked && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-xs text-gray-500 font-mono"
        >
          Transaction enregistrée dans la blockchain locale (just kidding). Merci !
        </motion.p>
      )}
    </div>
  );
};