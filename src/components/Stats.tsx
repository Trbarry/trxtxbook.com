import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TryHackMeCard } from './platforms/TryHackMeCard';
import { HackTheBoxCard } from './platforms/HackTheBoxCard';
import { RootMeCard } from './platforms/RootMeCard';

interface StatsData {
  rank: string;
  points?: number;
  challenges?: number;
}

interface StatsProps {
  stats: {
    tryhackme: StatsData;
    hackthebox: StatsData;
    rootme: StatsData;
  };
}

export const Stats: React.FC<StatsProps> = () => {
  const navigate = useNavigate();

  const handlePlatformClick = (platform: string) => {
    navigate(`/writeups?platform=${platform.toLowerCase()}`);
  };

  const stats = {
    tryhackme: {
      rank: "Top 3%",
      machines: 25,
      challenges: 45
    },
    hackthebox: {
      rank: "Bientôt Pro Hacker",
      points: 228,
      machines: "11/20",
      progression: "80.68"
    },
    rootme: {
      rank: "7462",
      points: 1745,
      challenges: 83
    }
  };

  return (
    <section className="py-12 bg-[#0d0d12]">
      <div className="container mx-auto px-4 md:px-6">
        {/* Layout adaptatif selon la taille d'écran */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <TryHackMeCard 
            stats={stats.tryhackme}
            onPlatformClick={handlePlatformClick}
          />
          <HackTheBoxCard 
            stats={stats.hackthebox}
            onPlatformClick={handlePlatformClick}
          />
          <RootMeCard 
            stats={stats.rootme}
            onPlatformClick={handlePlatformClick}
          />
        </div>
      </div>
    </section>
  );
};