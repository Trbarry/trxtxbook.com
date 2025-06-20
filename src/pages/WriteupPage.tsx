import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { WriteupDetail } from '../components/WriteupDetail';
import { SEOHead } from '../components/SEOHead';
import { Writeup } from '../types/writeup';

export const WriteupPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [writeup, setWriteup] = React.useState<Writeup | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchWriteup();
  }, [slug]);

  const fetchWriteup = async () => {
    try {
      const { data, error } = await supabase
        .from('writeups')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setWriteup(data);
    } catch (error) {
      console.error('Error fetching writeup:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
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
        <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f] flex items-center justify-center">
          <p className="text-xl text-gray-400">Write-up non trouvé</p>
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
        url={`https://trxtxbook.com/writeups/${writeup.slug}`}
        type="article"
        publishedTime={writeup.created_at}
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <WriteupDetail writeup={writeup} />
      </div>
    </>
  );
};