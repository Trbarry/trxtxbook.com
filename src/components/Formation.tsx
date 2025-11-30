import React from 'react';
import { 
  Award, 
  Shield, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Target,
  Cloud,
  Network,
  Server,
  Terminal,
  Cpu,
  Globe,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Formation: React.FC = () => {
  const navigate = useNavigate();

  const handleCertificationClick = () => {
    navigate('/certifications');
  };

  const handleCertificationDetails = (section: string) => {
    navigate('/certifications#' + section);
  };

  return (
    <section className="py-24 bg-[#0d0d12]">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-violet-500" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Formation & Certifications
            </h2>
          </div>
          <button
            onClick={handleCertificationClick}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-violet-500/10 
                     text-violet-300 rounded-lg hover:bg-violet-500/20 
                     transition-all duration-300 group border border-violet-500/20"
          >
            <span>Voir le catalogue complet</span>
            <Shield className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10">
          
          {/* 1. ACADÉMIQUE : BTS SIO (Détaillé) */}
          <div className="bg-[#1a1a1f] p-1 rounded-xl group hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300">
            <div className="bg-[#1a1a1f] p-8 rounded-xl border border-blue-900/20 hover:border-blue-500/40 transition-all h-full">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Logo & Status */}
                    <div className="lg:w-1/4 flex flex-col items-center lg:items-start gap-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <img 
                                src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/BTS-SIO.png"
                                alt="BTS SIO"
                                className="w-32 h-32 object-contain"
                            />
                        </div>
                        <div className="flex flex-col items-center lg:items-start gap-2 w-full">
                             <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-xs font-medium">
                                <Calendar className="w-3 h-3" />
                                2025 - 2027
                            </div>
                            <button
                                onClick={() => handleCertificationDetails('bts')}
                                className="w-full py-2 bg-[#2a2a30] hover:bg-blue-600/20 hover:text-blue-300 text-gray-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-white/5"
                            >
                                <BookOpen className="w-4 h-4" />
                                Programme Détaillé
                            </button>
                        </div>
                    </div>

                    {/* Contenu Technique */}
                    <div className="lg:w-3/4">
                        <h3 className="text-2xl font-bold text-white mb-2">BTS SIO - Option SISR</h3>
                        <p className="text-blue-400 font-medium mb-4">Solutions d'Infrastructure, Systèmes et Réseaux</p>
                        
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Formation d'État de niveau 5 (Bac+2) axée sur l'administration, la conception et la sécurisation des infrastructures IT. 
                            Le cursus couvre l'intégralité du cycle de vie des services, de la configuration des équipements actifs (Switching/Routing) 
                            à la virtualisation de serveurs et la cyberdéfense opérationnelle.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2 uppercase tracking-wide">
                                    <Server className="w-4 h-4 text-blue-500" />
                                    Systèmes & Virtualisation
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li className="flex gap-2"><span className="text-blue-500">▹</span>Windows Server (AD DS, DNS, DHCP, GPO)</li>
                                    <li className="flex gap-2"><span className="text-blue-500">▹</span>Linux Administration (Debian/RedHat, Bash)</li>
                                    <li className="flex gap-2"><span className="text-blue-500">▹</span>Hyperviseurs (VMware ESXi, Proxmox)</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2 uppercase tracking-wide">
                                    <Network className="w-4 h-4 text-blue-500" />
                                    Réseau & Sécurité
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-400">
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

          {/* 2. CERTIF MAJEURE : CPTS (Highlight) */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-20 blur transition duration-500 group-hover:opacity-50"></div>
            
            <div className="relative bg-[#1a1a1f] p-8 rounded-xl border border-violet-500/30 h-full">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Badge & Info Examen */}
                    <div className="lg:w-1/4 flex flex-col items-center gap-6 border-b lg:border-b-0 lg:border-r border-violet-500/20 pb-6 lg:pb-0 lg:pr-6">
                        <img 
                            src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/CPTS.png"
                            alt="CPTS Badge"
                            className="w-40 h-40 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                        />
                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between text-sm bg-[#0f0f13] p-3 rounded-lg border border-white/5">
                                <span className="text-gray-400">Durée Examen</span>
                                <span className="text-violet-300 font-mono font-bold">10 Jours</span>
                            </div>
                            <div className="flex items-center justify-between text-sm bg-[#0f0f13] p-3 rounded-lg border border-white/5">
                                <span className="text-gray-400">Flags requis</span>
                                <span className="text-violet-300 font-mono font-bold">12 / 14</span>
                            </div>
                            <div className="flex items-center justify-between text-sm bg-[#0f0f13] p-3 rounded-lg border border-white/5">
                                <span className="text-gray-400">Rapport</span>
                                <span className="text-violet-300 font-mono font-bold">Pro (anglais)</span>
                            </div>
                        </div>
                    </div>

                    {/* Détails Techniques */}
                    <div className="lg:w-3/4 pl-0 lg:pl-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-3xl font-bold text-white">CPTS</h3>
                                <p className="text-violet-400 text-lg">Certified Penetration Testing Specialist</p>
                            </div>
                            <button onClick={() => handleCertificationDetails('cpts')} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-violet-500/20">
                                <span>Détails</span>
                                <Target className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed mb-8 border-l-4 border-violet-500 pl-4 bg-violet-500/5 py-2">
                            Certification hautement technique simulant un <strong>test d'intrusion Black Box complet</strong> sur une infrastructure d'entreprise réaliste. 
                            Contrairement aux examens de type CTF/CTF-like, le CPTS exige une énumération méthodique, l'exploitation de vulnérabilités non triviales, 
                            le pivotage à travers plusieurs sous-réseaux et la compromission totale d'un domaine Active Directory.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <h4 className="text-white font-semibold flex items-center gap-2 text-sm border-b border-white/10 pb-2">
                                    <Shield className="w-4 h-4 text-violet-500" />
                                    Active Directory
                                </h4>
                                <ul className="text-xs text-gray-400 space-y-1.5">
                                    <li>• Kerberoasting / AS-REP Roasting</li>
                                    <li>• ACL Abuse & Object Takeover</li>
                                    <li>• Domain Trust Exploitation</li>
                                    <li>• Golden/Silver Ticket Attacks</li>
                                    <li>• AD Enumeration (BloodHound)</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-white font-semibold flex items-center gap-2 text-sm border-b border-white/10 pb-2">
                                    <Network className="w-4 h-4 text-violet-500" />
                                    Network & Pivot
                                </h4>
                                <ul className="text-xs text-gray-400 space-y-1.5">
                                    <li>• Double Pivoting / Tunneling</li>
                                    <li>• Port Forwarding (Chisel, Ligolo-ng)</li>
                                    <li>• Lateral Movement (PtH, PtT)</li>
                                    <li>• Protocol Exploitation (SMB, DNS)</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-white font-semibold flex items-center gap-2 text-sm border-b border-white/10 pb-2">
                                    <Globe className="w-4 h-4 text-violet-500" />
                                    Web & Services
                                </h4>
                                <ul className="text-xs text-gray-400 space-y-1.5">
                                    <li>• Advanced SQL Injection</li>
                                    <li>• SSTI & Command Injection</li>
                                    <li>• LFI/RFI to RCE chains</li>
                                    <li>• Web Shells & Evasion</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* 3. FONDAMENTAUX : eJPT & AZ-900 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* eJPT */}
            <div className="bg-[#1a1a1f] p-6 rounded-xl border border-red-900/20 hover:border-red-500/50 transition-all duration-300 flex flex-col">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                    <img src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/eJPT_badge.webp" className="w-16 h-16 bg-red-500/10 rounded-lg p-2" alt="eJPT" />
                    <div>
                        <h3 className="text-lg font-bold text-white">eJPTv2</h3>
                        <p className="text-red-400 text-sm">Junior Penetration Tester</p>
                    </div>
                    <div className="ml-auto text-right">
                         <span className="block text-xs text-gray-500 uppercase tracking-wide">Format</span>
                         <span className="text-sm text-gray-300 font-mono">48 Heures</span>
                    </div>
                </div>
                
                <div className="flex-1 space-y-4">
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Évaluation pratique axée sur les compétences offensives fondamentales. L'examen est un engagement dynamique nécessitant d'auditer un réseau d'entreprise simulé (DMZ + Internal).
                    </p>
                    <div className="bg-[#0f0f13] p-4 rounded-lg border border-white/5">
                        <h4 className="text-xs font-semibold text-red-400 uppercase mb-3">Compétences validées</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Terminal className="w-3 h-3 text-red-500" /> Host Enumeration
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Terminal className="w-3 h-3 text-red-500" /> Exploit Dev (Basic)
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Terminal className="w-3 h-3 text-red-500" /> Pivoting Routing
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Terminal className="w-3 h-3 text-red-500" /> Web Attacks (XSS/SQLi)
                            </div>
                        </div>
                    </div>
                </div>
                
                <button onClick={() => handleCertificationDetails('ejpt')} className="mt-6 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg text-sm transition-colors border border-red-500/20">
                    Détails de la certification
                </button>
            </div>

            {/* AZ-900 */}
            <div className="bg-[#1a1a1f] p-6 rounded-xl border border-cyan-900/20 hover:border-cyan-500/50 transition-all duration-300 flex flex-col">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                    <img src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/AZ900.png" className="w-16 h-16 bg-cyan-500/10 rounded-lg p-2" alt="AZ-900" />
                    <div>
                        <h3 className="text-lg font-bold text-white">Microsoft AZ-900</h3>
                        <p className="text-cyan-400 text-sm">Azure Fundamentals</p>
                    </div>
                    <div className="ml-auto text-right">
                         <span className="block text-xs text-gray-500 uppercase tracking-wide">Focus</span>
                         <span className="text-sm text-gray-300 font-mono">Cloud Arch</span>
                    </div>
                </div>
                
                <div className="flex-1 space-y-4">
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Validation de la compréhension architecturale du Cloud. Crucial pour comprendre les surfaces d'attaque modernes et la gestion des identités dans un environnement hybride.
                    </p>
                    <div className="bg-[#0f0f13] p-4 rounded-lg border border-white/5">
                        <h4 className="text-xs font-semibold text-cyan-400 uppercase mb-3">Core Concepts</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Cloud className="w-3 h-3 text-cyan-500" /> IaaS / PaaS / SaaS
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Lock className="w-3 h-3 text-cyan-500" /> Zero Trust Security
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Cpu className="w-3 h-3 text-cyan-500" /> Entra ID (Azure AD)
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Target className="w-3 h-3 text-cyan-500" /> Governance & Policies
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={() => handleCertificationDetails('az900')} className="mt-6 w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-lg text-sm transition-colors border border-cyan-500/20">
                    Détails de la certification
                </button>
            </div>

          </div>
        </div>

        {/* Mobile Button */}
        <button
          onClick={handleCertificationClick}
          className="w-full mt-8 md:hidden flex items-center justify-center gap-2 px-4 py-3 
                   bg-[#1a1a1f] rounded-lg hover:bg-[#2a2a2f] transition-all duration-300 
                   group border border-white/10 text-violet-400 font-semibold"
        >
          <span>Voir le catalogue complet</span>
          <Shield className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
};