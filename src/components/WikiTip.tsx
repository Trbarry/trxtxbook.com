import React, { useState, useEffect } from 'react';
import { Zap, Check, Heart, Sparkles, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface WikiTipProps {
  pageId?: string;
  context?: "global" | "article";
}

export const WikiTip: React.FC<WikiTipProps> = ({ pageId, context = "article" }) => {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [userIp, setUserIp] = useState<string | null>(null);
  
  // ID Global par défaut
  const TARGET_ID = pageId || '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const ip = ipData.ip;
        setUserIp(ip);

        const { data: pageData } = await supabase
          .from('wiki_pages')
          .select('likes')
          .eq('id', TARGET_ID)
          .single();

        if (pageData) setLikes(pageData.likes);

        const { data: voteData } = await supabase
          .from('wiki_votes')
          .select('id')
          .eq('page_id', TARGET_ID)
          .eq('user_ip', ip)
          .single();

        if (voteData) setHasLiked(true);
      } catch (error) {
        console.error("Erreur chargement:", error);
      }
    };
    fetchData();
  }, [TARGET_ID]);

  const handleVote = async () => {
    if (hasLiked || !userIp) return;

    setHasLiked(true);
    setLikes(prev => prev + 1);

    // Boom ! Confettis Cyber (Violet/Cyan/Jaune)
    confetti({
      particleCount: 150,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#8b5cf6', '#06b6d4', '#fbbf24'],
      disableForReducedMotion: true,
      scalar: 1.2 // Plus gros
    });

    try {
      await supabase.rpc('vote_for_page', { 
        target_page_id: TARGET_ID, 
        target_ip: userIp 
      });
    } catch (err) {
      console.error("Erreur vote:", err);
    }
  };

  // Textes adaptés au contexte
  const texts = context === 'global' ? {
    title: "Utile pour la communauté ?",
    subtitle: "Laissez une trace si ce Second Cerveau vous a aidé.",
    button: "Envoyer un Signal",
    success: "Signal Reçu !"
  } : {
    title: "Cette note vous a servi ?",
    subtitle: "Un petit clic pour me dire que ça valait le coup d'être documenté.",
    button: "C'est utile !",
    success: "Merci du retour !"
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-8 relative overflow-hidden rounded-3xl">
      
      {/* Fond subtil animé */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent opacity-50 pointer-events-none" />

      <div className="relative z-10 text-center space-y-2 mb-8">
        <h4 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          {hasLiked ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-400">
              <Heart className="w-6 h-6 fill-current" />
            </motion.div>
          ) : (
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          )}
          {hasLiked ? "Message Bien Reçu" : texts.title}
        </h4>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          {hasLiked ? "Merci de contribuer à la motivation du mainteneur." : texts.subtitle}
        </p>
      </div>

      <motion.button
        whileHover={!hasLiked ? { scale: 1.05 } : {}}
        whileTap={!hasLiked ? { scale: 0.95 } : {}}
        onClick={handleVote}
        disabled={hasLiked}
        className={`
          relative group flex items-center gap-4 px-1 p-1 rounded-2xl transition-all duration-500
          ${hasLiked 
            ? 'bg-green-900/20 border border-green-500/30 cursor-default' 
            : 'bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/30 hover:border-violet-400/60 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]'
          }
        `}
      >
        {/* Container Bouton Gauche */}
        <div className={`
          flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300
          ${hasLiked ? 'bg-green-500/20 text-green-400' : 'bg-[#1a1a20] text-white group-hover:bg-[#202028]'}
        `}>
          <AnimatePresence mode='wait'>
            {hasLiked ? (
              <motion.div 
                key="check" 
                initial={{ scale: 0, rotate: -45 }} 
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div 
                key="zap" 
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, repeatDelay: 1 }}
              >
                <ThumbsUp className="w-5 h-5 text-yellow-400" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <span className="font-bold text-sm tracking-wide uppercase">
            {hasLiked ? texts.success : texts.button}
          </span>
        </div>

        {/* Séparateur */}
        <div className={`w-px h-8 mx-2 transition-colors ${hasLiked ? 'bg-green-500/20' : 'bg-white/10'}`}></div>

        {/* Compteur Droite */}
        <div className="px-5 flex flex-col items-center min-w-[70px]">
          <AnimatePresence mode='popLayout'>
            <motion.span 
              key={likes}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`text-2xl font-mono font-bold leading-none ${hasLiked ? 'text-green-400' : 'text-white'}`}
            >
              {likes}
            </motion.span>
          </AnimatePresence>
          <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold mt-1">
            Kudos
          </span>
        </div>

        {/* Lueur animée qui parcourt le bouton (CSS pur) */}
        {!hasLiked && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-white/20 skew-x-[-20deg] blur-md animate-[shimmer_3s_infinite] translate-x-[-100px]"></div>
          </div>
        )}
      </motion.button>

      {/* Footer Discret */}
      <div className="mt-6 flex items-center gap-4 opacity-50 text-[10px] text-gray-500 font-mono">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Anonyme
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3" />
          1 Vote / IP
        </span>
      </div>
    </div>
  );
};