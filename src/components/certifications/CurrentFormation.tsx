import React from 'react';
import { Shield, BookOpen, CheckCircle2 } from 'lucide-react';

export const CurrentFormation: React.FC = () => {
  return (
    <div className="mb-12 bg-[#1a1a1f] p-6 rounded-lg border border-blue-900/20 hover:border-blue-500/50 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-blue-400">Formation Actuelle</h2>
      </div>
      
      <div className="bg-[#2a2a2f] p-6 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500/10 p-3 rounded">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">BTS SIO option SISR</h3>
            <p className="text-gray-400 mb-4">
              Services Informatiques aux Organisations - Solutions d'Infrastructure, Systèmes et Réseaux
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="text-sm bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full">2025 - 2027</span>
              <span className="text-sm bg-green-500/10 text-green-300 px-3 py-1 rounded-full flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                En cours
              </span>
            </div>
            <div className="space-y-2 text-gray-400">
              <p className="text-sm leading-relaxed">
                Formation de niveau Bac+2 spécialisée dans l'administration des systèmes et réseaux. 
                Le BTS SIO option SISR forme des professionnels capables de gérer et maintenir 
                l'infrastructure informatique d'une organisation.
              </p>
              <div className="mt-4 space-y-2">
                <h4 className="text-blue-400 font-medium">Compétences développées :</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Administration des systèmes Windows et Linux</li>
                  <li>Gestion des infrastructures réseau</li>
                  <li>Sécurisation des systèmes d'information</li>
                  <li>Support et maintenance informatique</li>
                  <li>Virtualisation et solutions cloud</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};