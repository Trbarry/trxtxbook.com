import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Target, 
  Lightbulb, 
  Server, 
  Cpu, 
  Network,
  Terminal,
  Award,
  CheckCircle2,
  ArrowUpRight,
  X,
  Home,
  BookOpen,
  ShieldCheck,
  Users
} from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div 
      className={`fixed inset-0 bg-[#0a0a0f]/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleOverlayClick}
    >
      <div 
        data-lenis-prevent
        className={`bg-[#0f0f13] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-violet-500/20 shadow-[0_0_40px_rgba(139,92,246,0.1)] p-6 custom-scrollbar relative transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-[#1a1a1f] p-2 rounded-full hover:bg-red-500/20 border border-white/5 z-20 group"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        {/* En-tête Profil */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-10 relative">
          <div className="absolute -top-6 -left-6 w-20 h-20 bg-violet-600/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent tracking-tight">
              Tristan Barry
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 bg-violet-500/10 text-violet-200 px-4 py-1.5 rounded-full text-sm font-medium border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                <Briefcase className="w-3.5 h-3.5" />
                Alternant Technicien Supérieur S&R
              </span>
              <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-200 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-500/20">
                <Terminal className="w-3.5 h-3.5" />
                Pentester en devenir
              </span>
            </div>
          </div>
        </div>

        {/* BLOC 1 : MOULINVEST */}
        <div className="group relative bg-gradient-to-br from-[#1a1a20] to-[#0f0f13] border border-violet-500/30 rounded-2xl p-8 mb-10 overflow-hidden transition-all duration-300 hover:border-violet-500/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-violet-600/10 transition-all duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg border-2 border-violet-500/20">
                  <img 
                    src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/Moulinvest-groupe.svg" 
                    alt="Moulinvest" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                    Alternance chez Moulinvest
                    <ArrowUpRight className="w-5 h-5 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-violet-200/70 text-sm font-medium mt-1">2025 — 2027 • Technicien Système & Réseau</p>
                </div>
              </div>
              
              <div className="bg-emerald-500/10 text-emerald-300 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-500/20 flex items-center gap-3 shadow-[0_0_10px_rgba(16,185,129,0.1)] self-start md:self-center">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Poste Actuel
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-3 space-y-4">
                <h4 className="text-violet-100 font-semibold flex items-center gap-2 uppercase text-sm tracking-wider">
                  <Server className="w-4 h-4 text-violet-400" />
                  Une opportunité unique
                </h4>
                {/* ✅ DESCRIPTION MISE À JOUR : TON "CHANCE" + "TUTEUR" + "BACKLOG" */}
                <p className="text-gray-300 leading-relaxed text-[15px]">
                  J'ai la chance d'occuper un poste d'une grande richesse où la polyvalence est la clé. Mon quotidien ne se limite pas au <strong className="text-violet-200">support utilisateur (N1 à N3)</strong> : je participe activement à la gestion de l'infrastructure et aux projets de fond (Admin Sys, Réseau, Sécurité).
                </p>
                <p className="text-gray-300 leading-relaxed text-[15px]">
                  Encadré par un <strong className="text-violet-200">tuteur exceptionnel</strong> qui favorise l'autonomie, je puise dans un <strong className="text-violet-200">backlog de projets constant</strong> pour monter en compétence (Azure Hybride, GPO, VLANs) et proposer des améliorations concrètes.
                </p>
                
                <ul className="grid grid-cols-1 gap-3 pt-2">
                    {[
                        { icon: Server, text: "Admin Sys : AD (AGDLP/GPO/NTFS) & Cloud (Entra ID/Intune)" },
                        { icon: Network, text: "Réseau : Switching, VLANs, DHCP & Infra Hybride" },
                        { icon: ShieldCheck, text: "Sécurité : Audits de comptes, Veille & Hardening" },
                        { icon: Users, text: "Projets : Coordination prestataires & Support N1/2/3" },
                    ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-gray-300 bg-[#13131a] p-3 rounded-lg border border-white/5 hover:border-violet-500/30 transition-colors">
                            <item.icon className="w-4 h-4 text-violet-400 shrink-0" />
                            {item.text}
                        </li>
                    ))}
                </ul>
              </div>
              
              <div className="md:col-span-2 bg-[#13131a]/80 rounded-2xl p-6 border border-white/10 flex flex-col justify-center hover:border-violet-500/30 transition-all relative overflow-hidden group/stack">
                 <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover/stack:opacity-100 transition-opacity"></div>
                 <h4 className="text-violet-100 font-semibold mb-4 flex items-center gap-2 uppercase text-sm tracking-wider relative z-10">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Stack Technique
                </h4>
                 <div className="flex flex-wrap gap-2 relative z-10">
                    {[
                      'Active Directory', 'GPO', 'AGDLP', 'NTFS', 
                      'Azure / M365', 'Entra ID', 'Intune', 
                      'VLAN / DHCP', 'GLPI', 'PowerShell'
                    ].map((tech) => (
                        <span key={tech} className="px-3 py-1.5 bg-[#1f1f27] hover:bg-violet-500/20 text-gray-300 hover:text-violet-100 text-xs font-medium rounded-lg border border-white/10 hover:border-violet-500/30 transition-all duration-200 cursor-default">
                            {tech}
                        </span>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* BLOC 2 : L'ADN CYBER (PROACTIVITÉ & CERTIFS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            
            <div className="lg:col-span-2 bg-[#1a1a20] p-8 rounded-2xl border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300 group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Terminal className="w-5 h-5 text-blue-400" />
                    </div>
                    Proactivité & Projets Personnels
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                    En parallèle de mon alternance, je maintiens une <strong className="text-blue-300">routine de révision quotidienne</strong>. Autodidacte par conviction, je ne me contente pas de la théorie : je développe mes propres <strong className="text-blue-300">projets personnels (Home Lab, Scripts)</strong> pour valider mes connaissances et préparer activement mes certifications.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#13131a] p-5 rounded-xl border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all">
                        <span className="text-xs text-violet-400 uppercase font-extrabold tracking-wider flex items-center gap-2">
                            <Home className="w-3.5 h-3.5" />
                            Laboratoire
                        </span>
                        <p className="text-white font-semibold mt-2">Home Lab Active Directory & Pentest</p>
                        <p className="text-gray-500 text-xs mt-1">Simulations d'attaques & Défense</p>
                    </div>

                    <div className="bg-[#13131a] p-5 rounded-xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                        <span className="text-xs text-blue-400 uppercase font-extrabold tracking-wider flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5" />
                            En préparation
                        </span>
                        <div className="mt-2 flex flex-col gap-1">
                            <span className="text-white font-semibold text-sm">• Microsoft Cloud</span>
                            <span className="text-white font-semibold text-sm">• CCNA (Réseau)</span>
                            <span className="text-white font-semibold text-sm">• OSCP (Offensive)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#1a1a20] p-8 rounded-2xl border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-gray-200 uppercase mb-6 flex items-center gap-3 tracking-wider">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Certifications Validées
                </h3>
                <ul className="space-y-4">
                    <li className="flex items-center justify-between p-3 bg-[#13131a] rounded-xl border border-white/5 hover:border-green-500/30 transition-all group/item">
                        <span className="text-gray-100 font-medium">HTB CPTS</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 opacity-0 group-hover/item:opacity-100 transition-opacity">Expert</span>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                    </li>
                    <li className="flex items-center justify-between p-3 bg-[#13131a] rounded-xl border border-white/5 hover:border-green-500/30 transition-all">
                        <span className="text-gray-100 font-medium">eJPTv2</span>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </li>
                    <li className="flex items-center justify-between p-3 bg-[#13131a] rounded-xl border border-white/5 hover:border-green-500/30 transition-all">
                        <span className="text-gray-100 font-medium">Microsoft AZ-900</span>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </li>
                </ul>
            </div>
        </div>

        {/* BLOC 3 : HISTORIQUE & PHILO */}
        <div className="border-t border-white/10 pt-10">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                 <Network className="w-6 h-6 text-violet-500" />
                </div>
                Mon Background : De la Fibre à l'IT
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <p className="text-gray-300 leading-relaxed">
                        Avant de basculer dans le monde du système et de la cyber, j'ai été technicien fibre optique terrain. Cette expérience a façonné ma méthodologie : <strong className="text-violet-200">il n'y a pas de place pour l'approximation</strong> quand on touche à l'infrastructure physique critique.
                    </p>
                    <div className="bg-[#1a1a20] p-6 rounded-2xl border border-white/5 hover:border-violet-500/20 transition-all">
                        <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Acquis de terrain :</h4>
                        <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                            {['Gestion du stress', 'Travail d\'équipe', 'Rigueur & Précision', 'Autonomie'].map((skill) => (
                                <li key={skill} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                                    <div className="w-2 h-2 rounded-sm bg-violet-500 shadow-[0_0_5px_rgba(139,92,246,0.5)]"></div>
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="space-y-6">
                     <div className="bg-[#1a1a20] p-6 rounded-2xl border border-violet-500/10 hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all duration-300 group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                                <Lightbulb className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                            <h4 className="font-bold text-white">Philosophie</h4>
                            <p className="text-yellow-200/80 italic mt-2 text-lg font-medium">
                                "Une journée sans apprendre est une journée perdue."
                            </p>
                            </div>
                        </div>
                    </div>
                     <div className="bg-[#1a1a20] p-6 rounded-2xl border border-violet-500/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300 group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                                <Target className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                            <h4 className="font-bold text-white">Objectif Long Terme</h4>
                            <p className="text-gray-300 mt-2 leading-relaxed">
                                Devenir <strong>Expert Pentester / Red Team</strong> en capitalisant sur la double compétence : Infra Réelle (Moulinvest) + Expertise Offensive (Certifs).
                            </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};