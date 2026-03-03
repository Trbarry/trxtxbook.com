import React, { useEffect } from 'react';
import { SteamDeckArticle } from '../components/articles/SteamDeckArticle';
import { SEOHead } from '../components/SEOHead';

export const SteamDeckArticlePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead 
        title="Kali Linux sur Steam Deck : Le Pentest Nomade | Tristan Barry"
        description="Transformer son Steam Deck en station de pentest portable avec Kali Linux. Guide de configuration, compatibilité matérielle et cas d'usage."
        keywords="Steam Deck, Kali Linux, Pentest mobile, Cybersécurité, Gaming & Hacking"
        url="https://trxtxbook.com/articles/steam-deck-kali"
        type="article"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <SteamDeckArticle />
      </div>
    </>
  );
};