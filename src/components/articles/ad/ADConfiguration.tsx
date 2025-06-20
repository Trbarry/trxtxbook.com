import React from 'react';
import { Shield, Users, Settings, FileText, Network, Bell } from 'lucide-react';

export const ADConfiguration: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <h3 className="text-xl font-semibold text-violet-400 mb-6">Configuration Active Directory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Structure Organisationnelle</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• OU Départements (IT, RH, Finance)</li>
              <li>• OU Ordinateurs par service</li>
              <li>• OU Groupes de sécurité</li>
              <li>• OU Comptes de service</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Stratégies de Groupe (GPO)</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Politique de mots de passe</li>
              <li>• Restrictions logicielles</li>
              <li>• Mappages de lecteurs</li>
              <li>• Scripts de connexion</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <h3 className="text-xl font-semibold text-violet-400 mb-6">Services et Sécurité</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Network className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Services Réseau</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• DNS (zones, enregistrements)</li>
              <li>• DHCP (étendues, options)</li>
              <li>• Partages SMB</li>
              <li>• RDP sécurisé</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Monitoring</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Zabbix pour supervision</li>
              <li>• Graylog pour logs</li>
              <li>• Alertes automatiques</li>
              <li>• Tableaux de bord</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Sécurité</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Audit de sécurité</li>
              <li>• LAPS pour mots de passe</li>
              <li>• BitLocker</li>
              <li>• AppLocker</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <h3 className="text-xl font-semibold text-violet-400 mb-6">Documentation et Procédures</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Documentation Technique</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Schémas d'architecture</li>
              <li>• Configuration des services</li>
              <li>• Procédures de maintenance</li>
              <li>• Plans de reprise d'activité</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-violet-400" />
              <h4 className="font-semibold">Procédures de Sécurité</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Gestion des incidents</li>
              <li>• Politique de sauvegarde</li>
              <li>• Contrôle des accès</li>
              <li>• Audit et conformité</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};