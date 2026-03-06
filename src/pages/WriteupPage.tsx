import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
<<<<<<< HEAD
import { supabase } from '../lib/supabase';
import { Writeup } from '../types/writeup';
import { PortSwiggerBaseArticle } from '../components/articles/portswigger/PortSwiggerBaseArticle';
import { WriteupDetail } from '../components/WriteupDetail';
=======
import { useWriteup } from '../hooks/useWriteups';
import { WriteupDetail } from '../components/WriteupDetail';
import { DifficultyBackground } from '../components/DifficultyBackground';
import { SEOHead } from '../components/SEOHead';
import { getWriteupCoverImage } from '../lib/imageUtils';
>>>>>>> 8934296eb67dd60afc8e6c696c49d05aa428bcbc

export const WriteupPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { writeup, isLoading: loading } = useWriteup(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      // ✅ CHANGEMENT : bg-background et text adaptatif
      <div className="min-h-screen pt-24 pb-20 bg-background transition-colors duration-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-600 dark:border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!writeup) {
    return (
      <>
        <SEOHead 
          title="Write-up non trouvé - Tristan Barry"
          description="Le write-up demandé n'a pas été trouvé."
        />
        {/* ✅ CHANGEMENT : bg-background et text adaptatif */}
        <div className="min-h-screen pt-24 pb-20 bg-background transition-colors duration-300 flex items-center justify-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Write-up non trouvé</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${writeup.title} - Write-up CTF | Tristan Barry`}
        description={writeup.description}
        keywords={`${writeup.tags.join(', ')}, CTF, cybersécurité, pentesting, ${writeup.platform}`}
        image={getWriteupCoverImage(writeup)}
        url={`https://trxtxbook.com/writeups/${writeup.slug}`}
        type="article"
        publishedTime={writeup.created_at}
      />
      {/* ✅ Arrière-plan dynamique selon la difficulté */}
      <div className="min-h-screen pt-24 pb-20 bg-background transition-colors duration-300 relative">
        <DifficultyBackground difficulty={writeup.difficulty} tags={writeup.tags} />
        <div className="relative z-10">
          <WriteupDetail writeup={writeup} />
        </div>
      </div>
    </>
  );
};