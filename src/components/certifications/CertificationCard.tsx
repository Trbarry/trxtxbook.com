import React from 'react';
import { Award, Calendar, ExternalLink, Shield, CheckCircle2 } from 'lucide-react';
import { Certification } from '../../types/certification';

interface CertificationCardProps {
  certification: Certification;
}

export const CertificationCard: React.FC<CertificationCardProps> = ({ certification }) => {
  const getColorScheme = (type: 'ejpt' | 'thm' | 'bts') => {
    switch (type) {
      case 'ejpt':
        return {
          border: 'border-red-500/20 hover:border-red-500/40',
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          icon: 'text-red-500',
          hover: 'hover:bg-red-500/20'
        };
      case 'thm':
        return {
          border: 'border-[#9FEF00]/20 hover:border-[#9FEF00]/40',
          bg: 'bg-[#9FEF00]/10',
          text: 'text-[#9FEF00]',
          icon: 'text-[#9FEF00]',
          hover: 'hover:bg-[#9FEF00]/20'
        };
      default:
        return {
          border: 'border-violet-500/20 hover:border-violet-500/40',
          bg: 'bg-violet-500/10',
          text: 'text-violet-400',
          icon: 'text-violet-500',
          hover: 'hover:bg-violet-500/20'
        };
    }
  };

  const colors = getColorScheme(certification.type);

  return (
    <div 
      className={`bg-gradient-to-b from-[#1a1a1f] to-[#1d1d23] rounded-lg overflow-hidden border ${colors.border}
                hover:bg-[#1a1a1f]/80 transition-all duration-300 group backdrop-blur-sm`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h3 className={`text-xl font-semibold ${colors.text}`}>{certification.title}</h3>
              {certification.validated && (
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Certification obtenue
                </span>
              )}
            </div>
            <span className={`text-sm ${colors.bg} ${colors.text} px-3 py-1 rounded-full inline-block mt-2`}>
              {certification.platform}
            </span>
          </div>
          {certification.type === 'ejpt' && (
            <div className="relative group/badge">
              <img 
                src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/eJPT_badge.webp"
                alt="eJPT Badge"
                className="w-32 h-32 object-contain rounded-lg bg-red-500/10 p-3 transition-transform duration-300 group-hover/badge:scale-105"
              />
              <div className="absolute inset-0 bg-red-500/10 rounded-lg transition-opacity duration-300 group-hover/badge:opacity-0" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{certification.issueDate}</span>
          {certification.completionTime && (
            <span className={`ml-2 ${colors.text}`}>
              ({certification.completionTime})
            </span>
          )}
        </div>

        <div className="space-y-6">
          <p className="text-gray-300 leading-relaxed">
            {certification.description}
          </p>

          <div>
            <h4 className={`font-medium mb-3 ${colors.text}`}>Points clés de la certification :</h4>
            <ul className="space-y-2">
              {certification.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle2 className={`w-4 h-4 ${colors.icon} mt-1 shrink-0`} />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`font-medium mb-3 ${colors.text}`}>Compétences validées :</h4>
            <div className="flex flex-wrap gap-2">
              {certification.skills.map((skill, i) => (
                <span 
                  key={i}
                  className={`text-sm ${colors.bg} ${colors.text} px-3 py-1 rounded-full`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            {certification.certificateUrl && (
              <a
                href={certification.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-sm ${colors.bg} ${colors.text}
                         px-4 py-2 rounded-lg ${colors.hover} transition-colors group/cert`}
              >
                <Award className="w-4 h-4" />
                <span>Voir le certificat</span>
                <ExternalLink className="w-4 h-4 transform transition-transform 
                                     group-hover/cert:translate-x-1" />
              </a>
            )}
            {certification.verificationUrl && (
              <a
                href={certification.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-sm bg-[#2a2a2f] ${colors.text}
                         px-4 py-2 rounded-lg hover:bg-[#3a3a3f] transition-colors group/verify`}
              >
                <Shield className="w-4 h-4" />
                <span>Vérifier</span>
                <ExternalLink className="w-4 h-4 transform transition-transform 
                                     group-hover/verify:translate-x-1" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};