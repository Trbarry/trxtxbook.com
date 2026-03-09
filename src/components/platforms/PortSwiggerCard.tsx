import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, CheckCircle2, Shield } from 'lucide-react';
import { PORTSWIGGER_LEVELS, PORTSWIGGER_CATEGORIES, MASTERED } from '../../data/portswiggerProgress';

// PortSwigger brand colors (from their Web Security Academy)
const PS = {
  brand:        '#e4502a', // PortSwigger coral-orange
  apprentice:   '#1fa37b', // teal-green
  practitioner: '#2763ad', // medium blue
  expert:       '#c83030', // red
};

interface Props {
  onPlatformClick: (platform: string) => void;
}

const LEVEL_CONFIG = {
  apprentice:   { label: 'Apprentice',   hex: PS.apprentice   },
  practitioner: { label: 'Practitioner', hex: PS.practitioner },
  expert:       { label: 'Expert',       hex: PS.expert        },
};

export const PortSwiggerCard: React.FC<Props> = ({ onPlatformClick }) => {
  const [expanded, setExpanded] = useState(false);
  const { total } = PORTSWIGGER_LEVELS;

  return (
    <div
      className="group relative bg-surface dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/5
                 hover:border-[#e4502a]/40 transition-all duration-300
                 hover:shadow-[0_0_30px_rgba(228,80,42,0.08)]
                 flex flex-col overflow-hidden shadow-sm dark:shadow-none"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
           style={{ background: 'rgba(228,80,42,0.03)' }} />

      {/* Header */}
      <div className="relative z-10 p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border group-hover:scale-110 transition-transform duration-300 shrink-0"
                 style={{ background: 'rgba(228,80,42,0.1)', borderColor: 'rgba(228,80,42,0.2)' }}>
              <Shield className="w-6 h-6" style={{ color: PS.brand }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">PortSwigger</h3>
              <p className="font-mono text-xs" style={{ color: PS.brand }}>Web Security Academy</p>
            </div>
          </div>
          {/* Global % */}
          <div className="shrink-0 text-right">
            <div className="text-2xl font-black text-gray-900 dark:text-white">{total.pct}%</div>
            <div className="text-[10px] text-gray-400 font-mono">{total.solved}/{total.total} labs</div>
          </div>
        </div>

        {/* Global progress bar */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${total.pct}%`, background: `linear-gradient(to right, ${PS.brand}, #f47340)` }}
          />
        </div>

        {/* Level breakdown */}
        <div className="space-y-2">
          {(Object.entries(LEVEL_CONFIG) as [keyof typeof LEVEL_CONFIG, typeof LEVEL_CONFIG[keyof typeof LEVEL_CONFIG]][]).map(([key, cfg]) => {
            const lvl = PORTSWIGGER_LEVELS[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider w-20 shrink-0" style={{ color: cfg.hex }}>
                  {cfg.label}
                </span>
                <div className="flex-1 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${lvl.pct}%`, background: cfg.hex }}
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
            <CheckCircle2 size={10} style={{ color: PS.apprentice }} />
            100% maîtrisé
          </p>
          <div className="flex flex-wrap gap-1.5">
            {MASTERED.map(c => (
              <span key={c.name}
                className="text-[9px] px-2 py-0.5 rounded-full font-medium border"
                style={{
                  background: 'rgba(31,163,123,0.1)',
                  color: PS.apprentice,
                  borderColor: 'rgba(31,163,123,0.2)',
                }}
              >
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
              const color = pct === 100 ? PS.apprentice : pct >= 50 ? PS.practitioner : pct > 0 ? PS.brand : '#d1d5db';
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate mr-2">{c.name}</span>
                    <span className="text-[9px] font-mono text-gray-400 shrink-0">{c.solved}/{c.total}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
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
          style={{ '--hover-color': PS.brand } as React.CSSProperties}
          onMouseEnter={e => (e.currentTarget.style.color = PS.brand)}
          onMouseLeave={e => (e.currentTarget.style.color = '')}
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Réduire' : 'Voir toutes les catégories'}
        </button>
        <a
          href="https://portswigger.net/web-security/all-labs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] font-semibold hover:underline"
          style={{ color: PS.brand }}
          onClick={e => e.stopPropagation()}
        >
          WSA <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
};
