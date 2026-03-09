import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Flag, Trophy } from 'lucide-react';
import { ROOTME_STATS, ROOTME_CATEGORIES } from '../../data/rootMeProgress';

const RM_BRAND = '#e74c3c';

interface Props {
  onPlatformClick: (platform: string) => void;
}

export const RootMeCard: React.FC<Props> = ({ onPlatformClick }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group relative bg-surface dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/5
                 hover:border-[#e74c3c]/40 transition-all duration-300
                 hover:shadow-[0_0_30px_rgba(231,76,60,0.08)]
                 flex flex-col overflow-hidden shadow-sm dark:shadow-none"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
           style={{ background: 'rgba(231,76,60,0.03)' }} />

      {/* Header */}
      <div className="relative z-10 p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border group-hover:scale-110 transition-transform duration-300 shrink-0"
                 style={{ background: 'rgba(231,76,60,0.1)', borderColor: 'rgba(231,76,60,0.2)' }}>
              <Trophy className="w-6 h-6" style={{ color: RM_BRAND }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Root-Me</h3>
              <p className="font-mono text-xs" style={{ color: RM_BRAND }}>Rank #{ROOTME_STATS.rank}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-black text-gray-900 dark:text-white">{ROOTME_STATS.points}</div>
            <div className="text-[10px] text-gray-400 font-mono">points</div>
          </div>
        </div>

        {/* Global progress bar */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${ROOTME_STATS.pct}%`, background: `linear-gradient(to right, ${RM_BRAND}, #e67e73)` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-gray-400 -mt-3 mb-4">
          <span>{ROOTME_STATS.solved}/{ROOTME_STATS.total} challenges</span>
          <span>{ROOTME_STATS.pct}%</span>
        </div>

        {/* Top categories mini bars */}
        <div className="space-y-2">
          {ROOTME_CATEGORIES.filter(c => c.pct > 0).slice(0, 4).map(c => {
            const color = c.pct >= 40 ? RM_BRAND : c.pct >= 20 ? '#e67e22' : '#95a5a6';
            return (
              <div key={c.name} className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider w-24 shrink-0 text-gray-400 truncate">{c.name}</span>
                <div className="flex-1 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${c.pct}%`, background: color }} />
                </div>
                <span className="text-[10px] font-mono text-gray-400 w-8 text-right shrink-0">{c.pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & CTF */}
      <div className="relative z-10 px-6 py-3 border-t border-gray-100 dark:border-white/5 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Flag size={10} style={{ color: RM_BRAND }} />
          <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">CTF</span>
          <span className="text-[10px] font-mono font-bold text-gray-900 dark:text-white ml-1">{ROOTME_STATS.ctf} compromissions</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Badges</span>
          <span className="text-[10px] font-mono font-bold text-gray-900 dark:text-white">{ROOTME_STATS.badges}</span>
        </div>
      </div>

      {/* Expandable — toutes les catégories */}
      {expanded && (
        <div className="relative z-10 px-6 py-3 border-t border-gray-100 dark:border-white/5">
          <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-3">Toutes les catégories</p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {ROOTME_CATEGORIES.map(c => {
              const color = c.pct >= 40 ? RM_BRAND : c.pct >= 20 ? '#e67e22' : c.pct > 0 ? '#f39c12' : '#d1d5db';
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate mr-2">{c.name}</span>
                    <span className="text-[9px] font-mono text-gray-400 shrink-0">{c.pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${c.pct}%`, background: color }} />
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
          onMouseEnter={e => (e.currentTarget.style.color = RM_BRAND)}
          onMouseLeave={e => (e.currentTarget.style.color = '')}
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Réduire' : 'Toutes les catégories'}
        </button>
        <a
          href="https://www.root-me.org/Jecurl"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] font-semibold hover:underline"
          style={{ color: RM_BRAND }}
          onClick={e => e.stopPropagation()}
        >
          root-me.org <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
};
