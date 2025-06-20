import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Target, Shield, Award, Calendar, Tag, Terminal, ArrowLeft, Cpu, Network, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WriteupDetailProps {
  writeup: {
    title: string;
    content: string;
    platform: string;
    difficulty: string;
    points: number;
    tags: string[];
    created_at: string;
    images?: string[];
    slug?: string;
  };
  onClose?: () => void;
  isModal?: boolean;
}

export const WriteupDetail: React.FC<WriteupDetailProps> = ({ writeup, onClose, isModal = false }) => {
  const navigate = useNavigate();
  const isActiveHTB = writeup.slug === 'hackthebox-cat-analysis';

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
        return 'text-green-400';
      case 'moyen':
        return 'text-yellow-400';
      default:
        return 'text-red-400';
    }
  };

  const getWriteupImage = () => {
    if (isActiveHTB) {
      return "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/cat.htb.png";
    }
    return writeup.images?.[0] || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80";
  };

  const Content = (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/writeups')}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 text-violet-300 
                   rounded-lg hover:bg-violet-500/20 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux write-ups</span>
        </button>
      </div>

      {isActiveHTB ? (
        <div className="bg-[#1a1a1f] rounded-lg border border-yellow-500/20 overflow-hidden">
          {/* Image de fond floutée */}
          <div className="relative h-[300px] overflow-hidden">
            <img
              src={getWriteupImage()}
              alt={writeup.title}
              className="w-full h-full object-cover blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-[#1a1a1f]/80 to-[#1a1a1f]/60" />
            
            {/* Message d'avertissement */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="bg-yellow-500/10 p-4 rounded-full mb-6">
                <Lock className="w-12 h-12 text-yellow-500" />
              </div>
              <h1 className="text-3xl font-bold text-yellow-500 mb-4">{writeup.title}</h1>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-yellow-500">Machine Active sur HackTheBox</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Ce write-up est temporairement indisponible car la machine est actuellement active sur la plateforme HackTheBox.
                  Il sera publié une fois que la machine sera retirée.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {writeup.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-sm bg-yellow-500/10 text-yellow-300 px-3 py-1 rounded-full flex items-center gap-2 blur-sm"
                    >
                      <Tag className="w-4 h-4" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-yellow-500">Difficulté</h3>
                </div>
                <p className="text-yellow-300">{writeup.difficulty}</p>
              </div>
              
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-yellow-500">Points</h3>
                </div>
                <p className="text-yellow-300">{writeup.points}</p>
              </div>
              
              <div className="bg-[#2a2a2f] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-yellow-500">Date</h3>
                </div>
                <p className="text-yellow-300">{formatDate(writeup.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#1a1a1f] rounded-lg border border-violet-900/20 overflow-hidden">
          {/* En-tête avec image */}
          <div className="relative h-[300px] overflow-hidden group">
            <img
              src={getWriteupImage()}
              alt={writeup.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-[#1a1a1f]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{writeup.title}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-violet-500/10 text-violet-300 px-3 py-1 rounded-full flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {writeup.platform}
                  </span>
                  <span className={`text-sm bg-violet-500/10 px-3 py-1 rounded-full flex items-center gap-2 ${getDifficultyColor(writeup.difficulty)}`}>
                    <Shield className="w-4 h-4" />
                    {writeup.difficulty}
                  </span>
                  <span className="text-sm bg-violet-500/10 text-violet-300 px-3 py-1 rounded-full flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    {writeup.points} points
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {writeup.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-sm bg-violet-500/10 text-violet-300 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    <Tag className="w-4 h-4" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Métadonnées */}
            <div className="flex items-center gap-4 mb-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(writeup.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>Write-up technique</span>
              </div>
            </div>

            {/* Contenu Markdown */}
            <div className="prose prose-invert prose-violet max-w-none">
              <ReactMarkdown>{writeup.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return Content;
};