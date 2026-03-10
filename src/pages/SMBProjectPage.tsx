import React, { useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { SMBArticle } from '../components/articles/SMBArticle';

export const SMBProjectPage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <>
      <SEOHead
        title="Mini-Projet : Serveur SMB pour Streaming 4K HDR | Tristan Barry"
        description="Solution simple mais efficace de streaming local optimisée pour la lecture de contenu 4K HDR sans perte de qualité."
        url="https://trxtxbook.com/projects/smb-server"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <SMBArticle />
      </div>
    </>
  );
};
