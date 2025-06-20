import React from 'react';
import { Award, Calendar, ExternalLink, Shield, CheckCircle2, Lock, BookOpen, FileText, Target, Network, Server, Code } from 'lucide-react';

export const BTSCertification = () => {
  return (
    <div className="bg-[#1a1a1f] rounded-lg overflow-hidden border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold text-blue-400">BTS SIO option SISR</h3>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                En cours
              </span>
            </div>
            <span className="text-sm bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full inline-block mt-2">
              Services Informatiques aux Organisations
            </span>
          </div>
          <div className="relative flex-shrink-0 ml-6">
            <img 
              src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/BTS-SIO.png"
              alt="BTS SIO Logo"
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 object-contain rounded-lg bg-blue-500/10 p-3 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>2025 - 2027</span>
        </div>

        <div className="space-y-6">
          <p className="text-gray-300 leading-relaxed">
            Formation de niveau Bac+2 spécialisée dans l'administration des systèmes et réseaux. 
            Le BTS SIO option SISR forme des professionnels capables de gérer et maintenir 
            l'infrastructure informatique d'une organisation.
          </p>

          {/* Informations clés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-400">Programme</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <Server className="w-4 h-4 text-blue-400 mt-1" />
                  <span>Administration des systèmes Windows et Linux</span>
                </li>
                <li className="flex items-start gap-2">
                  <Network className="w-4 h-4 text-blue-400 mt-1" />
                  <span>Gestion des infrastructures réseau</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-400 mt-1" />
                  <span>Sécurisation des systèmes d'information</span>
                </li>
                <li className="flex items-start gap-2">
                  <Code className="w-4 h-4 text-blue-400 mt-1" />
                  <span>Développement et scripting</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-400">Alternance</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-400 mt-1" />
                  <span>2 semaines entreprise / 2 semaines formation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-400 mt-1" />
                  <span>1350 heures de formation</span>
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400 mt-1" />
                  <span>Projets professionnels en situation réelle</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Compétences visées */}
          <div>
            <h4 className="font-medium mb-3 text-blue-400">Compétences Développées</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Administration système",
                "Gestion de réseaux",
                "Cybersécurité",
                "Support technique",
                "Virtualisation",
                "Cloud computing",
                "Scripting",
                "Supervision IT"
              ].map((skill, i) => (
                <span 
                  key={i}
                  className="text-sm bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <button
              disabled
              className="inline-flex items-center gap-2 text-sm bg-[#2a2a2f] text-gray-500
                       px-4 py-2 rounded-lg cursor-not-allowed opacity-50"
            >
              <Award className="w-4 h-4" />
              <span>Voir le diplôme</span>
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};