import React from 'react';
import {
  Award,
  Calendar,
  ExternalLink,
  Shield,
  CheckCircle2,
  Cloud,
  Globe,
  Cpu,
  Lock,
  Target,
  FileCheck,
  Fingerprint
} from 'lucide-react';

export const AZ900Certification = () => {
  return (
    /* Changement de couleur : border-blue-500 au lieu de violet */
    <div className="bg-[#1a1a1f] rounded-lg overflow-hidden border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              {/* Titre en Bleu Microsoft */}
              <h3 className="text-xl font-semibold text-blue-400">Microsoft Certified: Azure Fundamentals</h3>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Validée
              </span>
            </div>
            <div className="flex gap-2 mt-2">
                <span className="text-sm bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full inline-block">
                Microsoft
                </span>
                <span className="text-sm bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full inline-block">
                AZ-900
                </span>
            </div>
          </div>
          <div className="relative flex-shrink-0 ml-6">
            <img 
              src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/AZ900.png"
              alt="AZ-900 Badge"
              /* Fond bleu pour l'image */
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 object-contain rounded-lg bg-blue-500/10 p-3 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Obtenue le 11 Novembre 2025</span>
        </div>

        <div className="space-y-6">
          {/* Description Étoffée */}
          <div className="text-gray-300 leading-relaxed space-y-2">
            <p>
                Cette certification est la pierre angulaire de l'architecture Cloud moderne. Elle ne se limite pas à connaître les services, mais valide une compréhension profonde du <strong>modèle de responsabilité partagée</strong>, de la transition du CapEx vers l'OpEx, et des architectures hybrides.
            </p>
            <p>
                Elle atteste de ma capacité à concevoir des solutions scalables en utilisant les briques fondamentales d'Azure (Compute, Storage, Networking) tout en maîtrisant les enjeux critiques de <strong>Gouvernance (Azure Policy)</strong> et de <strong>Sécurité des Identités (Microsoft Entra ID)</strong>.
            </p>
          </div>

          {/* Informations Officielles du Titre */}
          <div className="bg-[#1e293b] border border-blue-500/10 p-4 rounded-lg">
             <h4 className="font-medium mb-3 text-blue-400 flex items-center gap-2">
                <Fingerprint className="w-4 h-4" />
                Identifiants Officiels
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-500 block">ID du titre de compétences</span>
                    <span className="text-gray-200 font-mono">388BC371F555F16A</span>
                </div>
                <div>
                    <span className="text-gray-500 block">Numéro de certification</span>
                    <span className="text-gray-200 font-mono">D71B62-4C8E37</span>
                </div>
             </div>
          </div>

          {/* Détails techniques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-400">Architecture & Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <Cloud className="w-4 h-4 text-blue-400 mt-1" />
                  <span>Modèles Cloud : Public, Privé, Hybride</span>
                </li>
                <li className="flex items-start gap-2">
                  <Cpu className="w-4 h-4 text-blue-400 mt-1" />
                  <span>Compute : VM, App Services, Kubernetes (AKS)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-blue-400 mt-1" />
                  <span>Réseau : VNet, Peering, VPN Gateway, ExpressRoute</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#2a2a2f] p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-400">Sécurité & Gouvernance</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-blue-400 mt-1" />
                  <span>Identity : Entra ID (MFA, Conditional Access)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-400 mt-1" />
                  <span>Security : Zero Trust, Defender for Cloud</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-400 mt-1" />
                  <span>Governance : RBAC, Locks, Cost Management</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tags de compétences */}
          <div>
            <h4 className="font-medium mb-3 text-blue-400">Compétences Validées</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Cloud Concepts",
                "High Availability",
                "Disaster Recovery",
                "Entra ID (Azure AD)",
                "Zero Trust Security",
                "Azure Policy",
                "TCO & Pricing",
                "Virtual Networks"
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

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3 pt-4">
            <a
              href="https://learn.microsoft.com/api/credentials/share/fr-fr/Tristanbarry-9005/388BC371F555F16A?sharingId=A24096C05F93367A" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-blue-600 text-white
                       px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 group/verify"
            >
              <Shield className="w-4 h-4" />
              <span>Vérifier l'authenticité (Microsoft Learn)</span>
              <ExternalLink className="w-4 h-4 transform transition-transform group-hover/verify:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};