import React from 'react';
import { Network, Server, Shield, Laptop } from 'lucide-react';

const NetworkDiagram = () => (
  <svg className="w-full h-96" viewBox="0 0 800 400">
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="#8b5cf6"
        />
      </marker>
    </defs>
    
    {/* Fond avec effet gradient */}
    <rect x="0" y="0" width="800" height="400" fill="#1a1a1f" rx="10" />
    
    {/* Internet */}
    <g transform="translate(350,20)">
      <rect
        x="0"
        y="0"
        width="100"
        height="40"
        rx="10"
        className="fill-violet-900/20 stroke-violet-500"
        strokeWidth="2"
      />
      <text x="50" y="25" textAnchor="middle" fill="#8b5cf6" className="text-sm">
        Internet
      </text>
    </g>

    {/* pfSense */}
    <g transform="translate(350,90)">
      <rect
        x="0"
        y="0"
        width="100"
        height="50"
        rx="10"
        className="fill-violet-900/20 stroke-violet-500"
        strokeWidth="2"
      />
      <text x="50" y="30" textAnchor="middle" fill="#8b5cf6" className="text-sm">
        pfSense
      </text>
    </g>

    {/* Windows Server 2022 */}
    <g transform="translate(150,180)">
      <rect
        x="0"
        y="0"
        width="140"
        height="80"
        rx="10"
        className="fill-violet-900/20 stroke-violet-500"
        strokeWidth="2"
      />
      <text x="70" y="35" textAnchor="middle" fill="#8b5cf6" className="text-sm">
        Windows Server 2022
      </text>
      <text x="70" y="55" textAnchor="middle" fill="#8b5cf6" className="text-sm">
        AD, DNS, DHCP
      </text>
    </g>

    {/* Monitoring Server */}
    <g transform="translate(330,180)">
      <rect
        x="0"
        y="0"
        width="140"
        height="80"
        rx="10"
        className="fill-violet-900/20 stroke-violet-500"
        strokeWidth="2"
      />
      <text x="70" y="35" textAnchor="middle" fill="#8b5cf6" className="text-sm">
        Ubuntu Server
      </text>
      <text x="70" y="55" textAnchor="middle" fill="#8b5cf6" className="text-sm">
        Zabbix/Graylog
      </text>
    </g>

    {/* Windows Clients */}
    <g transform="translate(510,180)">
      <rect
        x="0"
        y="0"
        width="140"
        height="80"
        rx="10"
        className="fill-violet-900/20 stroke-violet-500"
        strokeWidth="2"
      />
      <text x="70" y="35" textAnchor="middle" fill="#8b5cf6" className="text-sm">
        Windows 11 Clients
      </text>
      <text x="70" y="55" textAnchor="middle" fill="#8b5cf6" className="text-sm">
        2x Domain Joined
      </text>
    </g>

    {/* Kali Linux */}
    <g transform="translate(330,300)">
      <rect
        x="0"
        y="0"
        width="140"
        height="80"
        rx="10"
        className="fill-violet-900/20 stroke-violet-500"
        strokeWidth="2"
      />
      <text x="70" y="35" textAnchor="middle" fill="#8b5cf6" className="text-sm">
        Kali Linux
      </text>
      <text x="70" y="55" textAnchor="middle" fill="#8b5cf6" className="text-sm">
        Pentesting
      </text>
    </g>

    {/* Connexions */}
    {/* Internet -> pfSense */}
    <line
      x1="400"
      y1="60"
      x2="400"
      y2="90"
      stroke="#8b5cf6"
      strokeWidth="2"
      markerEnd="url(#arrowhead)"
    />

    {/* pfSense -> Servers */}
    <line
      x1="400"
      y1="140"
      x2="220"
      y2="180"
      stroke="#8b5cf6"
      strokeWidth="2"
      markerEnd="url(#arrowhead)"
    />
    <line
      x1="400"
      y1="140"
      x2="400"
      y2="180"
      stroke="#8b5cf6"
      strokeWidth="2"
      markerEnd="url(#arrowhead)"
    />
    <line
      x1="400"
      y1="140"
      x2="580"
      y2="180"
      stroke="#8b5cf6"
      strokeWidth="2"
      markerEnd="url(#arrowhead)"
    />

    {/* Kali -> Network */}
    <line
      x1="400"
      y1="260"
      x2="400"
      y2="300"
      stroke="#8b5cf6"
      strokeWidth="2"
      markerEnd="url(#arrowhead)"
      className="animate-pulse"
    />

    {/* VLAN Labels */}
    <text x="180" y="170" fill="#8b5cf6" className="text-xs">VLAN 2</text>
    <text x="580" y="170" fill="#8b5cf6" className="text-xs">VLAN 1</text>
    <text x="400" y="290" fill="#8b5cf6" className="text-xs">VLAN 3</text>
  </svg>
);

export const ADArchitecture: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <h3 className="text-xl font-semibold text-violet-400 mb-6">Vue d'Ensemble de l'Infrastructure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Infrastructure Virtuelle</h4>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Environnement virtualisé sous VirtualBox permettant de simuler une infrastructure complète 
              d'entreprise avec plusieurs machines virtuelles interconnectées.
            </p>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Sécurité et Segmentation</h4>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Réseau segmenté en VLANs distincts pour isoler les différents services et améliorer la sécurité 
              globale de l'infrastructure.
            </p>
          </div>
        </div>

        <NetworkDiagram />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Serveurs</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Windows Server 2022 (8GB RAM)</li>
              <li>• pfSense (2GB RAM)</li>
              <li>• Ubuntu/Debian - Monitoring (4GB RAM)</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Clients</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• 2x Windows 11 Pro (4GB RAM)</li>
              <li>• Kali Linux (4GB RAM)</li>
              <li>• Total: 26GB RAM requis</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Stockage</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Windows Server: 50GB</li>
              <li>• Clients: 30GB chacun</li>
              <li>• Total: ~200GB requis</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <h3 className="text-xl font-semibold text-violet-400 mb-6">Segmentation Réseau</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <h4 className="font-semibold mb-2">VLAN 1 - Utilisateurs</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Postes Windows 11</li>
              <li>• DHCP automatique</li>
              <li>• Accès contrôlé aux ressources</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <h4 className="font-semibold mb-2">VLAN 2 - Serveurs</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Windows Server 2022</li>
              <li>• pfSense</li>
              <li>• Serveur de monitoring</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <h4 className="font-semibold mb-2">VLAN 3 - DMZ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Zone démilitarisée</li>
              <li>• Services exposés</li>
              <li>• Tests de sécurité</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};