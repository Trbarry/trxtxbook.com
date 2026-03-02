import React, { useEffect } from 'react';
import { WriteupDog } from '../components/articles/WriteupDog';
import { DifficultyBackground } from '../components/DifficultyBackground';

export const DogWriteupPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f] relative overflow-hidden">
      <DifficultyBackground difficulty="medium" />
      <div className="relative z-10">
        <WriteupDog />
      </div>
    </div>
  );
};