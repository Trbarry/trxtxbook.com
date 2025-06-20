import React from 'react';
import { FileText, Shield, Lightbulb } from 'lucide-react';

export const ADScripts: React.FC = () => {
  return (
    <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
      <h3 className="text-xl font-semibold text-violet-400 mb-6">Scripts d'Automatisation</h3>
      <div className="space-y-6">
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-violet-400" />
            <h4 className="font-semibold">Scripts de Gestion des Utilisateurs</h4>
          </div>
          <div className="space-y-4">
            <p className="text-gray-300">
              Les scripts PowerShell peuvent automatiser la création et la gestion des utilisateurs :
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-violet-400 mt-1" />
                <span>Import d'utilisateurs depuis un fichier CSV</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-violet-400 mt-1" />
                <span>Création automatisée des comptes</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-violet-400 mt-1" />
                <span>Attribution des groupes de sécurité</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-violet-400 mt-1" />
                <span>Gestion des mots de passe</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-violet-400" />
            <h4 className="font-semibold">Scripts d'Audit et Sécurité</h4>
          </div>
          <div className="space-y-4">
            <p className="text-gray-300">
              Les scripts d'audit permettent de maintenir la sécurité du domaine :
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-violet-400 mt-1" />
                <span>Vérification des mots de passe expirés</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-violet-400 mt-1" />
                <span>Audit des groupes de sécurité</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-violet-400 mt-1" />
                <span>Surveillance des connexions</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-violet-400 mt-1" />
                <span>Rapports de sécurité automatisés</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};