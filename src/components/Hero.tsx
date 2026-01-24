import React, { useState, useEffect } from 'react';
import { getOptimizedUrl } from '../lib/imageUtils';
import { 
  Terminal, 
  BookOpen, 
  ArrowRight, 
  Database, 
  Activity, 
  Code2,           
  TerminalSquare,  
  Container        
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  isLoaded: boolean;
  setShowProfile: (show: boolean) => void;
}

const HackerText = ({ text, className }: { text: string, className?: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let iteration = 0;
    
    const runAnimation = () => {
      clearInterval(interval);
      iteration = 0;
      
      interval = setInterval(() => {
        setDisplayText(prev => 
          text
            .split("")
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );
        
        if (iteration >= text.length) { 
          clearInterval(interval);
        }
        
        iteration += 1 / 3;
      }, 30);
    };

    runAnimation();

    if (isHovering) {
      runAnimation();
    }

    return () => clearInterval(interval);
  }, [text, isHovering]);

  return (
    <span 
      className={className} 
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {displayText}
    </span>
  );
};

export const Hero: React.FC<HeroProps> = ({ isLoaded, setShowProfile }) => {
  return (
    <section className="pt-28 pb-12 md:pt-32 md:pb-20 relative overflow-hidden min-h-[100dvh] flex flex-col justify-center bg-background transition-colors duration-300">
      
      {/* Background Optimisé - Ajout de loading="eager" pour fixer le LCP */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={getOptimizedUrl("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80", 1000, 50)}
          alt="Cyberpunk Background"
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover opacity-5 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background transition-colors duration-300" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col justify-center">
        <div className={`max-w-5xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-[10px] sm:text-xs font-bold mb-4 md:mb-6 animate-fade-in-up hover:bg-violet-500/20 transition-colors cursor-default">
              <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500"></span>
              </span>
              En poste chez Moulinvest
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 md:mb-8 tracking-tighter">
              <span className="bg-gradient-to-r from-gray-900 via-violet-700 to-violet-500 dark:from-white dark:via-violet-200 dark:to-violet-400 bg-clip-text text-transparent cursor-default">
                <HackerText text="Tristan Barry" />
              </span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-gray-700 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-2">
              Technicien Système & Réseau le jour, <span className="text-violet-700 dark:text-violet-400 font-bold">Pentester</span> la nuit.
              <br className="hidden md:block" />
              <span className="block mt-2 text-sm md:text-lg">
                Exploration • Sécurisation • <span className="text-gray-900 dark:text-white border-b-2 border-violet-500/50">Documentation</span>
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12">
            <Link to="/writeups" className="group bg-surface/80 dark:bg-[#1a1a1f]/80 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-white/5 hover:border-violet-500/40 transition-all flex items-center md:block gap-4 hover:-translate-y-1 duration-300 shadow-sm dark:shadow-none">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-500/10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Terminal className="w-5 h-5 md:w-6 md:h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="text-left">
                <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-0.5 md:mb-2 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">CTF Write-ups</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm line-clamp-1 md:line-clamp-none">Archives HTB & TryHackMe.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-600 ml-auto md:hidden" />
            </Link>

            <Link to="/projects" className="group bg-surface/80 dark:bg-[#1a1a1f]/80 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-white/5 hover:border-blue-500/40 transition-all flex items-center md:block gap-4 hover:-translate-y-1 duration-300 shadow-sm dark:shadow-none">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Database className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-0.5 md:mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">Lab & Projets</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm line-clamp-1 md:line-clamp-none">Infrastructure & Scripts.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-600 ml-auto md:hidden" />
            </Link>

            <Link to="/certifications" className="group bg-surface/80 dark:bg-[#1a1a1f]/80 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-white/5 hover:border-green-500/40 transition-all flex items-center md:block gap-4 hover:-translate-y-1 duration-300 shadow-sm dark:shadow-none">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-0.5 md:mb-2 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">Certifications</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm line-clamp-1 md:line-clamp-none">CPTS, eJPT, AZ-900.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-600 ml-auto md:hidden" />
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-surface/50 dark:bg-[#1a1a1f]/50 p-4 rounded-2xl border border-gray-200 dark:border-white/5 backdrop-blur-md shadow-sm dark:shadow-none">
            <button 
              onClick={() => setShowProfile(true)} 
              className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95"
              aria-label="Ouvrir le profil détaillé"
            >
              <span>Découvrir mon profil</span>
              <Activity className="w-4 h-4" />
            </button>

            <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
                <div className="flex items-center gap-4 px-2 min-w-max">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-500 hidden lg:inline">Stack :</span>
                    <TechItem icon={<Terminal size={14} />} label="Bash" />
                    <TechItem icon={<TerminalSquare size={14} />} label="PS" />
                    <TechItem icon={<Code2 size={14} />} label="Python" />
                    <TechItem icon={<Container size={14} />} label="Docker" />
                </div>
            </div>
          </div>

          <div className="flex justify-center w-full mt-8 mb-8">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-500 font-bold bg-surface/50 dark:bg-black/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 hover:border-violet-500/50 dark:hover:border-white/20 transition-colors cursor-help group" title="Try pressing '²'">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="hidden sm:inline group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">System Ready. Press ²</span>
                <span className="sm:hidden">System Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TechItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-violet-700 dark:hover:text-white transition-colors cursor-default bg-gray-200/50 dark:bg-white/5 px-2 py-1 rounded-md border border-gray-300 dark:border-white/5 hover:border-violet-500/30">
        {icon}
        <span className="text-[10px] font-bold">{label}</span>
    </div>
);