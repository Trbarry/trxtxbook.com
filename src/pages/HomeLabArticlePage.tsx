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

            {/* VISUEL : LENOVO TINY */}
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

            {/* VISUEL : PROXMOX DASHBOARD */}
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
              La sécurité d'un <strong>HomeLab</strong> ne repose pas sur la complexité d'un mot de passe, mais sur la rigueur de sa segmentation. L'objectif est d'appliquer le principe du moindre privilège à la couche réseau (L3).
            </p>

            <div className="bg-violet-900/10 border-l-4 border-violet-500 p-6 my-8 rounded-r-xl">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2 uppercase tracking-wider text-xs text-violet-400">
                <Shield className="w-4 h-4" /> Stratégie de Micro-Segmentation
              </h3>
              <p className="text-sm italic text-gray-400">
                "La segmentation réseau est à l'infrastructure ce que les compartiments étanches sont à la coque d'un navire : une brèche dans un secteur ne doit pas compromettre l'intégrité globale."
              </p>
            </div>

            <h3 className="text-2xl font-semibold text-white mt-12 mb-6 text-violet-100">Virtualiser la Gateway : OPNsense</h3>
            <p>
              En remplaçant la gestion réseau de la box FAI par une instance <strong>OPNsense</strong> virtualisée, l'infrastructure gagne en granularité. Cela permet un contrôle total sur le <strong>Routing</strong> inter-VLAN et l'inspection des flux via <strong>IDS/IPS</strong>.
            </p>

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
                <p className="text-[11px] mt-2 text-gray-400"><strong>No WAN access</strong>. Communication isolée via protocole DDP (port 4048).</p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-white mt-12 mb-6 flex items-center gap-2">
              <Box className="w-6 h-6 text-violet-500" /> Firewall Rules logic
            </h3>
            <p>
              L'interopérabilité entre le service Hyperion (LXC) et l'ESP32 est sécurisée par une règle de filtrage unidirectionnelle stricte.
            </p>

            <div className="bg-black/40 p-6 rounded-xl font-mono text-xs border border-white/5 my-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 bg-violet-500/10 text-violet-400 text-[10px]">LOG_FW_BLOCK</div>
              <p className="text-gray-500 mb-2"># Rule: Ambilight Data Stream Authorization</p>
              <p><span className="text-violet-400 font-bold">PASS</span> from <span className="text-blue-400">LXC_HYPERION_IP</span></p>
              <p>to <span className="text-blue-400">ESP32_WLED_IP</span></p>
              <p>proto <span className="text-orange-400">UDP</span> port <span className="text-orange-400">4048</span></p>
              <p className="mt-4 text-red-500/80 font-bold">BLOCK ALL (Inter-VLAN Default)</p>
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
              L'enjeu ici est de transformer un flux <strong>4K HDR</strong> massif en données colorimétriques exploitables par 300+ LEDs, avec une <strong>Latency</strong> cible inférieure à 15ms pour une immersion sans décalage.
            </p>

            {/* VISUEL : HYPERION UI */}
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
              Les cartes de capture standard supportant rarement le 4K 60Hz HDR en boucle, j'utilise un splitter avec <strong>Downscaler</strong> matériel. Cela permet de conserver l'image native sur la TV tout en envoyant un flux 1080p SDR à la carte de capture.
            </p>

            {/* Visual Schema: Signal Flow */}
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

            <div className="bg-violet-900/10 p-6 rounded-xl border border-violet-500/20 my-8">
              <p className="text-sm text-gray-300">
                <strong className="text-violet-400">Note technique :</strong> Le <strong>USB Passthrough</strong> sous Proxmox nécessite de cibler l'ID statique du périphérique dans la configuration du LXC pour prévenir toute perte de session lors des redémarrages.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Orchestration, Lifecycle & Future Lab */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-violet-400">
            <Box className="w-8 h-8" /> 04. Orchestration & Future-Proofing
          </h2>
          
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            <p>
              Une infrastructure n'est pertinente que si elle est maintenable. La gestion de la stack logicielle repose sur une approche <strong>Infrastructure as Code</strong> simplifiée, utilisant Docker pour l'isolation des services et des routines d'automatisation pour le <strong>Lifecycle management</strong>.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-12 mb-6 text-violet-100">Container Orchestration (Multi-Service Stack)</h3>
            <p>
              Au-delà d'Hyperion, le nœud de calcul héberge une stack <strong>Docker Compose</strong> mutualisée. L'utilisation de réseaux Docker isolés (Internal Bridges) permet d'ajouter une couche de sécurité supplémentaire en empêchant les services de communiquer entre eux, sauf nécessité explicite.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
              <div className="bg-[#1a1a1f] p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors"></div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-500" /> Service Mesh
                </h4>
                <p className="text-sm text-gray-400">
                  Utilisation d'un <strong>Reverse Proxy</strong> pour centraliser les accès et gérer les certificats SSL. Chaque service est exposé via un DNS local, évitant l'exposition directe des ports sur l'hôte.
                </p>
              </div>
              <div className="bg-[#1a1a1f] p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors"></div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-500" /> Maintenance & Backups
                </h4>
                <p className="text-sm text-gray-400">
                  Routines de sauvegarde automatiques des configurations (LXC/VM) vers un stockage déporté. La mise à jour des images Docker est orchestrée pour garantir une <strong>uptime</strong> maximale des services critiques.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-white mt-12 mb-6">Roadmap : Le pivot vers le Pentest Lab</h3>
            <p>
              Cette infrastructure est conçue pour être modulaire. La prochaine itération prévoit l'intégration de ressources dédiées à la cybersécurité offensive, transformant ce HomeLab en un environnement de <strong>Red Teaming</strong> complet.
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
                Projet en évolution constante. Dernière mise à jour majeure : Décembre 2025.
              </p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};

export default HomeLabArticlePage;