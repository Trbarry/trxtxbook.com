import React, { useEffect } from 'react';
import { WriteupDog } from '../components/articles/WriteupDog';
import { DifficultyBackground } from '../components/DifficultyBackground';
import { SEOHead } from '../components/SEOHead';

export const DogWriteupPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead 
        title="HackTheBox: Dog - Analyse & Write-up | Tristan Barry"
        description="Analyse complète et write-up détaillé de la machine Dog sur HackTheBox. Reconnaissance, exploitation du CMS Backdrop via upload de module, et escalade de privilèges via Bee CLI."
        keywords="HackTheBox, Dog, Write-up, CTF, Cybersécurité, Pentesting, CMS Backdrop, Bee CLI, Privilege Escalation"
        image="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/dog.png"
        url="https://trxtxbook.com/writeups/hackthebox-dog"
        type="article"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f] relative overflow-hidden">
        <DifficultyBackground difficulty="medium" />
        <div className="relative z-10">
          <WriteupDog />
        </div>
      </div>
    </>
  );
};