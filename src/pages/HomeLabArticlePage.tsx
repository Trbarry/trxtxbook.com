import React from 'react';
import { Cpu, Network, Shield, Zap, Box, Layers, ArrowLeft, Code } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useNavigate } from 'react-router-dom';

const HomeLabArticlePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-gray-100 pt-32 pb-24 transition-colors duration-300">
      <SEOHead 
        title="Deep Dive: HomeLab & Ambilight | Tristan Barry" 
        description="Étude technique sur l'infrastructure HomeLab, segmentation réseau L3 et traitement de signal 4K HDR." 
      />
      
      <article className="container mx-auto px-6 max-w-4xl">
        {/* Navigation retour */}
        <button 
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour aux projets
        </button>

        {/* Header de l'article */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-violet-400 bg-clip-text text-transparent">
            HomeLab Ecosystem: Security by Design
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed italic border-l-4 border-violet-500 pl-6">
            "Transformer une contrainte domestique en un laboratoire de cybersécurité et de traitement de signal."
          </p>
        </header>

        {/* Section 1: The Compute Layer */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-violet-400">
            <Cpu className="w-8 h-8" /> 01. The Compute Layer
          </h2>
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            <p>
              Le choix du <strong>Lenovo ThinkCentre M720q Tiny</strong> est dicté par le pragmatisme technique. Équipé d'un <strong>Intel Core i5-8400T</strong>, ce nœud offre le ratio idéal entre consommation électrique et capacités de virtualisation pour un environnement tournant 24/7.
            </p>

            <div className="my-10 group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <img 
                src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/Project-Tiny.webp" 
                alt="Lenovo ThinkCentre M720q Tiny Setup" 
                className="relative rounded-xl border border-white/10 w-full object-cover shadow-2xl"
              />
              <p className="text-center text-xs text-gray-500 mt-4 italic font-mono">
                Hardware Node: Lenovo M720q - 6 Cores / 6 Threads
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
              <div className="bg-[#1a1a1f] p-6 rounded-xl border border-white/5 shadow-2xl">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-violet-500" /> Hyperviseur : Proxmox VE
                </h3>
                <p className="text-sm text-gray-400">
                  Utilisation du <strong>Kernel 6.x</strong> pour une gestion optimisée des ressources. L'architecture repose sur une séparation stricte : les services légers en <strong>LXC</strong> pour minimiser l'<strong>overhead</strong>, et les briques critiques en <strong>VM</strong> isolées.
                </p>
              </div>
              <div className="bg-[#1a1a1f] p-6 rounded-xl border border-white/5 shadow-2xl">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-500" /> Hardware Passthrough
                </h3>
                <p className="text-sm text-gray-400">
                  L'intelligence du système repose sur le <strong>PCI/USB Passthrough</strong>. La carte de capture et l'iGPU sont mappés directement aux containers pour garantir une <strong>Latency</strong> ultra-faible et des performances natives.
                </p>
              </div>
            </div>

            <div className="my-10 p-2 bg-black/50 rounded-2xl border border-white/5 shadow-inner">
              <img 
                src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/proxmox.webp" 
                alt="Proxmox VE Virtualization Dashboard" 
                className="rounded-xl w-full grayscale-[0.3] hover:grayscale-0 transition-all duration-500"
              />
              <p className="text-center text-[10px] text-gray-600 mt-3 font-mono uppercase tracking-widest">
                Infrastructure Overview: Virtual Machines & Containers (LXC)
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Network Engineering & Security */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-violet-400">
            <Network className="w-8 h-8" /> 02. Network Engineering & Security
          </h2>
          
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            <p>
              La sécurité d'un <strong>HomeLab</strong> ne repose pas sur la complexité d'un mot de passe, mais sur la rigueur de sa segmentation et la finesse de son monitoring. L'objectif est d'appliquer le principe du moindre privilège à la couche réseau (L3) tout en maintenant une visibilité totale sur la couche applicative (L7).
            </p>

            <div className="bg-violet-900/10 border-l-4 border-violet-500 p-6 my-8 rounded-r-xl">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2 uppercase tracking-wider text-xs text-violet-400">
                <Shield className="w-4 h-4" /> Stratégie de Micro-Segmentation
              </h3>
              <p className="text-sm italic text-gray-400">
                "La segmentation réseau est à l'infrastructure ce que les compartiments étanches sont à la coque d'un navire : une brèche dans un secteur ne doit pas compromettre l'intégrité globale."
              </p>
            </div>

            <h3 className="text-2xl font-semibold text-white mt-12 mb-6 text-violet-100">Virtualiser la Gateway : OPNsense & Observabilité</h3>
            <p>
              En remplaçant la gestion réseau de la box FAI par une instance <strong>OPNsense</strong> virtualisée, l'infrastructure gagne en granularité. Le monitoring intégré via <strong>Insight</strong> et <strong>NetFlow</strong> permet de transformer des flux bruts en schémas mentaux clairs : qui parle à qui, sur quel port, et avec quel volume de données.
            </p>
            
            <p className="mt-4">
              Cette surveillance n'est pas passive : elle sert à détecter des anomalies de comportement et à ajuster les politiques de <strong>Traffic Shaping</strong> pour garantir que le flux 4K HDR reste prioritaire sur les flux de fond.
            </p>

            {/* Focus ZenArmor */}
            <div className="bg-[#1a1a1f] p-8 rounded-2xl border border-violet-500/20 my-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-violet-600/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest">Next-Gen Filtering</div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-violet-500" /> L7 Protection : ZenArmor (Sensei)
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Là où un firewall standard s'arrête à l'IP et au Port, <strong>ZenArmor</strong> apporte une inspection de niveau <strong>Layer 7</strong>. C'est le cerveau de l'analyse comportementale du lab.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-violet-400 font-bold block mb-1">Application Control</span>
                  Identification des flux chiffrés (TLS SNI) pour bloquer les services indésirables ou les trackers IoT.
                </div>
                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-violet-400 font-bold block mb-1">Web Content Filtering</span>
                  Protection contre le <strong>Malware</strong> et le <strong>Phishing</strong> via une base de réputation en temps réel.
                </div>
                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-violet-400 font-bold block mb-1">Advanced Reporting</span>
                  Génération de dashboards précis sur l'usage des ressources réseau, essentiels pour le diagnostic.
                </div>
                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-violet-400 font-bold block mb-1">Threat Intelligence</span>
                  Blocage automatique des adresses IP connues pour être des nœuds de botnets.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10 text-center">
              <div className="p-5 bg-[#1a1a1f] border border-white/5 rounded-xl hover:border-violet-500/30 transition-colors">
                <span className="text-violet-400 font-mono text-[10px] font-bold uppercase tracking-widest">VLAN 10</span>
                <h4 className="text-white font-bold mt-1">Management</h4>
                <p className="text-[11px] mt-2 text-gray-400">Interfaces d'administration. Accès <strong>Key-auth</strong> uniquement.</p>
              </div>
              <div className="p-5 bg-[#1a1a1f] border border-white/5 rounded-xl hover:border-violet-500/30 transition-colors">
                <span className="text-violet-400 font-mono text-[10px] font-bold uppercase tracking-widest">VLAN 20</span>
                <h4 className="text-white font-bold mt-1">Media</h4>
                <p className="text-[11px] mt-2 text-gray-400">Flux prioritaires <strong>QoS</strong> pour la Shield TV Pro et Jellyfin.</p>
              </div>
              <div className="p-5 bg-[#1a1a1f] border border-white/5 rounded-xl hover:border-violet-500/30 transition-colors">
                <span className="text-violet-400 font-mono text-[10px] font-bold uppercase tracking-widest">VLAN 30</span>
                <h4 className="text-white font-bold mt-1">IoT / Ambilight</h4>
                <p className="text-[11px] mt-2 text-gray-400"><strong>No WAN access</strong>. Isolé par ZenArmor pour limiter le mouvement latéral.</p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-white mt-12 mb-6 flex items-center gap-2">
              <Box className="w-6 h-6 text-violet-500" /> IDS/IPS Logic : Suricata
            </h3>
            <p>
              Pour compléter l'analyse comportementale, une instance <strong>Suricata</strong> tourne en mode <strong>IDS</strong> pour matcher les paquets contre des signatures connues de vulnérabilités.
            </p>

            <div className="bg-black/40 p-6 rounded-xl font-mono text-xs border border-white/5 my-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 bg-violet-500/10 text-violet-400 text-[10px]">LOG_FW_BLOCK</div>
              <p className="text-gray-500 mb-2"># Policy: Deep Packet Inspection & L7 Filtering</p>
              <p><span className="text-violet-400 font-bold">INSPECT</span> payload from <span className="text-blue-400">VLAN_IOT</span></p>
              {/* ✅ Correction : caractère '>' remplacé par '→' pour éviter l'erreur de build */}
              <p><span className="text-violet-400 font-bold">MATCH</span> app_type <span className="text-orange-400">"Streaming/Video"</span> → ALLOW</p>
              <p><span className="text-violet-400 font-bold">MATCH</span> category <span className="text-red-400">"Tracking/Ads"</span> → DROP by ZENARMOR</p>
              <p className="mt-4 text-red-500/80 font-bold">BLOCK ALL (Unknown Protocols)</p>
            </div>
          </div>
        </section>

        {/* Section 3: The Ambilight System & Signal Processing */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-violet-400">
            <Zap className="w-8 h-8" /> 03. The Ambilight System & Signal Processing
          </h2>
          
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            <p>
              L'enjeu est de transformer un flux <strong>4K HDR</strong> massif en données colorimétriques avec une <strong>Latency</strong> cible &lt; 15ms.
            </p>

            <div className="my-10 p-4 bg-[#1a1a1f] rounded-2xl border border-violet-500/10">
              <img 
                src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/hyperion.webp" 
                alt="Hyperion.ng Signal Processing Dashboard" 
                className="rounded-lg w-full shadow-2xl"
              />
              <p className="text-center text-xs text-violet-400/60 mt-4 font-mono uppercase tracking-tight">
                Signal Acquisition: Tone Mapping SDR/HDR & LED Layout Configuration
              </p>
            </div>

            <h3 className="text-2xl font-semibold text-white mt-12 mb-6 text-violet-100">La Chaîne d'Acquisition (Hardware Chain)</h3>
            <p>
              J'utilise un splitter avec <strong>Downscaler</strong> matériel pour conserver l'image native sur la TV tout en envoyant un flux 1080p SDR à la carte de capture.
            </p>

            <div className="my-10 p-8 bg-[#1a1a1f] rounded-2xl border border-white/5 relative overflow-hidden shadow-inner">
              <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center">
                <div className="flex-1 p-3 bg-black/40 rounded border border-white/10 w-full md:w-auto">
                  <span className="text-[10px] font-bold text-violet-400 tracking-tighter uppercase">SOURCE</span>
                  <p className="text-xs font-mono mt-1 uppercase text-gray-300">Shield Pro (4K HDR)</p>
                </div>
                <div className="text-violet-500 font-bold rotate-90 md:rotate-0">→</div>
                <div className="flex-1 p-3 bg-black/40 rounded border border-white/10 w-full md:w-auto">
                  <span className="text-[10px] font-bold text-violet-400 tracking-tighter uppercase">PROCESSING</span>
                  <p className="text-xs font-mono mt-1 uppercase text-gray-300">Hyperion LXC (Passthrough)</p>
                </div>
                <div className="text-violet-500 font-bold rotate-90 md:rotate-0">→</div>
                <div className="flex-1 p-3 bg-black/40 rounded border border-white/10 w-full md:w-auto">
                  <span className="text-[10px] font-bold text-violet-400 tracking-tighter uppercase">OUTPUT</span>
                  <p className="text-xs font-mono mt-1 uppercase text-gray-300">ESP32 / WLED (DDP)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
              <div className="space-y-4">
                <h4 className="text-violet-300 font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4" /> DDP vs E1.31
                </h4>
                <p className="text-sm text-gray-400">
                  Le protocole <strong>DDP</strong> permet un overhead réduit, indispensable pour piloter une haute densité de pixels.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-violet-300 font-bold flex items-center gap-2">
                  <Box className="w-4 h-4" /> LED Management (SK6812)
                </h4>
                <p className="text-sm text-gray-400">
                  L'utilisation de rubans <strong>SK6812 RGBNW</strong> assure une colorimétrie plus naturelle (Neutral White).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Orchestration & Future-Proofing */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-violet-400">
            <Box className="w-8 h-8" /> 04. Orchestration & Future-Proofing
          </h2>
          
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            <p>
              La gestion de la stack logicielle repose sur Docker pour l'isolation et des routines d'automatisation pour le <strong>Lifecycle management</strong>.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-12 mb-6 text-violet-100">Roadmap : Le pivot vers le Pentest Lab</h3>
            <p>
              La prochaine itération prévoit l'intégration de ressources dédiées à la cybersécurité offensive.
            </p>

            <ul className="space-y-4 my-8">
              <li className="flex items-start gap-3 bg-white/5 p-4 rounded-lg border border-white/5 hover:border-violet-500/20 transition-colors">
                <div className="mt-1 bg-violet-500/20 p-1 rounded">
                  <Code className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm underline decoration-violet-500/50">VLAN d'Attaque Isolé</h5>
                  <p className="text-xs text-gray-400">Déploiement d'instances <strong>Exegol</strong> et Kali Linux pour tester sans risque.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white/5 p-4 rounded-lg border border-white/5 hover:border-violet-500/20 transition-colors">
                <div className="mt-1 bg-violet-500/20 p-1 rounded">
                  <Box className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm underline decoration-violet-500/50">Vulnerable Targets</h5>
                  <p className="text-xs text-gray-400">Machines vulnérables pour pratiquer l'exploitation AD et le pivotement en local.</p>
                </div>
              </li>
            </ul>

            <div className="mt-16 pt-12 border-t border-white/5 text-center">
              <p className="text-sm text-gray-500 italic">
                Projet en évolution constante. Dernière mise à jour : Décembre 2025.
              </p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};

export default HomeLabArticlePage;