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
      className="cyber-card bg-[#1a1a1f] p-4 md:p-6 lg:p-8 rounded-lg border border-violet-900/20
                hover:border-violet-500/50 transition-all duration-300 cursor-pointer
                transform hover:-translate-y-1 group relative overflow-hidden 
                min-h-[320px] md:min-h-[350px] lg:min-h-[380px]
                flex flex-col w-full"
    >
      {/* En-tête de la carte */}
      <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
        <Trophy className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-red-500 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold truncate">TryHackMe</h3>
          <p className="text-red-500 text-sm md:text-base lg:text-lg mt-1 truncate">{stats.rank}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 mb-4 md:mb-6 text-xs md:text-sm lg:text-base leading-relaxed line-clamp-3 flex-grow">
        Plateforme d'apprentissage en cybersécurité proposant des labs guidés, 
        des challenges et des machines virtuelles pour tous les niveaux.
      </p>

      {/* Grille de statistiques */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4 mb-4 md:mb-6">
        <div className="bg-[#2a2a2f] p-2 md:p-3 lg:p-4 rounded-lg">
          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
            <Target className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-red-400 flex-shrink-0" />
            <h4 className="text-xs md:text-sm lg:text-base font-semibold truncate">Machines</h4>
          </div>
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-red-400">25</p>
        </div>

        <div className="bg-[#2a2a2f] p-2 md:p-3 lg:p-4 rounded-lg">
          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
            <Award className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-red-400 flex-shrink-0" />
            <h4 className="text-xs md:text-sm lg:text-base font-semibold truncate">Rang</h4>
          </div>
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-red-400">Top 3%</p>
        </div>

        <div className="bg-[#2a2a2f] p-2 md:p-3 lg:p-4 rounded-lg">
          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
            <Flag className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-red-400 flex-shrink-0" />
            <h4 className="text-xs md:text-sm lg:text-base font-semibold truncate">Défis</h4>
          </div>
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-red-400">45+</p>
        </div>
      </div>

      {/* Lien vers le profil */}
      <a
        href="https://tryhackme.com/p/Tr.barry"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-3 lg:px-6 lg:py-4
                 bg-red-500/10 rounded-lg transform transition-all duration-300 
                 hover:bg-red-500/20 hover:scale-105 group/link mt-auto"
      >
        <span className="text-red-400 text-xs md:text-sm lg:text-base font-semibold">Voir mon profil</span>
        <ExternalLink className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-red-400 transform transition-all duration-300 
                             group-hover/link:translate-x-1" />
      </a>
    </div>
  );
};