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
  Code2,           // Pour Python
  TerminalSquare,  // Pour PowerShell
  Container        // Pour Docker
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  isLoaded: boolean;
  setShowProfile: (show: boolean) => void;
}

export const Hero: React.FC<HeroProps> = ({ isLoaded, setShowProfile }) => {
  return (
    <section className="pt-32 pb-20 relative overflow-hidden min-h-[90vh] flex flex-col justify-center bg-black">
      {/* Background avec effet Cyber */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={getOptimizedUrl("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80", 1920)}
          alt="Cyberpunk Background"
          fetchPriority="high" // <--- C'est LA clé pour le score LCP
          className="absolute inset-0 w-full h-full object-cover opacity-5 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/90 to-[#0a0a0f]" />
        {/* Grille décorative subtile */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col justify-center">
        <div className={`max-w-5xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* En-tête Principal */}
          <div className="text-center mb-12">
            {/* Badge Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6 animate-fade-in-up hover:bg-violet-500/20 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              En poste chez Moulinvest (Alternance 2025-2027)
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent">
                Tristan Barry
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Technicien Système & Réseau le jour, <span className="text-violet-400 font-semibold">Pentester</span> la nuit.
              <br />
              Bienvenue sur ma <span className="text-white border-b border-violet-500/50">Knowledge Base</span> personnelle.
            </p>
          </div>

          {/* Grille de Contenu (Navigation Site) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Carte 1 : Writeups */}
            <Link to="/writeups" className="group bg-[#1a1a1f]/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-violet-500/40 hover:bg-[#1f1f25] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Terminal className="w-24 h-24 text-violet-500" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Terminal className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  CTF Write-ups
                  <ArrowRight className="w-4 h-4 text-violet-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Documentation de mes challenges sur HackTheBox & TryHackMe. Focus sur l'Active Directory, le pivot et l'escalade de privilèges.
                </p>
              </div>
            </Link>

            {/* Carte 2 : Projets */}
            <Link to="/projects" className="group bg-[#1a1a1f]/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-blue-500/40 hover:bg-[#1f1f25] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Server className="w-24 h-24 text-blue-500" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  Lab & Projets
                  <ArrowRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Mes déploiements d'infrastructure : Lab AD, Scripts d'automatisation, configurations Exegol et Cloud Azure.
                </p>
              </div>
            </Link>

            {/* Carte 3 : Certifications */}
            <Link to="/certifications" className="group bg-[#1a1a1f]/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-green-500/40 hover:bg-[#1f1f25] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-24 h-24 text-green-500" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  Certifications
                  <ArrowRight className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Suivi de ma progression : BTS SIO, CPTS, eJPT, AZ-900 et ma roadmap vers l'OSCP.
                </p>
              </div>
            </Link>

          </div>

          {/* Barre d'action & Tech Stack */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-[#1a1a1f]/50 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
            
            {/* Bouton Profil */}
            <button
              onClick={() => setShowProfile(true)}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 flex items-center justify-center gap-2 group whitespace-nowrap"
            >
              <span>Découvrir mon profil</span>
              <Activity className="w-4 h-4 group-hover:animate-pulse" />
            </button>

            {/* Tech Stack */}
            <div className="flex items-center gap-6 text-gray-500 overflow-x-auto max-w-full pb-2 md:pb-0 hide-scrollbar w-full md:w-auto md:justify-end">
                <span className="text-sm font-medium uppercase tracking-wider text-gray-600 whitespace-nowrap hidden lg:inline">Stack :</span>
                <div className="flex items-center gap-5">
                    
                    {/* Exegol (Custom Badge) */}
                    <div className="flex items-center gap-2 text-gray-300 hover:text-violet-400 transition-colors cursor-default group" title="Exegol">
                        <span className="font-bold text-[10px] border-2 border-current px-1 rounded group-hover:border-violet-400">EX</span>
                        <span className="hidden sm:inline text-xs font-medium">Exegol</span>
                    </div>

                    <div className="w-px h-4 bg-gray-800"></div>

                    <TechItem icon={<Terminal size={18} />} label="Bash/Zsh" />
                    <TechItem icon={<TerminalSquare size={18} />} label="PowerShell" />
                    <TechItem icon={<Code2 size={18} />} label="Python" />
                    <TechItem icon={<Container size={18} />} label="Docker" />
                </div>
            </div>

          </div>

          {/* === INDICE TERMINAL AJOUTÉ ICI === */}
          <div className="flex justify-center w-full mt-4">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-gray-600 font-mono bg-black/50 px-4 py-2 rounded-full border border-white/10 hover:border-violet-500/30 transition-colors cursor-help group">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                System Ready.
                <span className="hidden md:inline text-gray-500 group-hover:text-gray-300 transition-colors">
                  Press <span className="text-violet-400 font-bold border border-violet-500/30 px-1.5 rounded mx-1 bg-violet-500/10">²</span> 
                  or <span className="text-violet-400 font-bold border border-violet-500/30 px-1.5 rounded mx-1 bg-violet-500/10">CTRL+K</span> 
                  to initialize shell
                </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// Composant Helper pour les icônes de la stack
const TechItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-default group" title={label}>
        <div className="group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="hidden sm:inline text-xs font-medium">{label}</span>
    </div>
);