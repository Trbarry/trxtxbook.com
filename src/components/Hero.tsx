import React from 'react';
import { getOptimizedUrl } from '../lib/imageUtils';
import { 
  Terminal, 
  BookOpen, 
  ArrowRight, 
  Database, 
  Activity, 
  Code2,           
  TerminalSquare,  
  Container,
  Brain,        
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  isLoaded: boolean;
  setShowProfile: (show: boolean) => void;
}

export const Hero: React.FC<HeroProps> = ({ isLoaded, setShowProfile }) => {
  return (
    <section className="pt-28 pb-12 md:pt-32 md:pb-20 relative overflow-hidden min-h-[100dvh] flex flex-col justify-center bg-black">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={getOptimizedUrl("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80", 1920, 70)}
          alt="Cyberpunk Background"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover opacity-5 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/90 to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col justify-center">
        <div className={`max-w-5xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* En-tête Principal */}
          <div className="text-center mb-8 md:mb-12 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] sm:text-xs font-medium mb-4 md:mb-6 animate-fade-in-up hover:bg-violet-500/20 transition-colors cursor-default">
              <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500"></span>
              </span>
              En poste chez Moulinvest
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-3 md:mb-6 tracking-tight relative inline-block">
              <span className="bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent">
                Tristan Barry
              </span>

              {/* --- BADGE WIKI FLOTTANT (Innovant) --- */}
              <Link 
                to="/wiki"
                className="absolute -top-6 -right-6 md:-top-4 md:-right-12 group"
                title="Accéder au Second Cerveau"
              >
                <div className="relative flex items-center justify-center">
                  {/* Halo animé */}
                  <div className="absolute inset-0 bg-violet-500 rounded-full blur opacity-20 group-hover:opacity-40 animate-pulse transition-opacity"></div>
                  
                  {/* Pillule principale */}
                  <div className="relative bg-[#1a1a1f] border border-violet-500/30 text-violet-300 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-300 group-hover:scale-105 group-hover:border-violet-400 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]">
                    <Brain className="w-3 h-3 md:w-4 md:h-4 text-violet-400" />
                    <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase">Wiki</span>
                    <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse" />
                  </div>

                  {/* Ligne connecteur visuel (Style HUD) */}
                  <div className="absolute top-1/2 right-full w-3 h-[1px] bg-gradient-to-r from-transparent to-violet-500/50 hidden md:block"></div>
                </div>
              </Link>
              {/* -------------------------------------- */}

            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-2">
              Technicien Système & Réseau le jour, <span className="text-violet-400 font-semibold">Pentester</span> la nuit.
              <br className="hidden md:block" />
              <span className="block mt-2 text-sm md:text-lg">Bienvenue sur ma <span className="text-white border-b border-violet-500/50">Knowledge Base</span> personnelle.</span>
            </p>
          </div>

          {/* Grille de Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12">
            <Link to="/writeups" className="group bg-[#1a1a1f]/80 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 hover:border-violet-500/40 transition-all flex items-center md:block gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-500/10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                <Terminal className="w-5 h-5 md:w-6 md:h-6 text-violet-400" />
              </div>
              <div className="text-left">
                <h3 className="text-base md:text-xl font-bold text-white mb-0.5 md:mb-2">CTF Write-ups</h3>
                <p className="text-gray-400 text-xs md:text-sm line-clamp-1 md:line-clamp-none">Archives HTB & TryHackMe.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 ml-auto md:hidden" />
            </Link>

            <Link to="/projects" className="group bg-[#1a1a1f]/80 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 hover:border-blue-500/40 transition-all flex items-center md:block gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="text-base md:text-xl font-bold text-white mb-0.5 md:mb-2">Lab & Projets</h3>
                <p className="text-gray-400 text-xs md:text-sm line-clamp-1 md:line-clamp-none">Infrastructure & Scripts.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 ml-auto md:hidden" />
            </Link>

            <Link to="/certifications" className="group bg-[#1a1a1f]/80 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 hover:border-green-500/40 transition-all flex items-center md:block gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="text-base md:text-xl font-bold text-white mb-0.5 md:mb-2">Certifications</h3>
                <p className="text-gray-400 text-xs md:text-sm line-clamp-1 md:line-clamp-none">CPTS, eJPT, AZ-900.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 ml-auto md:hidden" />
            </Link>
          </div>

          {/* Actions & Stack */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-[#1a1a1f]/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
            <button onClick={() => setShowProfile(true)} className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm">
              <span>Découvrir mon profil</span>
              <Activity className="w-4 h-4" />
            </button>

            {/* Stack Scrollable */}
            <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
                <div className="flex items-center gap-4 px-2 min-w-max">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-600 hidden lg:inline">Stack :</span>
                    <TechItem icon={<Terminal size={14} />} label="Bash" />
                    <TechItem icon={<TerminalSquare size={14} />} label="PS" />
                    <TechItem icon={<Code2 size={14} />} label="Python" />
                    <TechItem icon={<Container size={14} />} label="Docker" />
                </div>
            </div>
          </div>

          {/* Indice Terminal */}
          <div className="flex justify-center w-full mt-8 mb-8">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-600 font-mono bg-black/50 px-3 py-1.5 rounded-full border border-white/10">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">System Ready. Press ²</span>
                <span className="sm:hidden">System Ready</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const TechItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-default bg-white/5 px-2 py-1 rounded-md border border-white/5">
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
    </div>
);