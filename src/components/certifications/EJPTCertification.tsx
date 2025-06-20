import React from 'react';
import {
  Award,
  Calendar,
  ExternalLink,
  Shield,
  CheckCircle2,
  BookOpen,
  FileText,
  Target,
  Server,
  Network,
  Terminal
} from 'lucide-react';

export const EJPTCertification = () => {
  return (
    <div className="bg-[#1a1a1f] rounded-lg overflow-hidden border border-red-500/20 hover:border-red-500/50 transition-all duration-300 group">
      <div className="p-6">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold text-red-400">
                eLearnSecurity Junior Penetration Tester (eJPT)
              </h3>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Certification obtenue
              </span>
            </div>
            <span className="text-sm bg-red-500/10 text-red-400 px-3 py-1 rounded-full inline-block mt-2">
              INE Security
            </span>
          </div>
          <div className="relative flex-shrink-0 ml-6">
            <img
              src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/eJPT_badge.webp"
              alt="eJPT Badge"
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 object-contain rounded-lg bg-red-500/10 p-3 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>19 Février 2025</span>
        </div>

        <div className="space-y-6">
          {/* Description */}
          <p className="text-gray-300 leading-relaxed">
            L'eJPT est une certification pratique conçue pour valider les compétences de base en test d'intrusion. 
            Durant 48 heures, le candidat est placé dans un environnement réseau simulé (black box) 
            et doit identifier, exploiter et documenter des vulnérabilités réelles. 
            L'évaluation repose uniquement sur la pratique, sans QCM.
          </p>

          {/* Informations examen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-red-400">Informations Examen</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-red-400 mt-1" />
                  <span>Durée : 48 heures (environnement simulé)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-red-400 mt-1" />
                  <span>Test black box sur réseau inconnu</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-red-400 mt-1" />
                  <span>Soumission d'un fichier de réponses ( Flag )</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-red-400 mt-1" />
                  <span>Prix moyen : 200$ (inclus dans certains bundles INE)</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-red-400">Préparation & Outils</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-red-400 mt-1" />
                  <span>Cours INE eJPT (réseau, Linux, web, vulnérabilités)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Server className="w-4 h-4 text-red-400 mt-1" />
                  <span>Machines pratiques fournies dans l'environnement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Terminal className="w-4 h-4 text-red-400 mt-1" />
                  <span>Utilisation de Nmap, netcat, Burp, sqlmap, etc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-red-400 mt-1" />
                  <span>Temps estimé : 60 à 100 heures de préparation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Compétences acquises */}
          <div>
            <h4 className="font-medium mb-3 text-red-400">Compétences validées</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Reconnaissance réseau",
                "Énumération de services",
                "Exploitation web (SQLi, XSS, LFI)",
                "Failles système Linux & Windows",
                "Post-exploitation basique",
                "Pivoting simple",
                "Utilisation d'outils standards",
                "Analyse de services",
                "Méthodologie offensive"
              ].map((skill, i) => (
                <span
                  key={i}
                  className="text-sm bg-red-500/10 text-red-400 px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Objectifs pédagogiques */}
          <div>
            <h4 className="font-medium mb-3 text-red-400">Ce que prouve cette certification</h4>
            <ul className="space-y-2">
              {[
                "Capacité à analyser et cartographier un réseau inconnu",
                "Savoir détecter et exploiter des failles web et systèmes",
                "Compréhension des techniques de reconnaissance, d'exploitation et de post-exploitation",
                "Maîtrise de la méthodologie offensive structurée",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-red-400 mt-1 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Boutons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <a
              href="https://certs.ine.com/78eeee62-7815-4a8a-adb8-33a57874feb6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-red-500/10 text-red-400
                         px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors group/cert"
            >
              <Award className="w-4 h-4" />
              <span>Voir le certificat</span>
              <ExternalLink className="w-4 h-4 transform transition-transform group-hover/cert:translate-x-1" />
            </a>

            <a
              href="https://certs.ine.com/78eeee62-7815-4a8a-adb8-33a57874feb6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-[#2a2a2f] text-red-400
                         px-4 py-2 rounded-lg hover:bg-[#3a3a3f] transition-colors group/verify"
            >
              <Shield className="w-4 h-4" />
              <span>Vérifier</span>
              <ExternalLink className="w-4 h-4 transform transition-transform group-hover/verify:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};