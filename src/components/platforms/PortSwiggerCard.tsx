import React from 'react';
import { Globe, ExternalLink, Target, BookOpen, FileText } from 'lucide-react';

interface PortSwiggerStats {
  lab_count: number;
  challenges_completed?: number;
}

interface PortSwiggerCardProps {
  stats: PortSwiggerStats;
  onPlatformClick: (platform: string) => void;
}

export const PortSwiggerCard: React.FC<PortSwiggerCardProps> = ({ stats, onPlatformClick }) => {
  return (
    <div
      onClick={() => onPlatformClick('portswigger')}
      className="group relative bg-surface dark:bg-[#1a1a1f]/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-white/5 
                hover:border-blue-500/50 transition-all duration-300 cursor-pointer
                hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]
                flex flex-col h-full overflow-hidden shadow-sm dark:shadow-none"
    >
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
          <Globe className="w-8 h-8 text-blue-600 dark:text-blue-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">PortSwigger Web Security Academy</h3>
          <p className="text-blue-600 dark:text-blue-500 font-mono text-sm">Labs {stats.lab_count} Complétés</p>
        </div>
      </div>

      <p className="relative z-10 text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
        Laboratoires pratiques centrés sur les vulnérabilités Web et leur exploitation.
      </p>

      <div className="relative z-10 grid grid-cols-3 gap-2 mb-6">
        {[
          { icon: BookOpen, label: "Labs", value: stats.lab_count.toString() },
          { icon: Target, label: "Complétés", value: stats.challenges_completed?.toString() ?? '?' },
          { icon: FileText, label: "Writeups", value: "N/A" } // Sera mis à jour avec le nombre de writeups
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 dark:bg-[#0f0f13]/50 p-2 rounded-lg border border-gray-200 dark:border-white/5 text-center group-hover:border-blue-500/20 transition-colors">
            <stat.icon className="w-4 h-4 text-blue-600 dark:text-blue-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase font-bold">{stat.label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <a
        href="https://portswigger.net/web-security/writeup" // Lien général, à ajuster si besoin
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 mt-auto flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold group/link hover:underline"
      >
        <span>Accéder à la section Writeups</span>
        <ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
      </a>
    </div>
  );
};