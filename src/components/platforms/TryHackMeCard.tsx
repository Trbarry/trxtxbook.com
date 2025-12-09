import React from 'react';
import { Trophy, ExternalLink, Target, Award, Flag } from 'lucide-react';

interface TryHackMeStats {
  rank: string;
  points?: number;
  challenges?: number;
}

interface TryHackMeCardProps {
  stats: TryHackMeStats;
  onPlatformClick: (platform: string) => void;
}

export const TryHackMeCard: React.FC<TryHackMeCardProps> = ({ stats, onPlatformClick }) => {
  return (
    <div
      onClick={() => onPlatformClick('tryhackme')}
      className="group relative bg-surface dark:bg-[#1a1a1f]/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-white/5 
                hover:border-red-500/50 transition-all duration-300 cursor-pointer
                hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]
                flex flex-col h-full overflow-hidden shadow-sm dark:shadow-none"
    >
      <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 flex items-center gap-4 mb-6">
        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 group-hover:scale-110 transition-transform duration-300">
          <Trophy className="w-8 h-8 text-red-600 dark:text-red-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">TryHackMe</h3>
          <p className="text-red-600 dark:text-red-500 font-mono text-sm">{stats.rank}</p>
        </div>
      </div>

      <p className="relative z-10 text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
        Apprentissage guidé et CTF. Labs complets couvrant l'Active Directory, le Réseau et le Web.
      </p>

      <div className="relative z-10 grid grid-cols-3 gap-2 mb-6">
        {[
          { icon: Target, label: "Machines", value: "25+" },
          { icon: Award, label: "Rank", value: stats.rank },
          { icon: Flag, label: "Badges", value: "6" }
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 dark:bg-[#0f0f13]/50 p-2 rounded-lg border border-gray-200 dark:border-white/5 text-center group-hover:border-red-500/20 transition-colors">
            <stat.icon className="w-4 h-4 text-red-600 dark:text-red-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase font-bold">{stat.label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <a
        href="https://tryhackme.com/p/Tr.barry"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 mt-auto flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-semibold group/link hover:underline"
      >
        <span>Voir mon profil</span>
        <ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
      </a>
    </div>
  );
};