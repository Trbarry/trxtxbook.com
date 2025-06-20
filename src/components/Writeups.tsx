import React, { useState, useEffect } from 'react';
import { Target, Search, Filter, Tag, Calendar, Lock, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Writeup } from '../types/writeup';
import { useLocation, useNavigate } from 'react-router-dom';

const SecureTag: React.FC<{
  tag: string;
  isBlurred: boolean;
  variant?: 'default' | 'active' | 'active-green';
}> = ({ tag, isBlurred, variant = 'default' }) => {
  const styles = {
    default: 'bg-[#2a2a2f] text-gray-300',
    active: 'bg-yellow-500/10 text-yellow-300',
    'active-green': 'bg-green-500/10 text-green-300'
  };

  if (isBlurred) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${styles[variant]}`}>
        <Tag className="w-3 h-3" />
        <div className="w-12 h-3 bg-current opacity-50 rounded" />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${styles[variant]}`}>
      <Tag className="w-3 h-3" />
      <span>{tag}</span>
    </div>
  );
};

const getWriteupImage = (writeup: Writeup) => {
  if (writeup.slug === 'hackthebox-cat-analysis') {
    return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/cat.htb.png";
  }
  if (writeup.slug === 'hackthebox-dog') {
    return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/dog.png";
  }
  return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80";
};

export const Writeups: React.FC = () => {
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWriteups();
  }, []);

  const fetchWriteups = async () => {
    try {
      setError(null);
      console.log('Attempting to fetch writeups from Supabase...');
      
      // Test basic connectivity first
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`Supabase connectivity test failed: ${response.status} ${response.statusText}`);
      }

      console.log('Supabase connectivity test passed');

      const { data, error } = await supabase
        .from('writeups')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      console.log('Successfully fetched writeups:', data?.length || 0);
      setWriteups(data || []);
    } catch (error) {
      console.error('Error fetching writeups:', error);
      
      let errorMessage = 'Failed to load writeups';
      if (error instanceof Error) {
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Cross-origin request blocked. Please check Supabase CORS settings.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'facile':
      case 'easy':
        return 'bg-green-500/20 text-green-300';
      case 'moyen':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-red-500/20 text-red-300';
    }
  };

  const getActiveStyles = (writeup: Writeup) => {
    const isActiveCat = writeup.slug === 'hackthebox-cat-analysis';
    const isActiveDog = writeup.slug === 'hackthebox-dog';

    if (isActiveCat) {
      return {
        border: 'border-yellow-500/20 hover:border-yellow-500/50',
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-500',
        iconColor: 'text-yellow-500'
      };
    }
    if (isActiveDog) {
      return {
        border: 'border-green-500/20 hover:border-green-500/50',
        bg: 'bg-green-500/10',
        text: 'text-green-500',
        iconColor: 'text-green-500'
      };
    }
    return {
      border: 'border-violet-900/20 hover:border-violet-500/50',
      bg: 'bg-violet-500/10',
      text: 'text-violet-300',
      iconColor: 'text-violet-400'
    };
  };

  const handleWriteupClick = (writeup: Writeup) => {
    const isActiveCat = writeup.slug === 'hackthebox-cat-analysis';
    const isActiveDog = writeup.slug === 'hackthebox-dog';
    
    if (isActiveCat || isActiveDog) {
      navigate('/writeups');
    } else {
      navigate(`/writeups/${writeup.slug}`);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    fetchWriteups();
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-violet-500" />
            Write-ups CTF Récents
          </h2>
          <button
            onClick={() => navigate('/writeups')}
            className="flex items-center gap-2 text-sm bg-violet-500/10 px-4 py-2 rounded-lg
                     hover:bg-violet-500/20 transition-colors group"
          >
            <span>Voir tous les write-ups</span>
            <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Erreur de chargement</h3>
            <p className="text-gray-400 mb-4 max-w-md">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 px-4 py-2 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {writeups.map((writeup) => {
              const isActiveCat = writeup.slug === 'hackthebox-cat-analysis';
              const isActiveDog = writeup.slug === 'hackthebox-dog';
              const isActive = isActiveCat || isActiveDog;
              const styles = getActiveStyles(writeup);
              
              return (
                <div
                  key={writeup.id}
                  onClick={() => handleWriteupClick(writeup)}
                  className={`cyber-card bg-[#1a1a1f] rounded-lg border transition-all duration-300 cursor-pointer
                           transform hover:-translate-y-1 overflow-hidden ${styles.border}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getWriteupImage(writeup)}
                      alt={writeup.title}
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105
                              ${isActive ? 'blur-sm' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-[#1a1a1f]/50 to-transparent" />
                    
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`${styles.bg} p-3 rounded-full transform transition-transform duration-300 group-hover:scale-110`}>
                          <Lock className={`w-8 h-8 ${styles.iconColor}`} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-xl font-semibold ${styles.text}`}>
                        {writeup.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${styles.bg} ${styles.text}`}>
                        {isActive ? 'Active' : writeup.difficulty}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {isActive 
                        ? "Write-up temporairement indisponible - Machine active sur HackTheBox"
                        : writeup.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {writeup.tags.map((tag, i) => (
                        <SecureTag
                          key={i}
                          tag={tag}
                          isBlurred={isActive}
                          variant={isActiveDog ? 'active-green' : isActiveCat ? 'active' : 'default'}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(writeup.created_at)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded ${styles.bg} ${styles.text}`}>
                        {writeup.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};