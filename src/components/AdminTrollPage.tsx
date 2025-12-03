import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Terminal, Lock, Skull, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminTrollPage: React.FC = () => {
  const navigate = useNavigate();
  const [lines, setLines] = useState<string[]>([]);

  // Simulation de logs système agressifs
  useEffect(() => {
    const fakeLogs = [
      "DETECTING_INTRUSION_VECTOR...",
      "ANALYZING_REQUEST_HEADERS...",
      "USER_AGENT_SUSPICIOUS...",
      "TRACING_IP_ADDRESS...",
      "BYPASS_ATTEMPT_BLOCKED_BY_FIREWALL_L7...",
      "NOTIFYING_ADMIN_TRTNX...",
      "DEPLOYING_COUNTER_MEASURES...",
      "JUST_KIDDING_BRO_RELAX...",
      "ACCESS_DENIED_SUCCESSFULLY."
    ];

    let delay = 0;
    fakeLogs.forEach((log, index) => {
      delay += Math.random() * 800;
      setTimeout(() => {
        setLines(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
      }, delay);
    });

    // Easter Egg dans la console
    console.log(
      "%c nice try! 🕵️‍♂️",
      "color:#8b5cf6;font-family:monospace;font-size:2rem;font-weight:bold;"
    );
    console.log(
      "%cSi tu cherches vraiment des infos, va plutôt voir mes write-ups !",
      "color:#fff;background:#000;padding:5px;border-radius:3px;"
    );

  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Matrix/Glitch subtil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-scanline"></div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="max-w-2xl w-full bg-[#0f0f13] border border-red-500/30 rounded-2xl p-8 shadow-[0_0_60px_rgba(220,38,38,0.15)] relative z-10"
      >
        {/* Header Alert */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="p-4 bg-red-500/10 rounded-full border border-red-500/50 mb-6 relative group"
          >
            <div className="absolute inset-0 bg-red-500 rounded-full blur opacity-20 group-hover:opacity-40 animate-pulse"></div>
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter mb-2">
            ACCÈS <span className="text-red-500">REFUSÉ</span>
          </h1>
          <p className="text-gray-400 font-mono text-sm md:text-base">
            Error 403: Forbidden Territory
          </p>
        </div>

        {/* Fake Terminal */}
        <div className="bg-black/80 rounded-xl border border-white/10 p-4 font-mono text-xs md:text-sm h-48 overflow-y-auto custom-scrollbar mb-8 shadow-inner">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2 text-gray-500">
            <Terminal className="w-3 h-3" />
            <span>sys_guard.exe — security_monitor</span>
          </div>
          <div className="space-y-1">
            {lines.map((line, i) => (
              <div key={i} className="text-red-400/90">
                <span className="text-gray-600 mr-2">{'>'}</span>
                {line}
              </div>
            ))}
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-red-500 inline-block align-middle ml-1"
            />
          </div>
        </div>

        {/* Message Troll */}
        <div className="text-center space-y-6">
          <div className="bg-violet-500/5 border border-violet-500/20 p-4 rounded-lg">
            <p className="text-gray-300 italic">
              "Bien joué pour l'énumération ! 🕵️‍♂️ <br/>
              Cependant, il n'y a pas de panneau admin ici. C'est un portfolio statique, pas une cible de pentest (enfin... presque)."
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 w-full sm:w-auto justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour en lieu sûr
            </button>
            
            <a
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1f] text-gray-400 font-medium rounded-xl border border-white/10 hover:border-red-500/50 hover:text-red-400 transition-all w-full sm:w-auto justify-center group"
            >
              <Lock className="w-4 h-4" />
              <span>Forcer l'accès (Bruteforce)</span>
              <Skull className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Footer IP Mock */}
        <div className="absolute bottom-2 right-4 flex items-center gap-2 text-[10px] text-gray-600 font-mono">
          <Eye className="w-3 h-3" />
          <span>IP LOGGED: 127.0.0.1 (Don't worry, it's localhost)</span>
        </div>
      </motion.div>
    </div>
  );
};