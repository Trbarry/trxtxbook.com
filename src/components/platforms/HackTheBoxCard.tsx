import React from 'react';
import { ExternalLink, Sword, User, Monitor } from 'lucide-react';
import { HTB_STATS } from '../../data/hackTheBoxProgress';

const HTB_BRAND = '#9FEF00';
const HTB_DIM   = 'rgba(159,239,0,';

interface Props {
  onPlatformClick: (platform: string) => void;
}

export const HackTheBoxCard: React.FC<Props> = ({ onPlatformClick }) => {
  const machinePct = Math.round((HTB_STATS.machines / HTB_STATS.totalMachines) * 100);

  return (
    <div
      className="group relative bg-surface dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/5
                 hover:border-[#9FEF00]/40 transition-all duration-300
                 hover:shadow-[0_0_30px_rgba(159,239,0,0.08)]
                 flex flex-col overflow-hidden shadow-sm dark:shadow-none"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
           style={{ background: `${HTB_DIM}0.03)` }} />

      {/* Header */}
      <div className="relative z-10 p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border group-hover:scale-110 transition-transform duration-300 shrink-0"
                 style={{ background: `${HTB_DIM}0.1)`, borderColor: `${HTB_DIM}0.2)` }}>
              <Sword className="w-6 h-6" style={{ color: HTB_BRAND }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">HackTheBox</h3>
              <p className="font-mono text-xs" style={{ color: HTB_BRAND }}>{HTB_STATS.rank}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-black text-gray-900 dark:text-white">{HTB_STATS.points}</div>
            <div className="text-[10px] text-gray-400 font-mono">points</div>
          </div>
        </div>

        {/* Machines progress bar */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${machinePct}%`, background: `linear-gradient(to right, ${HTB_BRAND}, #c8ff4d)` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-4">
          <span>{HTB_STATS.machines}/{HTB_STATS.totalMachines} machines</span>
          <span>{machinePct}%</span>
        </div>

        {/* User vs System owns */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider w-24 shrink-0" style={{ color: HTB_BRAND }}>User Owns</span>
            <div className="flex-1 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                   style={{ width: `${Math.round((HTB_STATS.userOwns / HTB_STATS.totalMachines) * 100)}%`, background: HTB_BRAND }} />
            </div>
            <span className="text-[10px] font-mono text-gray-400 w-12 text-right shrink-0">{HTB_STATS.userOwns}/{HTB_STATS.totalMachines}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider w-24 shrink-0 text-gray-400">System Owns</span>
            <div className="flex-1 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                   style={{ width: `${Math.round((HTB_STATS.systemOwns / HTB_STATS.totalMachines) * 100)}%`, background: '#6ab04c' }} />
            </div>
            <span className="text-[10px] font-mono text-gray-400 w-12 text-right shrink-0">{HTB_STATS.systemOwns}/{HTB_STATS.totalMachines}</span>
          </div>
        </div>
      </div>

      {/* Ownership badge */}
      <div className="relative z-10 px-6 py-3 border-t border-gray-100 dark:border-white/5 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <User size={10} style={{ color: HTB_BRAND }} />
          <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Ownership</span>
          <span className="text-[10px] font-mono font-bold ml-1" style={{ color: HTB_BRAND }}>{HTB_STATS.ownership}%</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Monitor size={10} className="text-gray-400" />
          <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Progression</span>
          <span className="text-[10px] font-mono font-bold text-gray-900 dark:text-white ml-1">{HTB_STATS.progression}%</span>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto px-6 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-end">
        <a
          href="https://app.hackthebox.com/profile/2129647"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] font-semibold hover:underline"
          style={{ color: HTB_BRAND }}
          onClick={e => e.stopPropagation()}
        >
          hackthebox.com <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
};
