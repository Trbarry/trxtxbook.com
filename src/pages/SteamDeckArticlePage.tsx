import React, { useEffect } from 'react';
import { SteamDeckArticle } from '../components/articles/SteamDeckArticle';

export const SteamDeckArticlePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
      <SteamDeckArticle />
    </div>
  );
};