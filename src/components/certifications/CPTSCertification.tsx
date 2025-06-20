import React from 'react';
import {
  Award,
  Calendar,
  ExternalLink,
  Shield,
  CheckCircle2,
  Lock,
  BookOpen,
  FileText,
  Target,
  Server,
  Network,
  Code,
  FileSignature
} from 'lucide-react';

export const CPTSCertification = () => {
  return (
    <div className="bg-[#1a1a1f] rounded-lg overflow-hidden border border-violet-500/20 hover:border-violet-500/50 transition-all duration-300 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold text-violet-400">Certified Penetration Testing Specialist (CPTS)</h3>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Certification obtenue
              </span>
            </div>
            <span className="text-sm bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full inline-block mt-2">
              Hack The Box Academy
            </span>
          </div>
          <div className="relative flex-shrink-0 ml-6">
            <img 
              src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/CPTS.png"
              alt="CPTS Badge"
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 object-contain rounded-lg bg-violet-500/10 p-3 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Mars 2025</span>
        </div>

        <div className="space-y-6">
          <p className="text-gray-300 leading-relaxed">
            Le CPTS est une certification avancée délivrée par Hack The Box validant des compétences pratiques en tests d'intrusion. 
            L'examen de 10 jours simule un test d'intrusion complet sur une infrastructure réelle, combinant réseau interne, DMZ et services exposés.
            Il s'agit d'un examen 100% pratique nécessitant l'exploitation réelle de vulnérabilités et la rédaction d'un rapport professionnel.
          </p>

          {/* Informations clés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-violet-400">Informations Examen</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-violet-400 mt-1" />
                  <span>10 jours d'examen </span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-violet-400 mt-1" />
                  <span>12 flags sur 14 minimum requis</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileSignature className="w-4 h-4 text-violet-400 mt-1" />
                  <span>Rapport d'environ 190 pages, en anglais, requis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-violet-400 mt-1" />
                  <span>490$ (2 tentatives incluses)</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-violet-400">Temps de Préparation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-violet-400 mt-1" />
                  <span>≈ 160h modules HTB Academy</span>
                </li>
                <li className="flex items-start gap-2">
                  <Server className="w-4 h-4 text-violet-400 mt-1" />
                  <span>≈ 30h labs de la série IppSec (Unofficial CPTS Prep)</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-violet-400 mt-1" />
                  <span>≈ 30–60h pour la rédaction du rapport</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-violet-400 mt-1" />
                  <span>Total : 200–250 heures de préparation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Rapport d'examen */}
          <div className="bg-[#2a2a2f] p-4 rounded-lg">
            <h4 className="font-medium mb-3 text-violet-400">Rapport d'Examen Professionnel</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Le rapport à produire est une pièce centrale de la certification CPTS. Rédigé intégralement en anglais, il couvre environ <strong>190 pages</strong> incluant :
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>• Une introduction professionnelle et une portée clairement définie</li>
              <li>• La documentation complète de chaque vulnérabilité identifiée</li>
              <li>• Des captures d'écran claires avec preuves d'exploitation et indicateurs techniques</li>
              <li>• Des chaînes d'exploitation complexes et documentées de bout en bout</li>
              <li>• Des remédiations techniques détaillées, adaptées à chaque vulnérabilité</li>
              <li>• Un format structuré selon les normes de reporting professionnel (SysReptor ou Obsidian recommandé)</li>
            </ul>
          </div>

          {/* Compétences visées */}
          <div>
            <h4 className="font-medium mb-3 text-violet-400">Compétences Validées</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Reconnaissance interne/externe",
                "Exploitation de services & Web",
                "Active Directory",
                "Post-exploitation",
                "Dump NTDS.dit / SAM / LSASS",
                "Pivoting et tunneling",
                "Escalade de privilèges",
                "Rédaction de rapports",
                "Exploitation manuelle"
              ].map((skill, i) => (
                <span 
                  key={i}
                  className="text-sm bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <a
              href="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/CPTSCERT.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-violet-500/10 text-violet-400
                       px-4 py-2 rounded-lg hover:bg-violet-500/20 transition-colors group/cert"
            >
              <Award className="w-4 h-4" />
              <span>Voir le certificat</span>
              <ExternalLink className="w-4 h-4 transform transition-transform group-hover/cert:translate-x-1" />
            </a>
            <a
              href="https://www.credly.com/badges/d1be2f10-3eef-4964-bc1f-6d463bf4dc76"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-[#2a2a2f] text-violet-400
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