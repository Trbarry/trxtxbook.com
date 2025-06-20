import React, { useEffect } from 'react';
import { ADArticle } from '../components/articles/ADArticle';

export const ADArticlePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
      <ADArticle />
    </div>
  );
};