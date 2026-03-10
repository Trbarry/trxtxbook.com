import React, { useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { ExegolArticle } from '../components/articles/ExegolArticle';

export const ExegolProjectPage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <>
      <SEOHead
        title="Exegol : L'Environnement d'Attaque de Référence | Tristan Barry"
        description="Alternative moderne à Kali Linux basée sur Docker. Environnement conteneurisé, reproductible et polyvalent pour les pentesters et red teamers."
        url="https://trxtxbook.com/projects/exegol"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <ExegolArticle />
      </div>
    </>
  );
};
