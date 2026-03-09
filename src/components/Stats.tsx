import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TryHackMeCard } from './platforms/TryHackMeCard';
import { HackTheBoxCard } from './platforms/HackTheBoxCard';
import { RootMeCard } from './platforms/RootMeCard';
import { PortSwiggerCard } from './platforms/PortSwiggerCard';

export const Stats: React.FC = () => {
  const navigate = useNavigate();

  const handlePlatformClick = (platform: string) => {
    navigate(`/writeups?platform=${platform.toLowerCase()}`);
  };

  return (
    <section className="py-12 bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <TryHackMeCard onPlatformClick={handlePlatformClick} />
          <HackTheBoxCard onPlatformClick={handlePlatformClick} />
          <RootMeCard onPlatformClick={handlePlatformClick} />
          <PortSwiggerCard onPlatformClick={handlePlatformClick} />
        </div>
      </div>
    </section>
  );
};