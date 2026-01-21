import React from 'react';
import { Cpu, Network, Shield, Zap, Box, Layers, ArrowLeft, Code, Tv, Activity } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useNavigate } from 'react-router-dom';

// Infographie technique du pipeline Hyperion
const HyperionFlowVisual = () => (
  <div className="my-12 p-8 bg-[#0a0a0f] rounded-2xl border border-white/5 relative overflow-hidden shadow-2xl">
    <div className="absolute top-0 right-0 p-4 opacity-5">
      <Activity className="w-32 h-32 text-violet-500" />
    </div>
    
    <svg viewBox="0 0 800 300" className="w-full h-auto">
      {/* Grilles de fond */}
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Chemins de flux (Animation) */}
      <path d="M150 150 H 650" stroke="url(#flowGradient)" strokeWidth="2" fill="none">
        <animate attributeName="stroke-dasharray" from="0, 800" to="800, 0" dur="3s" repeatCount="indefinite" />
      </path>

      {/* Nœud 1: Source */}
      <rect x="50" y="110" width="120" height="80" rx="8" fill="#1a1a1f" stroke="#333" />
      <text x="110" y="145" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">SHIELD PRO</text>
      <text x="110" y="165" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontFamily="monospace">4K HDR Signal</text>

      {/* Nœud 2: Splitter/Downscaler */}
      <circle cx="280" cy="150" r="45" fill="#1a1a1f" stroke="#8b5cf6" strokeWidth="2" filter="url(#glow)" />
      <text x="280" y="145" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">SPLITTER</text>
      <text x="280" y="160" textAnchor="middle" fill="#aaa" fontSize="9">Hardware</text>
      <text x="280" y="170" textAnchor="middle" fill="#aaa" fontSize="9">Downscale</text>

      {/* Nœud 3: Hyperion (LXC) */}
      <rect x="420" y="110" width="140" height="80" rx="8" fill="#1a1a1f" stroke="#8b5cf6" strokeWidth="2" filter="url(#glow)" />
      <text x="490" y="140" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">HYPERION.NG</text>
      <text x="490" y="155" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontFamily="monospace">LXC Container</text>
      <text x="490" y="175" textAnchor="middle" fill="#aaa" fontSize="9">Tone Mapping L7</text>

      {/* Nœud 4: ESP32 */}
      <rect x="630" y="110" width="120" height="80" rx="8" fill="#1a1a1f" stroke="#333" />
      <text x="690" y="145" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">ESP32 / WLED</text>
      <text x="690" y="165" textAnchor="middle" fill="#orange" fontSize="10" fontFamily="monospace">DDP Protocol</text>

      {/* Légendes flèches */}
      <text x="215" y="130" textAnchor="middle" fill="#555" fontSize="8" fontWeight="bold">HDMI 2.0</text>
      <text x="365" y="130" textAnchor="middle" fill="#555" fontSize="8" fontWeight="bold">USB GRABBER</text>
      <text x="595" y="130" textAnchor="middle" fill="#555" fontSize="8" fontWeight="bold">UDP 4048</text>
    </svg>
    
    <div className="grid grid-cols-3 gap-4 mt-6 text-[10px] font-mono uppercase tracking-widest text-gray-500">
      <div className="text-center">Input Stage</div>
      <div className="text-center text-violet-400">Processing Stage</div>
      <div className="text-center">Output Stage</div>
    </div>
  </div>
);

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
      Le choix du <strong>Lenovo ThinkCentre M720q Tiny</strong> n'est pas esthétique, mais dicté par une efficacité opérationnelle stricte. Dans un environnement 24/7, le ratio <strong>Performance-per-Watt</strong> est le KPI (Key Performance Indicator) prioritaire.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
      <div className="space-y-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Box className="w-5 h-5 text-violet-500" /> Pourquoi le format "Tiny" ?
        </h3>
        <p className="text-sm text-gray-400">
          Le châssis M720q offre une densité de calcul remarquable. L'<strong>Intel Core i5-8400T</strong> (35W TDP) dispose de <strong>6 cœurs physiques</strong>, ce qui est crucial pour éviter l'<strong>over-provisioning</strong> CPU lors de l'exécution simultanée de plusieurs instances critiques. 
        </p>
        <p className="text-sm text-gray-400">
          L'atout majeur reste le support de <strong>Intel QuickSync</strong> via l'iGPU, permettant un <strong>Hardware Transcoding</strong> fluide pour Jellyfin sans saturer les cœurs CPU. Sa modularité permet également une extension jusqu'à <strong>24GB de RAM</strong>, indispensable pour la montée en charge du lab.
        </p>
      </div>
      <div className="space-y-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-violet-500" /> L'arbitrage LXC vs VM
        </h3>
        <p className="text-sm text-gray-400">
          Sous <strong>Proxmox VE</strong>, la stratégie repose sur la réduction de la couche d'abstraction. L'utilisation de <strong>LXC (Linux Containers)</strong> permet de partager le <strong>Kernel</strong> de l'hôte, garantissant un <strong>overhead</strong> proche de zéro et une gestion dynamique de la RAM.
        </p>
        <p className="text-sm text-gray-400">
          D'ailleurs, mon instance <strong>LXC</strong> est configurée de manière minimaliste pour héberger <strong>exclusivement</strong> un moteur <strong>Docker</strong> : l'intégralité des micro-services y est orchestrée via <strong>docker-compose</strong>. Cette approche hybride combine la légèreté du container système avec la portabilité et la facilité de déploiement de l'<strong>Infrastructure as Code</strong>.
        </p>
      </div>
    </div>

    {/* VISUEL : LENOVO TINY SETUP */}
    <div className="my-10 group relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
      <img 
        src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/Project-Tiny.webp" 
        alt="Lenovo ThinkCentre M720q Tiny Setup" 
        className="relative rounded-xl border border-white/10 w-full object-cover shadow-2xl"
      />
      <p className="text-center text-xs text-gray-500 mt-4 italic font-mono uppercase tracking-widest">
        Node: i5-8400T | 24GB DDR4 | NVMe + SATA Storage Stack
      </p>
    </div>

    <div className="bg-[#1a1a1f] p-6 rounded-xl border border-white/5 shadow-2xl my-10">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-violet-500" /> Kernel Optimization
      </h3>
      <p className="text-sm text-gray-400">
        L'implémentation du <strong>Kernel 6.x</strong> assure une compatibilité native avec les dernières technologies de virtualisation. Le système est configuré pour le <strong>Hardware Passthrough</strong>, permettant d'exposer directement le contrôleur USB à l'instance de traitement pour réduire drastiquement la <strong>Latency</strong> de capture.
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
              Cette surveillance n'est pas passive : elle sert à détecter des anomalies de comportement (ex: un ESP32 tentant de joindre le VLAN de Management) et à ajuster les politiques de <strong>Traffic Shaping</strong> pour garantir que le flux 4K HDR reste prioritaire sur les mises à jour système en arrière-plan.
            </p>

            {/* Focus ZenArmor (NGFW) */}
            <div className="bg-[#1a1a1f] p-8 rounded-2xl border border-violet-500/20 my-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-violet-600/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest">Next-Gen Filtering</div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-violet-500" /> L7 Protection : ZenArmor (Sensei)
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Là où un firewall standard s'arrête à l'IP et au Port, <strong>ZenArmor</strong> apporte une inspection de niveau <strong>Layer 7 (Application Layer)</strong>. C'est le cerveau de l'analyse comportementale du lab.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-violet-400 font-bold block mb-1">Application Control</span>
                  Identification des flux chiffrés (TLS SNI) pour bloquer les services indésirables ou les trackers IoT sans casser le chiffrement.
                </div>
                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-violet-400 font-bold block mb-1">Web Content Filtering</span>
                  Protection contre le <strong>Malware</strong> et le <strong>Phishing</strong> via une base de réputation mise à jour en temps réel, isolant les cibles vulnérables du lab.
                </div>
                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-violet-400 font-bold block mb-1">Advanced Reporting</span>
                  Génération de dashboards précis sur l'usage des ressources réseau, essentiels pour le diagnostic de latence dans le pipeline vidéo.
                </div>
                <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-violet-400 font-bold block mb-1">Threat Intelligence</span>
                  Blocage automatique des adresses IP connues pour être des nœuds de botnets ou des scanners offensifs.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10 text-center">
              <div className="p-5 bg-[#1a1a1f] border border-white/5 rounded-xl hover:border-violet-500/30 transition-colors">
                <span className="text-violet-400 font-mono text-[10px] font-bold uppercase tracking-widest">VLAN 10</span>
                <h4 className="text-white font-bold mt-1">Management</h4>
                <p className="text-[11px] mt-2 text-gray-400">Interfaces d'administration. Accès via <strong>Key-auth</strong> SSH uniquement.</p>
              </div>
              <div className="p-5 bg-[#1a1a1f] border border-white/5 rounded-xl hover:border-violet-500/30 transition-colors">
                <span className="text-violet-400 font-mono text-[10px] font-bold uppercase tracking-widest">VLAN 20</span>
                <h4 className="text-white font-bold mt-1">Media</h4>
                <p className="text-[11px] mt-2 text-gray-400">Flux prioritaires <strong>QoS</strong> pour la Shield TV Pro et Jellyfin.</p>
              </div>
              <div className="p-5 bg-[#1a1a1f] border border-white/5 rounded-xl hover:border-violet-500/30 transition-colors">
                <span className="text-violet-400 font-mono text-[10px] font-bold uppercase tracking-widest">VLAN 30</span>
                <h4 className="text-white font-bold mt-1">IoT / Ambilight</h4>
                <p className="text-[11px] mt-2 text-gray-400">{"No WAN access"}. Isolé par ZenArmor pour limiter le <strong>lateral movement</strong>.</p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-white mt-12 mb-6 flex items-center gap-2">
              <Box className="w-6 h-6 text-violet-500" /> IDS/IPS Logic : Suricata
            </h3>
           
          </div>
        </section>

        {/* Section 3: The Ambilight System & Signal Processing */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-violet-400">
            <Zap className="w-8 h-8" /> 03. The Ambilight System & Signal Processing
          </h2>
          
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            <p>
              L'enjeu ici est de transformer un flux <strong>4K HDR</strong> massif en données colorimétriques exploitables par 300+ LEDs, avec une <strong>Latency</strong> cible inférieure à 15ms pour une immersion sans décalage.
            </p>

            {/* INFOGRAPHIE SVG ANIMÉE */}
            <HyperionFlowVisual />

            <h3 className="text-2xl font-semibold text-white mt-12 mb-6 text-violet-100">La Chaîne d'Acquisition (Hardware Chain)</h3>
            <p>
              Les cartes de capture standard supportant rarement le 4K 60Hz HDR en boucle, j'utilise un splitter avec <strong>Downscaler</strong> matériel. Cela permet de conserver l'image native sur la TV tout en envoyant un flux 1080p SDR à la carte de capture.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-12 mb-6">Le défi du Tone Mapping</h3>
            <p>
              Capturer du HDR via une carte SDR produit des couleurs "délavées". Pour pallier cela, <strong>Hyperion.ng</strong> traite le signal via un algorithme de <strong>Tone Mapping</strong> en temps réel, garantissant que les LEDs reflètent la dynamique réelle de l'image.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
              <div className="space-y-4">
                <h4 className="text-violet-300 font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4" /> DDP vs E1.31
                </h4>
                <p className="text-sm text-gray-400">
                  Le choix du protocole <strong>DDP (Distributed Display Protocol)</strong> permet un <strong>Network Overhead</strong> réduit par rapport à l'E1.31, indispensable pour piloter une haute densité de pixels sans congestion.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-violet-300 font-bold flex items-center gap-2">
                  <Box className="w-4 h-4" /> LED Management (SK6812)
                </h4>
                <p className="text-sm text-gray-400">
                  L'utilisation de rubans <strong>SK6812 RGBNW</strong> (Neutral White) assure une colorimétrie plus naturelle et une meilleure profondeur lumineuse que les rubans RGB standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Orchestration & Ecosystem Management */}
<section className="mb-20">
  <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-violet-400">
    <Box className="w-8 h-8" /> 04. Orchestration & Ecosystem Management
  </h2>
  
  <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
    <p>
      Une infrastructure n'est pertinente que si elle est maintenable. L'intégralité de la stack logicielle est pilotée par <strong>Docker Compose</strong> au sein d'un container <strong>LXC</strong> privilégié. Cette approche permet une isolation stricte des dépendances tout en facilitant le <strong>Lifecycle management</strong> (mises à jour, sauvegardes, portabilité).
    </p>

    <h3 className="text-2xl font-semibold text-white mt-12 mb-6 text-violet-100">The Service Mesh: Access & Visibility</h3>
    <p>
      Le point d'entrée unique de l'écosystème repose sur un couple <strong>Reverse Proxy</strong> et <strong>Dashboard</strong>. Cette couche fait abstraction de la complexité technique pour offrir une interface utilisateur unifiée.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
      <div className="bg-[#1a1a1f] p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Network className="w-12 h-12 text-violet-500" />
        </div>
        <h4 className="text-white font-bold mb-3">Nginx Proxy Manager</h4>
        <p className="text-sm text-gray-400">
          Gestion centralisée des flux HTTP/HTTPS. Il assure la terminaison <strong>SSL/TLS</strong> et la résolution des noms de domaine internes, évitant l'exposition directe des ports applicatifs sur l'hôte Proxmox.
        </p>
      </div>
      <div className="bg-[#1a1a1f] p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Layers className="w-12 h-12 text-violet-500" />
        </div>
        <h4 className="text-white font-bold mb-3">Homepage Dashboard</h4>
        <p className="text-sm text-gray-400">
          La tour de contrôle du lab. Intégrée via API, elle affiche en temps réel l'état des containers, les statistiques de bande passante et les alertes de sécurité du <strong>firewall</strong>.
        </p>
      </div>
    </div>

    <h3 className="text-2xl font-semibold text-white mt-12 mb-6 text-violet-100">Automated Media Pipeline & Security</h3>
    <p>
      L'infrastructure gère de manière autonome le cycle de vie des données, du téléchargement sécurisé au stockage de secrets.
    </p>

    <div className="bg-[#1a1a1f] border border-white/5 rounded-2xl overflow-hidden my-10 shadow-2xl">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <h4 className="text-white font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-500" /> Data & Media Stack
        </h4>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-violet-400 font-mono text-[10px] font-bold uppercase">Download / Automation</span>
            <p className="text-sm text-gray-300"><strong>qBittorrent</strong> couplé à <strong>Prowlarr</strong> pour la gestion automatisée des indexeurs et des flux de données, le tout isolé via des réseaux Docker internes.</p>
          </div>
          <div className="space-y-2">
            <span className="text-violet-400 font-mono text-[10px] font-bold uppercase">IoT / Visuals</span>
            <p className="text-sm text-gray-300"><strong>Hyperion.ng</strong> opérant en tant que service de traitement de signal prioritaire avec accès direct au matériel via <strong>USB Passthrough</strong>.</p>
          </div>
          <div className="space-y-2">
            <span className="text-violet-400 font-mono text-[10px] font-bold uppercase">Security / Vault</span>
            <p className="text-sm text-gray-300">Instance <strong>Vaultwarden</strong> (Bitwarden API) pour la gestion chiffrée des identifiants et des secrets de l'infrastructure, accessible uniquement via <strong>VLAN Management</strong>.</p>
          </div>
        </div>
      </div>
    </div>

    <h3 className="text-2xl font-semibold text-white mt-12 mb-6">Roadmap : Le pivot vers le Pentest Lab</h3>
    <p>
      Cette architecture <strong>Docker-centric</strong> est conçue pour être modulaire. La prochaine itération prévoit l'intégration de ressources dédiées à la cybersécurité offensive.
    </p>

    <ul className="space-y-4 my-8">
      <li className="flex items-start gap-3 bg-white/5 p-4 rounded-lg border border-white/5 hover:border-violet-500/20 transition-colors">
        <div className="mt-1 bg-violet-500/20 p-1 rounded">
          <Code className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h5 className="text-white font-bold text-sm underline decoration-violet-500/50">VLAN d'Attaque Isolé</h5>
          <p className="text-xs text-gray-400">Déploiement d'instances <strong>Exegol</strong> et Kali Linux au sein d'un segment réseau spécifique pour tester des vecteurs d'attaque sans risque pour le reste de l'infra.</p>
        </div>
      </li>
      <li className="flex items-start gap-3 bg-white/5 p-4 rounded-lg border border-white/5 hover:border-violet-500/20 transition-colors">
        <div className="mt-1 bg-violet-500/20 p-1 rounded">
          <Box className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h5 className="text-white font-bold text-sm underline decoration-violet-500/50">Vulnerable Targets (HoneyPots)</h5>
          <p className="text-xs text-gray-400">Mise en place de machines vulnérables (style HTB/TryHackMe) pour pratiquer l'exploitation Active Directory et le pivotement réseau en local.</p>
        </div>
      </li>
    </ul>

    <div className="mt-16 pt-12 border-t border-white/5 text-center">
      <p className="text-sm text-gray-500 italic">
        Infrastructure scalable par design. Dernière mise à jour de la stack : Décembre 2025.
      </p>
    </div>
  </div>
</section>
      </article>
    </div>
  );
};

export default HomeLabArticlePage;