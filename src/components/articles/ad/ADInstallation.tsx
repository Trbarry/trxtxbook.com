import React from 'react';
import { Server, Shield, Laptop, Monitor, HardDrive, Network } from 'lucide-react';

export const ADInstallation: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <h3 className="text-xl font-semibold text-violet-400 mb-6">Prérequis et Ressources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Configuration Matérielle</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• RAM : 32GB minimum recommandé</li>
              <li>• CPU : 4 cœurs minimum, virtualisation activée</li>
              <li>• Stockage : 250GB d'espace disponible</li>
              <li>• Réseau : Carte compatible VLAN</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Images ISO Requises</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Windows Server 2022 Standard/Datacenter</li>
              <li>• pfSense CE 2.7.0</li>
              <li>• Windows 11 Pro (x2)</li>
              <li>• Ubuntu Server 22.04 LTS</li>
              <li>• Kali Linux 2025.1</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <h3 className="text-xl font-semibold text-violet-400 mb-6">Configuration des Machines Virtuelles</h3>
        <div className="space-y-6">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Windows Server 2022 (DC)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div>
                <p className="font-medium text-violet-400 mb-2">Ressources :</p>
                <ul className="space-y-1">
                  <li>• RAM : 8 GB</li>
                  <li>• CPU : 4 cœurs</li>
                  <li>• Disque : 50 GB</li>
                  <li>• 2 cartes réseau (NAT + Interne)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-violet-400 mb-2">Rôles à installer :</p>
                <ul className="space-y-1">
                  <li>• AD DS (Active Directory Domain Services)</li>
                  <li>• DNS Server</li>
                  <li>• DHCP Server</li>
                  <li>• File and Storage Services</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">pfSense</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div>
                <p className="font-medium text-violet-400 mb-2">Ressources :</p>
                <ul className="space-y-1">
                  <li>• RAM : 2 GB</li>
                  <li>• CPU : 2 cœurs</li>
                  <li>• Disque : 4 GB</li>
                  <li>• 3 cartes réseau (WAN + LAN + DMZ)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-violet-400 mb-2">Configuration :</p>
                <ul className="space-y-1">
                  <li>• VLANs (1: Users, 2: Servers, 3: DMZ)</li>
                  <li>• DHCP pour chaque VLAN</li>
                  <li>• Règles de pare-feu</li>
                  <li>• VPN (OpenVPN)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Laptop className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Machines Clientes</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div>
                <p className="font-medium text-violet-400 mb-2">Windows 11 (x2) :</p>
                <ul className="space-y-1">
                  <li>• RAM : 4 GB</li>
                  <li>• CPU : 2 cœurs</li>
                  <li>• Disque : 30 GB</li>
                  <li>• 1 carte réseau (VLAN 1)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-violet-400 mb-2">Ubuntu Server :</p>
                <ul className="space-y-1">
                  <li>• RAM : 4 GB</li>
                  <li>• CPU : 2 cœurs</li>
                  <li>• Disque : 40 GB</li>
                  <li>• 1 carte réseau (VLAN 2)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-violet-400 mb-2">Kali Linux :</p>
                <ul className="space-y-1">
                  <li>• RAM : 4 GB</li>
                  <li>• CPU : 2 cœurs</li>
                  <li>• Disque : 40 GB</li>
                  <li>• 1 carte réseau (VLAN 3)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <h3 className="text-xl font-semibold text-violet-400 mb-6">Configuration Réseau</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Network className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Plan d'Adressage</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• VLAN 1 (Users) : 192.168.1.0/24</li>
              <li>• VLAN 2 (Servers) : 192.168.2.0/24</li>
              <li>• VLAN 3 (DMZ) : 192.168.3.0/24</li>
              <li>• WAN : DHCP depuis l'hôte</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Sécurité Réseau</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Isolation des VLANs</li>
              <li>• Filtrage inter-VLAN</li>
              <li>• IDS/IPS sur pfSense</li>
              <li>• Monitoring avec Zabbix</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};