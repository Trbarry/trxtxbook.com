import React, { useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { LinuxMintArticle } from '../components/articles/LinuxMintArticle';

export const LinuxMintProjectPage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <>
      <SEOHead
        title="Linux Mint : Redonner Vie à Votre Ancien PC | Tristan Barry"
        description="Trop lent sous Windows 11 ? Linux Mint redonne fluidité, sécurité et simplicité à votre PC, même avec seulement 4 Go de RAM."
        url="https://trxtxbook.com/projects/linux-mint"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <LinuxMintArticle />
      </div>
    </>
  );
};
