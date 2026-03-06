import React, { useEffect } from 'react';
import { ShieldAlert, Terminal, Lock, Skull, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnalytics } from '../lib/analytics';

export const AdminTrollPage: React.FC = () => {
  const { trackSecurityIncident } = useAnalytics();

  useEffect(() => {
    // Log the security incident as soon as the page is hit
    trackSecurityIncident(
      'honeypot_hit',
      window.location.pathname,
      {
        referrer: document.referrer,
        screen: `${window.screen.width}x${window.screen.height}`,
        message: 'Intrusion attempt detected on hidden admin route'
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-black text-red-500 font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-50"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-red-950/20 border-2 border-red-900 rounded-lg p-8 relative z-10 shadow-[0_0_50px_rgba(220,38,38,0.2)]"
      >
        <div className="flex items-center gap-4 mb-8 border-b border-red-900 pb-6">
          <div className="p-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <ShieldAlert size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Access Violation Detected</h1>
            <p className="text-red-400/70 text-xs">Security Protocol 403-BRAVO-SIX</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black/60 p-4 rounded border border-red-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Terminal size={14} />
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">System Analysis</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Unauthorized access attempt to restricted administrative interface has been logged. 
              Your digital signature (IP, Browser Fingerprint, Behavior) has been captured and forwarded to the SOC.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold opacity-60">
              <div className="flex justify-between border-b border-red-900/30 pb-1">
                <span>Threat Level:</span>
                <span className="text-white">CRITICAL</span>
              </div>
              <div className="flex justify-between border-b border-red-900/30 pb-1">
                <span>Action:</span>
                <span className="text-white">FINGERPRINTING</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 py-6">
            <Skull size={64} className="animate-bounce" />
            <h2 className="text-xl font-bold text-white uppercase tracking-widest text-center">
              Nice try, but this is a Honeypot.
            </h2>
            <p className="text-center text-red-400/80 text-sm max-w-sm italic">
              "Curiosity killed the cat, but satisfaction brought it back. 
              Unfortunately for you, satisfaction is restricted to administrators."
            </p>
          </div>

          <div className="flex justify-center gap-6 border-t border-red-900 pt-6">
             <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-xs font-bold hover:text-white transition-colors bg-red-900/30 px-4 py-2 rounded border border-red-900 hover:bg-red-800/40">
                <Activity size={14} />
                Return to Surface
             </button>
             <button onClick={() => window.location.href = '/wiki'} className="flex items-center gap-2 text-xs font-bold hover:text-white transition-colors bg-red-900/30 px-4 py-2 rounded border border-red-900 hover:bg-red-800/40">
                <Lock size={14} />
                Knowledge Base
             </button>
          </div>
        </div>
      </motion.div>

      {/* Background Matrix-like effect with red characters could be added here */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="animate-marquee-vertical whitespace-nowrap text-[8px] font-mono leading-none">
          {Array(100).fill("0101010101111001 01101111 01110101 00100000 01100111 01101111 01110100 00100000 01100011 01100001 01110101 01100111 01101000 01110100 ").join("")}
        </div>
      </div>
    </div>
  );
};
