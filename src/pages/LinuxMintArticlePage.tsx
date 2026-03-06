import React, { useEffect } from 'react';
import { LinuxMintArticle } from '../components/articles/LinuxMintArticle';
import { SEOHead } from '../components/SEOHead';

export const LinuxMintArticlePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead 
        title="Linux Mint : Une alternative solide pour le quotidien | Tristan Barry"
        description="Pourquoi Linux Mint est devenu mon OS principal. Guide d'installation, personnalisation et retour d'expérience sur cette distribution stable et performante."
        keywords="Linux Mint, Open Source, Système d'exploitation, Productivité, Transition Windows vers Linux"
        url="https://trxtxbook.com/articles/linux-mint-revival"
        type="article"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <LinuxMintArticle />
      </div>
    </>
  );
};