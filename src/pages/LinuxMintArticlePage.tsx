import React, { useEffect } from 'react';
import { LinuxMintArticle } from '../components/articles/LinuxMintArticle';

export const LinuxMintArticlePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
      <LinuxMintArticle />
    </div>
  );
};