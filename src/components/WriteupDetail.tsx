import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getOptimizedUrl, getWriteupCoverImage } from '../lib/imageUtils';
import { Shield, Award, Calendar, Terminal, ArrowLeft, Lock, AlertTriangle, Target, Hash, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Writeup } from '../types/writeup';
import { TableOfContents, TocItem } from './TableOfContents';
import { extractHeadings } from '../lib/markdownUtils';

interface WriteupDetailProps {
  writeup: Writeup;
}

export const WriteupDetail: React.FC<WriteupDetailProps> = ({ writeup }) => {
  const navigate = useNavigate();
  const isActiveMachine = writeup?.is_active ?? false;

  const toc = React.useMemo(() => extractHeadings(writeup.content), [writeup.content]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDifficultyColor = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || '';
    if (d.includes('easy') || d.includes('facile')) return 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20 bg-green-100 dark:bg-green-500/5';
    if (d.includes('medium') || d.includes('moyen')) return 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 bg-orange-100 dark:bg-orange-500/5';
    if (d.includes('hard') || d.includes('difficile')) return 'text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20 bg-red-100 dark:bg-red-500/5';
    if (d.includes('insane')) return 'text-purple-600 dark:text-purple-500 border-purple-200 dark:border-purple-500/20 bg-purple-100 dark:bg-purple-500/5';
    return 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20 bg-gray-100 dark:bg-gray-500/5';
  };

  const getDifficultyAccent = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || '';
    if (d.includes('easy') || d.includes('facile')) return 'green';
    if (d.includes('medium') || d.includes('moyen')) return 'orange';
    if (d.includes('hard') || d.includes('difficile')) return 'red';
    if (d.includes('insane')) return 'purple';
    return 'violet';
  };

  const accent = getDifficultyAccent(writeup.difficulty);
  const accentColors: Record<string, { prose: string, border: string, shadow: string, glow: string }> = {
    green: { prose: 'prose-green', border: 'border-green-500/30', shadow: 'shadow-green-500/10', glow: 'text-green-400' },
    orange: { prose: 'prose-orange', border: 'border-orange-500/30', shadow: 'shadow-orange-500/10', glow: 'text-orange-400' },
    red: { prose: 'prose-red', border: 'border-red-500/30', shadow: 'shadow-red-500/10', glow: 'text-red-500' },
    purple: { prose: 'prose-purple', border: 'border-purple-500/30', shadow: 'shadow-purple-500/10', glow: 'text-purple-500' },
    violet: { prose: 'prose-violet', border: 'border-violet-500/30', shadow: 'shadow-violet-500/10', glow: 'text-violet-400' }
  };

  const currentAccent = accentColors[accent];

  return (
    <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 animate-in fade-in duration-700 px-4 md:px-0">
      <div className="flex-1 min-w-0">
        <button
          onClick={() => navigate('/writeups')}
          className="group mb-8 flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <div className="p-1 rounded-lg border border-gray-200 dark:border-white/10 group-hover:border-violet-500/50 bg-white dark:bg-[#1a1a1f] transition-all">
              <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Retour aux archives</span>
        </button>

        <div className={`bg-surface/80 dark:bg-[#1a1a1f]/80 backdrop-blur-xl rounded-2xl border ${currentAccent.border} overflow-hidden relative shadow-2xl ${currentAccent.shadow} transition-all duration-500`}>
          
          {/* Header Image with dynamic glow */}
          <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-t from-surface dark:from-[#1a1a1f] via-transparent to-transparent z-10`} />
              <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-surface/90 dark:to-[#1a1a1f]/90 z-10`} />
              <img
                src={getOptimizedUrl(getWriteupCoverImage(writeup), 1200)}
                alt={writeup.title}
                className="w-full h-full object-cover scale-105"
              />

              <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                  <div className="flex flex-wrap gap-3 mb-4">
                      <span className={`px-3 py-1 bg-white/90 dark:bg-black/60 backdrop-blur border ${currentAccent.border} rounded-lg text-xs font-bold ${currentAccent.glow} uppercase tracking-wider flex items-center gap-2 shadow-lg`}>
                          <Target className="w-3 h-3" />
                          {writeup.platform || 'CTF'}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-lg ${getDifficultyColor(writeup.difficulty)}`}>
                          {writeup.difficulty}
                      </span>
                  </div>
                  <h1 className={`text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-2 tracking-tight drop-shadow-2xl`}>
                      {writeup.title}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 text-sm font-medium">
                      <span className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm"><Calendar className="w-4 h-4" /> {formatDate(writeup.created_at)}</span>
                      <span className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm"><Award className="w-4 h-4" /> {writeup.points} pts</span>
                  </div>
              </div>

              {isActiveMachine && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
                      <div className="bg-yellow-500/10 p-6 rounded-full border border-yellow-500/20 mb-6 animate-pulse">
                          <Lock className="w-16 h-16 text-yellow-500" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Rapport Classifié</h2>
                      <p className="text-yellow-500/80 max-w-lg font-mono text-sm border border-yellow-500/20 bg-yellow-500/5 p-4 rounded-lg">
                          <AlertTriangle className="w-4 h-4 inline mr-2" />
                          Machine active. Publication bloquée.
                      </p>
                  </div>
              )}
          </div>

          {/* Contenu Markdown */}
          {!isActiveMachine && (
              <div className="p-8 md:p-12 relative">
                  <div className={`prose prose-gray dark:prose-invert ${currentAccent.prose} max-w-none 
                      prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white 
                      prose-h2:text-2xl prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-white/10 prose-h2:pb-4 prose-h2:mt-12
                      prose-code:text-gray-900 dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-black/50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                      prose-pre:bg-gray-900 dark:prose-pre:bg-black/80 prose-pre:border prose-pre:border-gray-700 dark:prose-pre:border-white/10 prose-pre:shadow-xl
                      prose-strong:text-gray-900 dark:prose-strong:text-white`}>
                      
                      <ReactMarkdown 
                          rehypePlugins={[rehypeRaw]}
                          components={{
                              img: ({ node, ...props }) => (
                                  <img
                                      {...props}
                                      src={getOptimizedUrl(props.src || '', 1000)}
                                      className="rounded-lg border border-white/10 my-8 shadow-lg transition-transform hover:scale-[1.02] duration-500"
                                      loading="lazy"
                                      alt={props.alt || writeup.title}
                                  />
                              ),
                              h2: ({ children }) => (
                                <h2 id={String(children).toLowerCase().replace(/[^\w]+/g, '-')}>
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 id={String(children).toLowerCase().replace(/[^\w]+/g, '-')}>
                                  {children}
                                </h3>
                              ),
                              blockquote: ({ children }: any) => {
                                const content = React.Children.toArray(children);
                                const firstChild = content[0] as any;
                                if (firstChild && firstChild.props && firstChild.props.children) {
                                  const firstLine = String(firstChild.props.children[0] || '');
                                  const match = firstLine.match(/^\[!(\w+)\]\s*(.*)/);
                                  if (match) {
                                    const title = match[2];
                                    if (title.toLowerCase().includes('sommaire')) return null;
                                  }
                                }
                                return <blockquote className="border-l-4 border-violet-500 bg-violet-500/5 px-4 py-1 my-4 italic text-gray-400">{children}</blockquote>;
                              }
                          }}
                      >
                          {writeup.content}
                      </ReactMarkdown>
                  </div>

                  <div className={`mt-16 pt-8 border-t ${currentAccent.border} flex flex-wrap gap-2`}>
                      <Terminal className={`w-5 h-5 ${currentAccent.glow} mr-2`} />
                      {writeup.tags?.map((tag, i) => (
                          <span key={i} className={`px-3 py-1 bg-gray-100/50 dark:bg-black/40 backdrop-blur border ${currentAccent.border} rounded-full text-xs text-gray-600 dark:text-gray-300 font-mono flex items-center gap-1 hover:border-violet-500/50 hover:text-violet-600 dark:hover:text-violet-300 transition-all cursor-default shadow-sm`}>
                              <Hash className="w-3 h-3 opacity-50" />
                              {tag}
                          </span>
                      ))}
                  </div>
              </div>
          )}
        </div>
      </div>
      {!isActiveMachine && toc.length > 0 && (
        <TableOfContents items={toc} />
      )}
    </div>
  );
};