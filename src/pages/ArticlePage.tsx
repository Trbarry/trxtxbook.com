import React, { useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { SMBArticle } from '../components/articles/SMBArticle';

export const ArticlePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead 
        title="Mini-Projet : Serveur SMB pour Streaming 4K HDR | Tristan Barry"
        description="Solution simple mais efficace de streaming local."
        keywords="SMB, streaming, 4K HDR, Android, serveur mobile, Kodi, réseau local"
        url="https://trxtxbook.com/articles/smb-server"
        type="article"
      />
      {/* ✅ CHANGEMENT : bg-background */}
      <div className="min-h-screen pt-24 pb-20 bg-background transition-colors duration-300">
        <SMBArticle />
      </div>
    </>
  );
};