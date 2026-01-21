import React, { useEffect, useState } from 'react';
import { 
  Briefcase, Target, Lightbulb, Server, Cpu, Network,
  Terminal, Award, CheckCircle2, ArrowUpRight, X, BookOpen, ShieldCheck, Users,
  Database, Lock, Cloud, Activity
} from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

// Structuration des compétences pour une meilleure lisibilité technique
const techStack = [
  { label: 'AD DS & Entra ID', category: 'Identity' },
  { label: 'GPO Hardening', category: 'Governance' },
  { label: 'RBAC (AGDLP)', category: 'Identity' },
  { label: 'Hybrid Identity', category: 'Cloud' },
  { label: 'Microsoft Intune (MDM)', category: 'Endpoint' },
  { label: 'Network Segmentation (VLANs)', category: 'Network' },
  { label: 'PowerShell Automation', category: 'Ops' },
  { label: 'ITAM (GLPI)', category: 'Governance' },
  { label: 'NTFS Permissions Audit', category: 'Security' },
  { label: 'M365 Security Center', category: 'Cloud' }
];

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
      className={`fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleOverlayClick}
    >
      <div 
        data-lenis-prevent
        className={`bg-surface dark:bg-[#0f0f13] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-violet-500/20 shadow-2xl p-6 md:p-10 custom-scrollbar relative transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >
        
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-[#1a1a1f] p-2 rounded-full border border-gray-200 dark:border-white/5 z-20 group"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        {/* En-tête Profil */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-violet-700 to-violet-500 dark:from-white dark:via-violet-200 dark:to-violet-400 bg-clip-text text-transparent tracking-tight">
              Tristan Barry
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="flex items-center gap-1.5 bg-violet-500/10 text-violet-700 dark:text-violet-200 px-4 py-1.5 rounded-full text-sm font-semibold border border-violet-500/20 shadow-sm">
                <Briefcase className="w-3.5 h-3.5" />
                Apprenti Technicien S&R
              </span>
              <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-200 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Cybersecurity Aspirant
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1 : EXPÉRIENCE PROFESSIONNELLE */}
        <div className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-[#1a1a20] dark:to-[#0f0f13] border border-gray-200 dark:border-violet-500/30 rounded-2xl p-8 mb-10 overflow-hidden transition-all duration-300 hover:border-violet-500/60 shadow-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-violet-600/10 transition-all duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg border-2 border-violet-100 dark:border-violet-500/20 overflow-hidden">
                  <img 
                    src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/Moulinvest-groupe.svg" 
                    alt="Moulinvest" 
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide">
                    Alternance — Groupe Moulinvest
                  </h3>
                  <p className="text-violet-600/70 dark:text-violet-400 text-sm font-bold mt-1 uppercase tracking-widest">Sept. 2025 — Présent</p>
                </div>
              </div>
              
              <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-500/20 flex items-center gap-3 shadow-sm self-start">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Active Learning
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3 space-y-6">
                <div>
                  <h4 className="text-violet-700 dark:text-violet-300 font-bold flex items-center gap-2 uppercase text-xs tracking-[0.2em] mb-3">
                    <Activity className="w-4 h-4" />
                    Missions & Immersion
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[15px]">
                    Au sein du pôle infrastructure, je participe au maintien en condition opérationnelle (**MCO**) d'un parc multi-sites. Mon apprentissage se concentre sur la sécurisation des accès et la transition vers une gestion hybride des identités.
                  </p>
                </div>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Lock, text: "Identity Management : AD DS, Entra ID & RBAC" },
                    { icon: Server, text: "Admin Sys : Déploiement WDS, GPO Hardening" },
                    { icon: Network, text: "Infrastructure : Switching & Segmentation L2/L3" },
                    { icon: Cloud, text: "Modern Workplace : Intune & M365 Governance" },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-[#13131a] p-4 rounded-xl border border-gray-200 dark:border-white/5 hover:border-violet-500/30 transition-all">
                      <item.icon className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                      <span className="font-medium">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="lg:col-span-2 bg-white/50 dark:bg-[#13131a]/80 rounded-2xl p-6 border border-gray-200 dark:border-white/10 flex flex-col hover:border-violet-500/30 transition-all relative overflow-hidden group/stack">
                  <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover/stack:opacity-100 transition-opacity"></div>
                  <h4 className="text-violet-700 dark:text-violet-300 font-bold mb-5 flex items-center gap-2 uppercase text-xs tracking-[0.2em] relative z-10">
                    <Cpu className="w-4 h-4" />
                    Technical Stack
                  </h4>
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {techStack.map((tech) => (
                      <span key={tech.label} className="px-3 py-1.5 bg-gray-100 dark:bg-[#1f1f27] hover:bg-violet-500/10 text-gray-600 dark:text-gray-300 hover:text-violet-700 dark:hover:text-violet-100 text-[11px] font-bold rounded-lg border border-gray-200 dark:border-white/10 hover:border-violet-500/30 transition-all duration-200 cursor-default">
                        {tech.label}
                      </span>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 : FORMATION & CERTIFICATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2 bg-gray-50 dark:bg-[#1a1a20] p-8 rounded-2xl border border-gray-200 dark:border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Self-Learning & Pentest Lab
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  Passionné par la **Sécurité Offensive**, je développe mes méthodologies d'audit sur des plateformes comme HTB et TryHackMe. Mon focus actuel est la **Post-Exploitation Windows** et les vulnérabilités Active Directory.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#13131a] p-5 rounded-xl border border-gray-200 dark:border-white/5">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-black tracking-widest flex items-center gap-2 mb-4">
                      <BookOpen className="w-3.5 h-3.5" />
                      Focus Études
                    </span>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">• CCNA Preparation</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">• Active Directory Attacks</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">• Python for Cyber</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#13131a] p-5 rounded-xl border border-gray-200 dark:border-white/5">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-widest flex items-center gap-2 mb-4">
                      <Target className="w-3.5 h-3.5" />
                      Labs & Practice
                    </span>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">• Exegol Environment</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">• HTB Machines (Medium+)</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">• PortSwigger Academy</p>
                    </div>
                  </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a20] p-8 rounded-2xl border border-gray-200 dark:border-violet-500/10 flex flex-col">
                <h3 className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase mb-6 flex items-center gap-3 tracking-[0.2em]">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Certifications
                </h3>
                <ul className="space-y-3">
                    {[
                      { name: "HTB CPTS", status: "Ongoing", color: "text-violet-500" },
                      { name: "eJPTv2", status: "Certified", color: "text-green-500" },
                      { name: "Microsoft AZ-900", status: "Certified", color: "text-green-500" }
                    ].map((cert, i) => (
                      <li key={i} className="flex items-center justify-between p-4 bg-white dark:bg-[#13131a] rounded-xl border border-gray-200 dark:border-white/5 group/item transition-all hover:scale-[1.02]">
                        <span className="text-gray-800 dark:text-gray-100 font-bold text-sm">{cert.name}</span>
                        {cert.status === "Certified" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <span className="text-[9px] font-black uppercase px-2 py-1 bg-violet-500/10 text-violet-500 rounded border border-violet-500/20">Learning</span>
                        )}
                      </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* SECTION 3 : PHILOSOPHIE & PARCOURS */}
        <div className="border-t border-gray-200 dark:border-white/10 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-4">
                      <div className="p-2 bg-violet-500/10 rounded-lg">
                        <Network className="w-6 h-6 text-violet-600 dark:text-violet-500" />
                      </div>
                      Background & Rigueur
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                      "Mon expérience dans le déploiement de fibre optique m'a forgé une discipline de terrain : la sécurité logique d'un système ne vaut rien sans une infrastructure physique irréprochable et une méthodologie d'audit stricte."
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                      {['Méthodologie Audit', 'Esprit d\'Analyse', 'Adaptabilité'].map(trait => (
                        <div key={trait} className="flex items-center gap-2 px-3 py-1 bg-violet-500/5 border border-violet-500/10 rounded-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                          <span className="text-xs font-bold text-gray-600 dark:text-violet-200">{trait}</span>
                        </div>
                      ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-yellow-500/5 to-transparent p-6 rounded-2xl border border-yellow-500/10 relative overflow-hidden">
                        <div className="flex items-start gap-4">
                            <Lightbulb className="w-6 h-6 text-yellow-600 mt-1 shrink-0" />
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Mindset</h4>
                              <p className="text-yellow-700/80 dark:text-yellow-200/80 italic mt-2 text-lg font-serif">
                                « Une journée sans apprendre est une journée perdue. »
                              </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-500/5 to-transparent p-6 rounded-2xl border border-red-500/10">
                        <div className="flex items-start gap-4">
                            <Target className="w-6 h-6 text-red-600 mt-1 shrink-0" />
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Objectif 2027</h4>
                              <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm leading-relaxed">
                                Devenir un expert en **Sécurité des Systèmes d'Information**, capable d'allier expertise technique (Pentest) et vision stratégique de l'infrastructure.
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