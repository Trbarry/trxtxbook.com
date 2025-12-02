import React from 'react';
import { getOptimizedUrl } from '../lib/imageUtils';
import { 
  Terminal, 
  BookOpen, 
  Shield, 
  ArrowRight, 
  Database, 
  Server, 
  Activity, 
  Code2,           
  TerminalSquare,  
  Container        
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SecurityWatch } from './SecurityWatch';

interface HeroProps {
  isLoaded: boolean;
  setShowProfile: (show: boolean) => void;
}

export const Hero: React.FC<HeroProps> = ({ isLoaded, setShowProfile }) => {
  return (
    // MODIFICATION : min-h-screen au lieu de min-h-[90vh] pour laisser respirer sur mobile
    // Ajustement des paddings : pt-24 sur mobile, pt-32 sur desktop
    <section className="pt-24 pb-16 md:pt-32 md:pb-20 relative overflow-hidden min-h-screen flex flex-col justify-center bg-black">
      
      {/* Background inchangé */}
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
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs md:text-sm font-medium mb-6 animate-fade-in-up hover:bg-violet-500/20 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              En poste chez Moulinvest (Alternance 2025-2027)
            </div>
            
            {/* Titre responsive : plus petit sur mobile pour éviter les retours à la ligne moches */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent">
                Tristan Barry
              </span>
            </h1>
            
            <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-2">
              Technicien Système & Réseau le jour, <span className="text-violet-400 font-semibold">Pentester</span> la nuit.
              <br className="hidden md:block" />
              <span className="text-sm md:text-lg block mt-2 md:mt-0">Bienvenue sur ma <span className="text-white border-b border-violet-500/50">Knowledge Base</span> personnelle.</span>
            </p>
          </div>

          {/* Grille de Contenu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            {/* Carte 1 */}
            <Link to="/writeups" className="group bg-[#1a1a1f]/80 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-white/5 hover:border-violet-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Terminal className="w-16 h-16 md:w-24 md:h-24 text-violet-500" />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                  <Terminal className="w-5 h-5 md:w-6 md:h-6 text-violet-400" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 flex items-center gap-2">
                  CTF Write-ups
                </h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                  Archives HackTheBox & TryHackMe. Active Directory & Pivot.
                </p>
              </div>
            </Link>

            {/* Carte 2 */}
            <Link to="/projects" className="group bg-[#1a1a1f]/80 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-white/5 hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Server className="w-16 h-16 md:w-24 md:h-24 text-blue-500" />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                  <Database className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 flex items-center gap-2">
                  Lab & Projets
                </h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                  Infrastructure, Scripts & Outils.
                </p>
              </div>
            </Link>

            {/* Carte 3 */}
            <Link to="/certifications" className="group bg-[#1a1a1f]/80 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-white/5 hover:border-green-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-16 h-16 md:w-24 md:h-24 text-green-500" />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 flex items-center gap-2">
                  Certifications
                </h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                  BTS SIO, CPTS, eJPT, AZ-900.
                </p>
              </div>
            </Link>
          </div>

          {/* Barre d'action & Tech Stack */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-[#1a1a1f]/50 p-4 md:p-6 rounded-2xl border border-white/5 backdrop-blur-md">
            
            <button
              onClick={() => setShowProfile(true)}
              className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 flex items-center justify-center gap-2 group whitespace-nowrap"
            >
              <span>Découvrir mon profil</span>
              <Activity className="w-4 h-4 group-hover:animate-pulse" />
            </button>

            {/* Tech Stack : Scroll horizontal plus fluide sur mobile */}
            <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
                <div className="flex items-center gap-5 px-2 min-w-max">
                    <span className="text-sm font-medium uppercase tracking-wider text-gray-600 hidden lg:inline">Stack :</span>
                    
                    <div className="flex items-center gap-2 text-gray-300 hover:text-violet-400 transition-colors cursor-default group" title="Exegol">
                        <span className="font-bold text-[10px] border-2 border-current px-1 rounded group-hover:border-violet-400">EX</span>
                        <span className="text-xs font-medium">Exegol</span>
                    </div>

                    <div className="w-px h-4 bg-gray-800"></div>

                    <TechItem icon={<Terminal size={16} />} label="Bash" />
                    <TechItem icon={<TerminalSquare size={16} />} label="PS" />
                    <TechItem icon={<Code2 size={16} />} label="Python" />
                    <TechItem icon={<Container size={16} />} label="Docker" />
                </div>
            </div>
          </div>

          {/* VEILLE SÉCURITÉ - INTÉGRATION OPTIMISÉE MOBILE */}
          <div className="mt-6 md:mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <SecurityWatch />
          </div>

          {/* Indice Terminal */}
          <div className="flex justify-center w-full mt-8 mb-4">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-gray-600 font-mono bg-black/50 px-4 py-2 rounded-full border border-white/10 hover:border-violet-500/30 transition-colors cursor-help group">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">System Ready.</span>
                <span className="sm:hidden">Sys. Ready</span>
                <span className="text-gray-500 group-hover:text-gray-300 transition-colors ml-2">
                  <span className="hidden sm:inline">Press </span>
                  <span className="text-violet-400 font-bold border border-violet-500/30 px-1.5 rounded bg-violet-500/10">²</span> 
                </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// Helper (inchangé sauf taille police mobile)
const TechItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-default group" title={label}>
        <div className="group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-xs font-medium">{label}</span>
    </div>
);