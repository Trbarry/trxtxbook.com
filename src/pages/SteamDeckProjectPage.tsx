import React, { useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { SteamDeckArticle } from '../components/articles/SteamDeckArticle';

export const SteamDeckProjectPage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <>
      <SEOHead
        title="Steam Deck Kali Linux : Station de Pentesting Mobile | Tristan Barry"
        description="Transformez votre Steam Deck en plateforme de pentesting sans compromettre ses capacités gaming natives."
        url="https://trxtxbook.com/projects/steam-deck-kali"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <SteamDeckArticle />
      </div>
    </>
  );
};
