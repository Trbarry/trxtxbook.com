import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, AlertTriangle, ExternalLink, Activity } from 'lucide-react';

interface CVE {
  cve_id: string;
  description: string;
  cvss_score: number;
  reference_url: string;
  published_date: string;
}

export const SecurityWatch = () => {
  const [cves, setCves] = useState<CVE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCVEs = async () => {
      // On récupère les 5 dernières failles
      const { data } = await supabase
        .from('security_watch')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(5);
      
      if (data) setCves(data);
      setLoading(false);
    };
    fetchCVEs();
  }, []);

  if (loading) return (
    <div className="w-full h-32 bg-[#1a1a1f]/50 rounded-xl border border-white/5 animate-pulse flex items-center justify-center">
        <span className="text-gray-500 text-sm">Chargement de la veille...</span>
    </div>
  );

  if (cves.length === 0) return null; // Rien à afficher si vide

  return (
    <div className="w-full bg-[#1a1a1f]/80 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6 relative overflow-hidden group">
      {/* Effet de fond rouge subtil */}
      <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 animate-pulse">
            <Activity className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Menaces Critiques (Live)</h3>
            {/* CORRECTION ICI : > remplacé par &gt; */}
            <p className="text-xs text-red-400">Dernières CVE détectées (CVSS &gt; 9.0)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-mono text-red-400">LIVE FEED</span>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {cves.map((cve) => (
          <div key={cve.cve_id} className="group/item flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-black/40 border border-white/5 hover:border-red-500/30 transition-all">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-red-400 font-mono font-bold text-sm bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    {cve.cve_id}
                </span>
                <span className="text-[10px] text-gray-500 border border-white/10 px-1.5 rounded">
                    {new Date(cve.published_date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-400 text-xs truncate group-hover/item:text-gray-300 transition-colors" title={cve.description}>
                {cve.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                <div className="flex items-center gap-2" title="Score CVSS">
                    <Shield className="w-3 h-3 text-gray-600" />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${cve.cvss_score >= 9.8 ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'}`}>
                        {cve.cvss_score}
                    </span>
                </div>
                <a 
                  href={cve.reference_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  title="Voir le détail NIST"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};