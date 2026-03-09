import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Sword } from 'lucide-react';
import { HTB_STATS } from '../../data/hackTheBoxProgress';

const HTB = '#9FEF00';
const DIM = (a: number) => `rgba(159,239,0,${a})`;

// Palette severity cohérente : vert → jaune → orange → rouge
const DIFF_CONFIG = [
  { label: 'Easy',   color: '#9FEF00', key: 'easy'   as const },
  { label: 'Medium', color: '#f0c040', key: 'medium' as const },
  { label: 'Hard',   color: '#f07040', key: 'hard'   as const },
  { label: 'Insane', color: '#e03535', key: 'insane' as const },
];

const CONTENT = [
  { label: 'Challenges', s: HTB_STATS.challenges },
  { label: 'Sherlocks',  s: HTB_STATS.sherlocks  },
  { label: 'Pro Labs',   s: HTB_STATS.proLabs     },
  { label: 'Fortresses', s: HTB_STATS.fortresses  },
];

interface Props {
  onPlatformClick: (platform: string) => void;
}

export const HackTheBoxCard: React.FC<Props> = ({ onPlatformClick }) => {
  const [expanded, setExpanded] = useState(false);
  const { machines, difficulty } = HTB_STATS;
  const machinePct = Math.round((machines.solved / machines.total) * 100);

  return (
    <div
      className="group relative bg-surface dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/5
                 hover:border-[#9FEF00]/40 transition-all duration-300
                 hover:shadow-[0_0_30px_rgba(159,239,0,0.08)]
                 flex flex-col overflow-hidden shadow-sm dark:shadow-none"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
           style={{ background: DIM(0.03) }} />

      {/* Header */}
      <div className="relative z-10 p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border group-hover:scale-110 transition-transform duration-300 shrink-0"
                 style={{ background: DIM(0.1), borderColor: DIM(0.2) }}>
              <Sword className="w-6 h-6" style={{ color: HTB }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">HackTheBox</h3>
              <p className="font-mono text-xs" style={{ color: HTB }}>{HTB_STATS.rank}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-black text-gray-900 dark:text-white">#{HTB_STATS.globalRank}</div>
            <div className="text-[10px] text-gray-400 font-mono">{HTB_STATS.flags} flags</div>
          </div>
        </div>

        {/* Machines progress bar */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-1">
          <div className="h-full rounded-full transition-all duration-700"
               style={{ width: `${machinePct}%`, background: `linear-gradient(to right, ${HTB}, #c8ff4d)` }} />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-4">
          <span>{machines.solved}/{machines.total} machines</span>
          <span>{machinePct}%</span>
        </div>

        {/* Difficulty bars — labels gris, barres colorées */}
        <div className="space-y-2">
          {DIFF_CONFIG.map(({ label, color, key }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider w-14 shrink-0 text-gray-400">{label}</span>
              <div className="flex-1 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width: `${difficulty[key]}%`, background: color }} />
              </div>
              <span className="text-[10px] font-mono text-gray-400 w-8 text-right shrink-0">{difficulty[key]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable — contenu */}
      {expanded && (
        <div className="relative z-10 px-6 py-3 border-t border-gray-100 dark:border-white/5">
          <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-3">Tout le contenu</p>
          <div className="space-y-2">
            {CONTENT.map(({ label, s }) => {
              const pct = Math.round((s.solved / s.total) * 100);
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="text-[9px] font-mono text-gray-400">{s.solved}/{s.total}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                         style={{ width: `${pct}%`, background: pct > 0 ? HTB : '#d1d5db' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 mt-auto px-6 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-[10px] text-gray-400 font-medium transition-colors"
          onMouseEnter={e => (e.currentTarget.style.color = HTB)}
          onMouseLeave={e => (e.currentTarget.style.color = '')}
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Réduire' : 'Voir tout le contenu'}
        </button>
        <a
          href="https://app.hackthebox.com/profile/2129647"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] font-semibold hover:underline"
          style={{ color: HTB }}
          onClick={e => e.stopPropagation()}
        >
          hackthebox.com <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
};
