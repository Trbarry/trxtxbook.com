import React, { useEffect } from 'react';
import { ExegolArticle } from '../components/articles/ExegolArticle';
import { SEOHead } from '../components/SEOHead';

export const ExegolArticlePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead 
        title="Exegol : Le framework ultime pour le Pentest | Tristan Barry"
        description="Comment Exegol révolutionne le workflow du pentester. Guide d'installation, utilisation avancée et gestion des environnements Docker pour la cybersécurité."
        keywords="Exegol, Pentest, Cybersécurité, Docker, HackTheBox, Kali Linux, Outils de hacking"
        url="https://trxtxbook.com/articles/exegol-docker"
        type="article"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <ExegolArticle />
      </div>
    </>
  );
};