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
        description="Solution simple mais efficace de streaming local optimisée pour la lecture de contenu 4K HDR sans perte de qualité. Transformez votre smartphone en serveur SMB portable."
        keywords="SMB, streaming, 4K HDR, Android, serveur mobile, Kodi, réseau local, multimédia"
        url="https://trxtxbook.com/articles/smb-server"
        type="article"
        publishedTime="2024-01-15T00:00:00+00:00"
        modifiedTime="2025-01-20T00:00:00+00:00"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <SMBArticle />
      </div>
    </>
  );
};