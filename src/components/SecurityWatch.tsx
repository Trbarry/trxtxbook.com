import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Activity, ExternalLink } from 'lucide-react';

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
    <div className="w-full h-24 md:h-32 bg-[#1a1a1f]/50 rounded-xl border border-white/5 animate-pulse flex items-center justify-center">
        <span className="text-gray-500 text-xs md:text-sm">Chargement de la veille...</span>
    </div>
  );

  if (cves.length === 0) return null;

  return (
    <div className="w-full bg-[#1a1a1f]/80 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6 relative overflow-hidden group">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 md:p-2 bg-red-500/10 rounded-lg border border-red-500/20 animate-pulse">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm md:text-lg font-bold text-white leading-tight">Menaces (Live)</h3>
            <p className="text-[10px] md:text-xs text-red-400 hidden sm:block">Dernières CVE détectées (CVSS &gt; 9.0)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[10px] md:text-xs font-mono text-red-400">LIVE</span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 relative z-10">
        {cves.map((cve) => (
          <div key={cve.cve_id} className="group/item flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 md:p-3 rounded-lg bg-black/40 border border-white/5 hover:border-red-500/30 transition-all">
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {/* ID CVE plus petit sur mobile */}
                <span className="text-red-400 font-mono font-bold text-xs md:text-sm bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 whitespace-nowrap">
                    {cve.cve_id}
                </span>
                <span className="text-[10px] text-gray-500 border border-white/10 px-1.5 rounded whitespace-nowrap">
                    {new Date(cve.published_date).toLocaleDateString()}
                </span>
              </div>
              {/* Description : CACHÉE sur mobile pour gagner de la place */}
              <p className="text-gray-400 text-xs truncate group-hover/item:text-gray-300 transition-colors hidden sm:block" title={cve.description}>
                {cve.description}
              </p>
            </div>
            
            {/* Footer Item (Score + Lien) */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-1 sm:mt-0">
                {/* Description mobile (très courte ou absente) */}
                
                <div className="flex items-center gap-2" title="Score CVSS">
                    <Shield className="w-3 h-3 text-gray-600 hidden sm:block" />
                    <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${cve.cvss_score >= 9.8 ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'}`}>
                        <span className="sm:hidden">CVSS</span> {cve.cvss_score}
                    </span>
                </div>
                <a 
                  href={cve.reference_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors ml-auto sm:ml-0"
                  title="Voir le détail NIST"
                >
                  <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </a>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};