import React from 'react';
import { Sword, ExternalLink, Target, Award, Flag } from 'lucide-react';

interface HackTheBoxStats {
  rank: string;
  points?: number;
}

interface HackTheBoxCardProps {
  stats: HackTheBoxStats;
  onPlatformClick: (platform: string) => void;
}

export const HackTheBoxCard: React.FC<HackTheBoxCardProps> = ({ stats, onPlatformClick }) => {
  return (
    <div
      onClick={() => onPlatformClick('hackthebox')}
      className="group relative bg-[#1a1a1f]/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 
                hover:border-[#9FEF00]/50 transition-all duration-300 cursor-pointer
                hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(159,239,0,0.1)]
                flex flex-col h-full overflow-hidden"
    >
      {/* Effet de fond au survol */}
      <div className="absolute inset-0 bg-[#9FEF00]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* En-tête */}
      <div className="relative z-10 flex items-center gap-4 mb-6">
        <div className="p-3 bg-[#9FEF00]/10 rounded-xl border border-[#9FEF00]/20 group-hover:scale-110 transition-transform duration-300">
          <Sword className="w-8 h-8 text-[#9FEF00]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide">HackTheBox</h3>
          <p className="text-[#9FEF00] font-mono text-sm">Rank: {stats.rank}</p>
        </div>
      </div>

      {/* Description */}
      <p className="relative z-10 text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
        Pentesting avancé. Machines et challenges réalistes pour perfectionner l'exploitation en conditions réelles.
      </p>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-2 mb-6">
        {[
          { icon: Target, label: "Machines", value: "14/20" },
          { icon: Award, label: "Ownership", value: "46%" },
          { icon: Flag, label: "Progress", value: "Top Tier" }
        ].map((stat, i) => (
          <div key={i} className="bg-[#0f0f13]/50 p-2 rounded-lg border border-white/5 text-center group-hover:border-[#9FEF00]/20 transition-colors">
            <stat.icon className="w-4 h-4 text-[#9FEF00] mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase font-bold">{stat.label}</p>
            <p className="text-sm font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Lien Explicite Restauré */}
      <a
        href="https://app.hackthebox.com/profile/2129647"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()} // Empêche le double clic avec la carte
        className="relative z-10 mt-auto flex items-center gap-2 text-[#9FEF00] text-sm font-semibold group/link hover:underline"
      >
        <span>Voir mon profil</span>
        <ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
      </a>
    </div>
  );
};