import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, CheckCircle2, Shield } from 'lucide-react';
import { PORTSWIGGER_LEVELS, PORTSWIGGER_CATEGORIES, MASTERED, TOP_CATEGORIES } from '../../data/portswiggerProgress';

interface Props {
  onPlatformClick: (platform: string) => void;
}

const LEVEL_CONFIG = {
  apprentice:   { label: 'Apprentice',   color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
  practitioner: { label: 'Practitioner', color: 'bg-blue-500',    text: 'text-blue-500',    border: 'border-blue-500/20',    bg: 'bg-blue-500/10'    },
  expert:       { label: 'Expert',       color: 'bg-violet-500',  text: 'text-violet-500',  border: 'border-violet-500/20',  bg: 'bg-violet-500/10'  },
};

export const PortSwiggerCard: React.FC<Props> = ({ onPlatformClick }) => {
  const [expanded, setExpanded] = useState(false);
  const { total } = PORTSWIGGER_LEVELS;

  return (
    <div
      className="group relative bg-surface dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/5
                 hover:border-orange-500/40 transition-all duration-300
                 hover:shadow-[0_0_30px_rgba(249,115,22,0.08)]
                 flex flex-col overflow-hidden shadow-sm dark:shadow-none"
    >
      <div className="absolute inset-0 bg-orange-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
              <Shield className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">PortSwigger</h3>
              <p className="text-orange-500 font-mono text-xs">Web Security Academy</p>
            </div>
          </div>
          {/* Global % ring */}
          <div className="shrink-0 text-right">
            <div className="text-2xl font-black text-gray-900 dark:text-white">{total.pct}%</div>
            <div className="text-[10px] text-gray-400 font-mono">{total.solved}/{total.total} labs</div>
          </div>
        </div>

        {/* Global progress bar */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700"
            style={{ width: `${total.pct}%` }}
          />
        </div>

        {/* Level breakdown */}
        <div className="space-y-2">
          {(Object.entries(LEVEL_CONFIG) as [keyof typeof LEVEL_CONFIG, typeof LEVEL_CONFIG[keyof typeof LEVEL_CONFIG]][]).map(([key, cfg]) => {
            const lvl = PORTSWIGGER_LEVELS[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <span className={`text-[9px] font-bold uppercase tracking-wider w-20 shrink-0 ${cfg.text}`}>{cfg.label}</span>
                <div className="flex-1 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cfg.color} rounded-full transition-all duration-700`}
                    style={{ width: `${lvl.pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-gray-400 w-12 text-right shrink-0">
                  {lvl.solved}/{lvl.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mastered topics */}
      {MASTERED.length > 0 && (
        <div className="relative z-10 px-6 py-3 border-t border-gray-100 dark:border-white/5">
          <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={10} className="text-emerald-500" />
            100% maîtrisé
          </p>
          <div className="flex flex-wrap gap-1.5">
            {MASTERED.map(c => (
              <span key={c.name} className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expandable — toutes les catégories */}
      {expanded && (
        <div className="relative z-10 px-6 py-3 border-t border-gray-100 dark:border-white/5">
          <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-3">Progression par catégorie</p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {PORTSWIGGER_CATEGORIES.map(c => {
              const pct = Math.round((c.solved / c.total) * 100);
              const color = pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : pct > 0 ? 'bg-orange-500' : 'bg-gray-200 dark:bg-white/10';
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate mr-2">{c.name}</span>
                    <span className="text-[9px] font-mono text-gray-400 shrink-0">{c.solved}/{c.total}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
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
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-orange-500 transition-colors font-medium"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Réduire' : 'Voir toutes les catégories'}
        </button>
        <a
          href="https://portswigger.net/web-security/all-labs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-orange-500 hover:underline font-semibold"
          onClick={e => e.stopPropagation()}
        >
          WSA <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
};
