import React, { useState, useEffect } from 'react';
import { Zap, Check, ShieldAlert, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface WikiTipProps {
  pageId?: string; // Optionnel : si vide, on utilise l'ID global
  context?: "global" | "article"; // Pour adapter le texte
}

export const WikiTip: React.FC<WikiTipProps> = ({ pageId, context = "article" }) => {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userIp, setUserIp] = useState<string | null>(null);

  // ID spécial pour la page d'accueil
  const TARGET_ID = pageId || '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Récupérer l'IP
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const ip = ipData.ip;
        setUserIp(ip);

        // 2. Récupérer les likes actuels
        const { data: pageData } = await supabase
          .from('wiki_pages')
          .select('likes')
          .eq('id', TARGET_ID)
          .single();

        if (pageData) setLikes(pageData.likes);

        // 3. Vérifier si l'utilisateur a déjà voté
        const { data: voteData } = await supabase
          .from('wiki_votes')
          .select('id')
          .eq('page_id', TARGET_ID)
          .eq('user_ip', ip)
          .single();

        if (voteData) setHasLiked(true);

      } catch (error) {
        console.error("Erreur chargement kudos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [TARGET_ID]);

  const handleVote = async () => {
    if (hasLiked || !userIp) return;

    // Optimistic Update
    setHasLiked(true);
    setLikes(prev => prev + 1);

    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#06b6d4', '#ffffff']
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

  if (isLoading) return (
    <div className="flex items-center justify-center py-4 opacity-50">
      <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
    </div>
  );

  const labels = {
    global: {
      btn: hasLiked ? "Soutien enregistré" : "Soutenir le Wiki",
      sub: "Cliquez pour valider",
      count: "Community Kudos"
    },
    article: {
      btn: hasLiked ? "Tip Envoyé" : "Envoyer un Tip",
      sub: "Utile ?",
      count: "Crédits"
    }
  };

  const txt = labels[context];

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <motion.button
        whileHover={!hasLiked ? { scale: 1.02 } : {}}
        whileTap={!hasLiked ? { scale: 0.98 } : {}}
        onClick={handleVote}
        disabled={hasLiked}
        className={`
          relative group flex items-center p-1.5 rounded-2xl border transition-all duration-500
          ${hasLiked 
            ? 'bg-[#1a1a20] border-green-500/30 cursor-default shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
            : 'bg-gradient-to-b from-[#1a1a20] to-[#13131a] border-violet-500/30 hover:border-violet-500/60 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]'
          }
        `}
      >
        {!hasLiked && (
          <div className="absolute inset-0 rounded-2xl bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}

        <div className={`
          flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300
          ${hasLiked ? 'bg-green-500/10' : 'bg-white/5 group-hover:bg-violet-500/10'}
        `}>
          <div className={`p-1.5 rounded-full ${hasLiked ? 'text-green-400' : 'text-yellow-400'}`}>
            <AnimatePresence mode='wait'>
              {hasLiked ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="zap" initial={{ scale: 1 }} exit={{ scale: 0, rotate: 180 }}>
                  <Zap className="w-5 h-5 fill-current" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-col items-start text-left">
            <span className={`text-xs font-bold uppercase tracking-wider ${hasLiked ? 'text-green-400' : 'text-white'}`}>
              {txt.btn}
            </span>
            {!hasLiked && <span className="text-[10px] text-gray-400">{txt.sub}</span>}
          </div>
        </div>

        <div className="w-px h-8 bg-white/10 mx-2"></div>

        <div className="px-5 flex flex-col items-end min-w-[80px]">
          <span className={`text-2xl font-bold font-mono leading-none ${hasLiked ? 'text-white' : 'text-violet-400'}`}>
            {likes}
          </span>
          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-medium mt-1">
            {txt.count}
          </span>
        </div>
      </motion.button>

      {hasLiked && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-600 font-mono"
        >
          <ShieldAlert className="w-3 h-3" />
          <span>Vote sécurisé par IP</span>
        </motion.div>
      )}
    </div>
  );
};