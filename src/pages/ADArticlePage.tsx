import React, { useEffect } from 'react';
import { ADArticle } from '../components/articles/ADArticle';
import { SEOHead } from '../components/SEOHead';

export const ADArticlePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead 
        title="Architecture & Déploiement Active Directory | Tristan Barry"
        description="Guide technique complet sur le déploiement d'une infrastructure Active Directory sécurisée. Configuration des services de domaine, GPO, DNS et bonnes pratiques de sécurité."
        keywords="Active Directory, Windows Server, Infrastructure IT, Sécurité Réseau, GPO, DNS, Administration Système"
        url="https://trxtxbook.com/articles/ad-network"
        type="article"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <ADArticle />
      </div>
    </>
  );
};