import React, { useState, useEffect } from 'react';
import { Target, Search, Filter, Tag, Calendar, Lock, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Writeup } from '../types/writeup';
import { useLocation, useNavigate } from 'react-router-dom';

// Composant pour les tags avec masquage complet
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

// Composant pour la carte de write-up
const WriteupCard: React.FC<{
  writeup: Writeup;
  onClick: () => void;
}> = ({ writeup, onClick }) => {
  const isActiveCat = writeup.slug === 'hackthebox-cat-analysis';
  const isActiveDog = writeup.slug === 'hackthebox-dog';
  const isActive = isActiveCat || isActiveDog;

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'facile': return 'bg-green-500/20 text-green-300';
      case 'moyen': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-red-500/20 text-red-300';
    }
  };

  const getActiveStyles = () => {
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

  const styles = getActiveStyles();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      onClick={onClick}
      className={`group bg-[#1a1a1f] rounded-lg border transition-all duration-300 cursor-pointer
                transform hover:-translate-y-1 overflow-hidden ${styles.border}`}
    >
      {/* Image de couverture */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getWriteupImage(writeup)}
          alt={writeup.title}
          className={`w-full h-full object-cover transition-transform duration-500
                   group-hover:scale-105 ${isActive ? 'blur-sm' : ''}`}
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

      {/* Contenu */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className={`text-xl font-semibold ${styles.text}`}>
            {writeup.title}
          </h3>
          <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${styles.bg} ${styles.text}`}>
            <Shield className="w-3 h-3" />
            <span>{isActive ? 'Active' : writeup.difficulty}</span>
          </div>
        </div>

        <p className="text-gray-400 text-sm line-clamp-2">
          {isActive 
            ? "Write-up temporairement indisponible - Machine active sur HackTheBox"
            : writeup.description}
        </p>

        {/* Tags avec masquage complet */}
        <div className="flex flex-wrap gap-2">
          {writeup.tags.map((tag, index) => (
            <SecureTag
              key={index}
              tag={tag}
              isBlurred={isActive}
              variant={isActiveDog ? 'active-green' : isActiveCat ? 'active' : 'default'}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-500 pt-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(writeup.created_at)}</span>
          </div>
          <div className={`px-2 py-1 rounded flex items-center gap-2 ${styles.bg} ${styles.text}`}>
            <Target className="w-3 h-3" />
            <span>{writeup.points} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
export const WriteupsList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    fetchWriteups();
    
    const params = new URLSearchParams(location.search);
    const platformParam = params.get('platform');
    if (platformParam) {
      setSelectedPlatform(platformParam);
    }
  }, [location]);

  const fetchWriteups = async () => {
    try {
      const { data, error } = await supabase
        .from('writeups')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWriteups(data || []);
    } catch (error) {
      console.error('Error fetching writeups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    const params = new URLSearchParams(location.search);
    if (platform === 'all') {
      params.delete('platform');
    } else {
      params.set('platform', platform);
    }
    navigate({ search: params.toString() });
  };

  const filteredWriteups = writeups.filter(writeup => {
    const matchesSearch = writeup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         writeup.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         writeup.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'all' || writeup.platform.toLowerCase() === selectedPlatform;
    const matchesDifficulty = selectedDifficulty === 'all' || writeup.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesPlatform && matchesDifficulty;
  });

  const platforms = ['all', ...new Set(writeups.map(w => w.platform.toLowerCase()))];
  const difficulties = ['all', ...new Set(writeups.map(w => w.difficulty))];

  const handleWriteupClick = (writeup: Writeup) => {
    const isActiveCat = writeup.slug === 'hackthebox-cat-analysis';
    const isActiveDog = writeup.slug === 'hackthebox-dog';
    
    if (isActiveCat || isActiveDog) {
      // Stay on the current page for active write-ups
      return;
    }
    
    navigate(`/writeups/${writeup.slug}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
      <div className="container mx-auto px-6">
        {/* En-tête avec filtres */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-violet-500" />
            Write-ups CTF
          </h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1a1a1f] rounded-lg border border-violet-900/20 
                         focus:border-violet-500/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedPlatform}
                onChange={(e) => handlePlatformChange(e.target.value)}
                className="px-4 py-2 bg-[#1a1a1f] rounded-lg border border-violet-900/20 
                         focus:border-violet-500/50 focus:outline-none transition-colors"
              >
                {platforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform === 'all' ? 'Toutes les plateformes' : platform}
                  </option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 bg-[#1a1a1f] rounded-lg border border-violet-900/20 
                         focus:border-violet-500/50 focus:outline-none transition-colors"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'Toutes les difficultés' : difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des write-ups */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWriteups.map((writeup) => (
              <WriteupCard
                key={writeup.id}
                writeup={writeup}
                onClick={() => handleWriteupClick(writeup)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};