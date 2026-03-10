import React, { useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { ADArticle } from '../components/articles/ADArticle';

export const ADProjectPage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <>
      <SEOHead
        title="Infrastructure Active Directory Complète | Tristan Barry"
        description="Environnement de test AD complet avec Windows Server 2022, pfSense, et machines clientes pour la simulation d'une infrastructure d'entreprise sécurisée."
        url="https://trxtxbook.com/projects/ad-network"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <ADArticle />
      </div>
    </>
  );
};
