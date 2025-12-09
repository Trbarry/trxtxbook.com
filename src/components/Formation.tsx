import React from 'react';
import { Award, Shield, BookOpen, Calendar, Target, Cloud, Network, Server, Terminal, Cpu, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Formation: React.FC = () => {
  const navigate = useNavigate();

  const handleCertificationClick = () => { navigate('/certifications'); };
  const handleCertificationDetails = (section: string) => { navigate('/certifications#' + section); };

  return (
    // ✅ CHANGEMENT : Fond dynamique
    <section className="py-24 bg-background transition-colors duration-300">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-violet-600 dark:text-violet-500" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Formation & Certifications
            </h2>
          </div>
          <button
            onClick={handleCertificationClick}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-violet-500/10 
                     text-violet-600 dark:text-violet-300 rounded-lg hover:bg-violet-500/20 
                     transition-all duration-300 group border border-violet-500/20"
          >
            <span>Voir le catalogue complet</span>
            <Shield className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10">
          
          {/* 1. BTS SIO */}
          {/* ✅ CHANGEMENT : bg-surface pour la carte, border-gray-200 pour mode clair */}
          <div className="bg-surface dark:bg-[#1a1a1f] p-1 rounded-xl group hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent">
            <div className="bg-surface dark:bg-[#1a1a1f] p-8 rounded-xl border border-gray-200 dark:border-blue-900/20 hover:border-blue-500/40 transition-all h-full">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Logo & Status */}
                    <div className="lg:w-1/4 flex flex-col items-center lg:items-start gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                            <img 
                                src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/BTS-SIO.png"
                                alt="BTS SIO"
                                className="w-32 h-32 object-contain"
                            />
                        </div>
                        <div className="flex flex-col items-center lg:items-start gap-2 w-full">
                             <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-300 text-xs font-medium">
                                <Calendar className="w-3 h-3" />
                                2025 - 2027
                            </div>
                            <button
                                onClick={() => handleCertificationDetails('bts')}
                                className="w-full py-2 bg-gray-100 dark:bg-[#2a2a30] hover:bg-blue-600/20 hover:text-blue-500 dark:hover:text-blue-300 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-white/5"
                            >
                                <BookOpen className="w-4 h-4" />
                                Programme Détaillé
                            </button>
                        </div>
                    </div>

                    {/* Contenu Technique */}
                    <div className="lg:w-3/4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">BTS SIO - Option SISR</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">Solutions d'Infrastructure, Systèmes et Réseaux</p>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                            Formation d'État de niveau 5 (Bac+2) axée sur l'administration, la conception et la sécurisation des infrastructures IT. 
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 uppercase tracking-wide">
                                    <Server className="w-4 h-4 text-blue-500" />
                                    Systèmes & Virtualisation
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex gap-2"><span className="text-blue-500">▹</span>Windows Server (AD DS, DNS, DHCP, GPO)</li>
                                    <li className="flex gap-2"><span className="text-blue-500">▹</span>Linux Administration (Debian/RedHat, Bash)</li>
                                    <li className="flex gap-2"><span className="text-blue-500">▹</span>Hyperviseurs (VMware ESXi, Proxmox)</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 uppercase tracking-wide">
                                    <Network className="w-4 h-4 text-blue-500" />
                                    Réseau & Sécurité
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex gap-2"><span className="text-blue-500">▹</span>Architecture LAN/WAN (VLAN, STP, OSPF)</li>
                                    <li className="flex gap-2"><span className="text-blue-500">▹</span>Firewalling & ACLs (PfSense, Stormshield)</li>
                                    <li className="flex gap-2"><span className="text-blue-500">▹</span>Supervision & Ticketing (GLPI, Nagios)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* 2. CPTS */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-20 blur transition duration-500 group-hover:opacity-50"></div>
            
            <div className="relative bg-surface dark:bg-[#1a1a1f] p-8 rounded-xl border border-gray-200 dark:border-violet-500/30 h-full shadow-sm dark:shadow-none">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Badge */}
                    <div className="lg:w-1/4 flex flex-col items-center gap-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-violet-500/20 pb-6 lg:pb-0 lg:pr-6">
                        <img 
                            src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/CPTS.png"
                            alt="CPTS Badge"
                            className="w-40 h-40 object-contain drop-shadow-xl"
                        />
                        <div className="w-full space-y-3">
                            {/* Stats box : bg-gray-50 en light */}
                            <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-[#0f0f13] p-3 rounded-lg border border-gray-200 dark:border-white/5">
                                <span className="text-gray-500 dark:text-gray-400">Durée Examen</span>
                                <span className="text-violet-600 dark:text-violet-300 font-mono font-bold">10 Jours</span>
                            </div>
                            <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-[#0f0f13] p-3 rounded-lg border border-gray-200 dark:border-white/5">
                                <span className="text-gray-500 dark:text-gray-400">Flags requis</span>
                                <span className="text-violet-600 dark:text-violet-300 font-mono font-bold">12 / 14</span>
                            </div>
                            <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-[#0f0f13] p-3 rounded-lg border border-gray-200 dark:border-white/5">
                                <span className="text-gray-500 dark:text-gray-400">Rapport</span>
                                <span className="text-violet-600 dark:text-violet-300 font-mono font-bold">Pro (anglais)</span>
                            </div>
                        </div>
                    </div>

                    {/* Détails */}
                    <div className="lg:w-3/4 pl-0 lg:pl-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">CPTS</h3>
                                <p className="text-violet-600 dark:text-violet-400 text-lg">Certified Penetration Testing Specialist</p>
                            </div>
                            <button onClick={() => handleCertificationDetails('cpts')} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-violet-500/20">
                                <span>Détails</span>
                                <Target className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8 border-l-4 border-violet-500 pl-4 bg-violet-50 dark:bg-violet-500/5 py-2">
                            Certification hautement technique simulant un <strong>test d'intrusion Black Box complet</strong>.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <h4 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2 text-sm border-b border-gray-200 dark:border-white/10 pb-2">
                                    <Shield className="w-4 h-4 text-violet-500" />
                                    Active Directory
                                </h4>
                                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                                    <li>• Kerberoasting / AS-REP Roasting</li>
                                    <li>• ACL Abuse & Object Takeover</li>
                                </ul>
                            </div>
                             <div className="space-y-2">
                                <h4 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2 text-sm border-b border-gray-200 dark:border-white/10 pb-2">
                                    <Network className="w-4 h-4 text-violet-500" />
                                    Network & Pivot
                                </h4>
                                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                                    <li>• Double Pivoting / Tunneling</li>
                                    <li>• Port Forwarding</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2 text-sm border-b border-gray-200 dark:border-white/10 pb-2">
                                    <Globe className="w-4 h-4 text-violet-500" />
                                    Web & Services
                                </h4>
                                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                                    <li>• Advanced SQL Injection</li>
                                    <li>• SSTI & Command Injection</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* 3. eJPT & AZ-900 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* eJPT Card */}
            <div className="bg-surface dark:bg-[#1a1a1f] p-6 rounded-xl border border-gray-200 dark:border-red-900/20 hover:border-red-500/50 transition-all duration-300 flex flex-col shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-white/5">
                    <img src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/eJPT_badge.webp" className="w-16 h-16 bg-red-500/10 rounded-lg p-2" alt="eJPT" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">eJPTv2</h3>
                        <p className="text-red-600 dark:text-red-400 text-sm">Junior Penetration Tester</p>
                    </div>
                    <div className="ml-auto text-right">
                         <span className="block text-xs text-gray-500 uppercase tracking-wide">Format</span>
                         <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">48 Heures</span>
                    </div>
                </div>
                
                <div className="flex-1 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Évaluation pratique axée sur les compétences offensives fondamentales.
                    </p>
                    <div className="bg-gray-50 dark:bg-[#0f0f13] p-4 rounded-lg border border-gray-200 dark:border-white/5">
                        <h4 className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase mb-3">Compétences validées</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <Terminal className="w-3 h-3 text-red-500" /> Host Enumeration
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <Terminal className="w-3 h-3 text-red-500" /> Exploit Dev (Basic)
                            </div>
                             <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <Terminal className="w-3 h-3 text-red-500" /> Pivoting Routing
                            </div>
                             <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <Terminal className="w-3 h-3 text-red-500" /> Web Attacks
                            </div>
                        </div>
                    </div>
                </div>
                
                <button onClick={() => handleCertificationDetails('ejpt')} className="mt-6 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 rounded-lg text-sm transition-colors border border-red-500/20">
                    Détails de la certification
                </button>
            </div>

            {/* AZ-900 Card */}
            <div className="bg-surface dark:bg-[#1a1a1f] p-6 rounded-xl border border-gray-200 dark:border-cyan-900/20 hover:border-cyan-500/50 transition-all duration-300 flex flex-col shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-white/5">
                    <img src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/AZ900.png" className="w-16 h-16 bg-cyan-500/10 rounded-lg p-2" alt="AZ-900" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Microsoft AZ-900</h3>
                        <p className="text-cyan-600 dark:text-cyan-400 text-sm">Azure Fundamentals</p>
                    </div>
                     <div className="ml-auto text-right">
                         <span className="block text-xs text-gray-500 uppercase tracking-wide">Focus</span>
                         <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">Cloud Arch</span>
                    </div>
                </div>
                
                <div className="flex-1 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Validation de la compréhension architecturale du Cloud.
                    </p>
                    <div className="bg-gray-50 dark:bg-[#0f0f13] p-4 rounded-lg border border-gray-200 dark:border-white/5">
                        <h4 className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase mb-3">Core Concepts</h4>
                         <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <Cloud className="w-3 h-3 text-cyan-500" /> IaaS / PaaS / SaaS
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <Lock className="w-3 h-3 text-cyan-500" /> Zero Trust Security
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <Cpu className="w-3 h-3 text-cyan-500" /> Entra ID
                            </div>
                             <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <Target className="w-3 h-3 text-cyan-500" /> Governance
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={() => handleCertificationDetails('az900')} className="mt-6 w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 rounded-lg text-sm transition-colors border border-cyan-500/20">
                    Détails de la certification
                </button>
            </div>

          </div>
        </div>

        {/* Mobile Button */}
        <button
          onClick={handleCertificationClick}
          className="w-full mt-8 md:hidden flex items-center justify-center gap-2 px-4 py-3 
                   bg-surface dark:bg-[#1a1a1f] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2f] transition-all duration-300 
                   group border border-gray-200 dark:border-white/10 text-violet-600 dark:text-violet-400 font-semibold"
        >
          <span>Voir le catalogue complet</span>
          <Shield className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
};