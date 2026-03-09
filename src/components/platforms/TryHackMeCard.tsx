import React from 'react';
import { ExternalLink, Target, Flag, Award } from 'lucide-react';
import { THM_STATS } from '../../data/tryHackMeProgress';

const THM_BRAND = '#FF4141';

interface Props {
  onPlatformClick: (platform: string) => void;
}

const STATS = [
  { label: 'Machines', value: `${THM_STATS.machines}+`, icon: Target },
  { label: 'Challenges', value: `${THM_STATS.challenges}+`, icon: Flag },
  { label: 'Badges', value: `${THM_STATS.badges}`, icon: Award },
];

export const TryHackMeCard: React.FC<Props> = ({ onPlatformClick }) => {
  return (
    <div
      className="group relative bg-surface dark:bg-[#1a1a1f]/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/5
                 hover:border-[#FF4141]/40 transition-all duration-300
                 hover:shadow-[0_0_30px_rgba(255,65,65,0.08)]
                 flex flex-col overflow-hidden shadow-sm dark:shadow-none"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
           style={{ background: 'rgba(255,65,65,0.03)' }} />

      {/* Header */}
      <div className="relative z-10 p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border group-hover:scale-110 transition-transform duration-300 shrink-0"
                 style={{ background: 'rgba(255,65,65,0.1)', borderColor: 'rgba(255,65,65,0.2)' }}>
              <Target className="w-6 h-6" style={{ color: THM_BRAND }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">TryHackMe</h3>
              <p className="font-mono text-xs" style={{ color: THM_BRAND }}>CTF & Learning</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-black text-gray-900 dark:text-white">Top 3%</div>
            <div className="text-[10px] text-gray-400 font-mono">global rank</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label}
                 className="rounded-xl border border-gray-100 dark:border-white/5 p-3 text-center
                            group-hover:border-[#FF4141]/20 transition-colors"
                 style={{ background: 'rgba(255,65,65,0.03)' }}>
              <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: THM_BRAND }} />
              <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">{label}</p>
              <p className="text-sm font-black text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badges visuels */}
      <div className="relative z-10 px-6 py-3 border-t border-gray-100 dark:border-white/5">
        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-2">Apprentissage</p>
        <div className="flex flex-wrap gap-1.5">
          {['Active Directory', 'Web Hacking', 'Network', 'Privilege Escalation', 'OSINT'].map(tag => (
            <span key={tag}
                  className="text-[9px] px-2 py-0.5 rounded-full font-medium border"
                  style={{ background: 'rgba(255,65,65,0.08)', color: THM_BRAND, borderColor: 'rgba(255,65,65,0.2)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto px-6 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-end">
        <a
          href="https://tryhackme.com/p/Tr.barry"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] font-semibold hover:underline"
          style={{ color: THM_BRAND }}
          onClick={e => e.stopPropagation()}
        >
          tryhackme.com <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
};
