import React from 'react';
import { Brain, ExternalLink, Flag, Shield, Award } from 'lucide-react';

interface RootMeStats {
  rank: string;
  points?: number;
  challenges?: number;
}

interface RootMeCardProps {
  stats: RootMeStats;
  onPlatformClick: (platform: string) => void;
}

export const RootMeCard: React.FC<RootMeCardProps> = ({ stats, onPlatformClick }) => {
  return (
    <div
      onClick={() => onPlatformClick('rootme')}
      className="group relative bg-[#1a1a1f]/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 
                hover:border-blue-500/50 transition-all duration-300 cursor-pointer
                hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]
                flex flex-col h-full overflow-hidden"
    >
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
          <Brain className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide">Root-Me</h3>
          <p className="text-blue-500 font-mono text-sm">Rank: {stats.rank}</p>
        </div>
      </div>

      <p className="relative z-10 text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
        La référence française. Challenges techniques pointus (Web Client, App System, Cryptanalyse).
      </p>

      <div className="relative z-10 grid grid-cols-3 gap-2 mb-6">
        {[
          { icon: Flag, label: "Validés", value: `${stats.challenges}/594` },
          { icon: Shield, label: "Points", value: stats.points },
          { icon: Award, label: "Pwned", value: "4" }
        ].map((stat, i) => (
          <div key={i} className="bg-[#0f0f13]/50 p-2 rounded-lg border border-white/5 text-center group-hover:border-blue-500/20 transition-colors">
            <stat.icon className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500 uppercase font-bold">{stat.label}</p>
            <p className="text-sm font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Lien Explicite Restauré */}
      <a
        href="https://www.root-me.org/Jecurl"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 mt-auto flex items-center gap-2 text-blue-400 text-sm font-semibold group/link hover:underline"
      >
        <span>Voir mon profil</span>
        <ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
      </a>
    </div>
  );
};