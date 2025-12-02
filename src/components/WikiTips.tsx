import React, { useState, useEffect } from 'react';
import { Zap, Check, ShieldAlert, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

export const WikiTip: React.FC = () => {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userIp, setUserIp] = useState<string | null>(null);

  // ID Fixe défini dans le SQL
  const GLOBAL_WIKI_ID = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Récupérer l'IP du client (via un service tiers léger)
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const ip = ipData.ip;
      setUserIp(ip);

      // 2. Récupérer le nombre de likes actuel
      const { data: pageData } = await supabase
        .from('wiki_pages')
        .select('likes')
        .eq('id', GLOBAL_WIKI_ID)
        .single();

      if (pageData) setLikes(pageData.likes);

      // 3. Vérifier si cet IP a déjà voté (via Supabase pour être sûr)
      const { data: voteData } = await supabase
        .from('wiki_votes')
        .select('id')
        .eq('page_id', GLOBAL_WIKI_ID)
        .eq('user_ip', ip)
        .single();

      if (voteData) setHasLiked(true);

    } catch (error) {
      console.error("Erreur init kudos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (hasLiked || !userIp) return;

    // Optimistic Update
    setHasLiked(true);
    setLikes(prev => prev + 1);

    // Confetti Cyber
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#06b6d4', '#ffffff'] // Violet, Cyan, Blanc
    });

    try {
      // Appel de la fonction SQL sécurisée
      const { data: success, error } = await supabase.rpc('vote_for_wiki', { target_ip: userIp });
      
      if (error || !success) {
        // Si le serveur rejette (doublon IP caché), on revert pas pour pas frustrer, 
        // mais on log l'erreur.
        console.warn("Vote rejeté par le serveur (IP déjà enregistrée ?)");
      }
    } catch (err) {
      console.error("Erreur vote:", err);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <motion.button
        whileHover={!hasLiked ? { scale: 1.02, y: -2 } : {}}
        whileTap={!hasLiked ? { scale: 0.98 } : {}}
        onClick={handleVote}
        disabled={hasLiked}
        className={`
          relative group w-full md:w-auto min-w-[280px] flex items-center justify-between p-1.5 rounded-2xl border transition-all duration-500
          ${hasLiked 
            ? 'bg-[#1a1a20] border-green-500/30 cursor-default shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
            : 'bg-gradient-to-b from-[#1a1a20] to-[#13131a] border-violet-500/30 hover:border-violet-500/60 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]'
          }
        `}
      >
        {/* Glow de fond au survol */}
        {!hasLiked && (
          <div className="absolute inset-0 rounded-2xl bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}

        {/* Partie Gauche : Badge */}
        <div className={`
          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
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
                  key="zap"
                  initial={{ scale: 1 }}
                  exit={{ scale: 0, rotate: 180 }}
                >
                  <Zap className="w-5 h-5 fill-current" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-col items-start">
            <span className={`text-xs font-bold uppercase tracking-wider ${hasLiked ? 'text-green-400' : 'text-white'}`}>
              {hasLiked ? "ACKNOWLEDGED" : "USEFUL CONTENT ?"}
            </span>
            {!hasLiked && <span className="text-[10px] text-gray-400">Cliquez pour valider</span>}
          </div>
        </div>

        {/* Partie Droite : Compteur */}
        <div className="px-6 flex flex-col items-end">
          <span className={`text-2xl font-bold font-mono leading-none ${hasLiked ? 'text-white' : 'text-violet-400 group-hover:text-violet-300'}`}>
            {likes}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mt-1">
            Community Kudos
          </span>
        </div>
      </motion.button>

      {/* Message IP Protection */}
      {hasLiked && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-600 font-mono"
        >
          <ShieldAlert className="w-3 h-3" />
          <span>Vote enregistré et lié à votre IP pour éviter le spam.</span>
        </motion.div>
      )}
    </div>
  );
};