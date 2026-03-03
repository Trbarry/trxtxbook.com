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
        title="Serveur SMB pour Streaming 4K HDR : Solution de Stockage Réseau | Tristan Barry"
        description="Configuration d'un serveur SMB performant pour le streaming de contenus 4K HDR sur le réseau local. Optimisation des partages pour Kodi et Android TV."
        keywords="SMB, Samba, Streaming 4K, HDR, NAS, Réseau local, Stockage réseau, Kodi, Android TV"
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