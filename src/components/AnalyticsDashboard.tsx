import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Eye, Globe, TrendingUp, RefreshCw, 
  Smartphone, Monitor, Tablet, MapPin, Activity, Shield,
  Link as LinkIcon, Languages, Clock, ArrowUpRight
} from 'lucide-react';
import { useAnalytics } from '../lib/analytics';
import { motion } from 'framer-motion';

interface AnalyticsData {
  unique_visitors: number;
  total_page_views: number;
  top_pages: Array<{ path: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
  devices: Array<{ device: string; count: number }>;
  referrers: Array<{ source: string; count: number }>;
  languages: Array<{ lang: string; count: number }>;
  recent_visitors: Array<{
    visitor_id: string;
    page_path: string;
    country?: string;
    device_type?: string;
    browser?: string;
    referrer?: string;
    created_at: string;
  }>;
}

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="relative overflow-hidden bg-[#13131a]/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 group hover:border-white/10 transition-all duration-300"
  >
    <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${colorClass}-500/10 rounded-full blur-3xl group-hover:bg-${colorClass}-500/20 transition-all`} />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-${colorClass}-500/10 text-${colorClass}-400 border border-${colorClass}-500/20`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-${colorClass}-500/5 text-${colorClass}-300 border border-${colorClass}-500/10`}>
          <ArrowUpRight className="w-3 h-3" /> Live
        </span>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full bg-${colorClass}-500 animate-pulse`} />
        <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">{subtext}</span>
      </div>
    </div>
  </motion.div>
);

const ProgressBar = ({ label, value, max, colorClass = "violet", subLabel = "" }: any) => (
  <div className="group">
    <div className="flex justify-between items-end mb-2">
      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate pr-4">
        {label}
      </span>
      <div className="text-right">
        <span className="text-sm font-bold text-white block">{value}</span>
        {subLabel && <span className="text-[10px] text-gray-500 uppercase tracking-wider">{subLabel}</span>}
      </div>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r from-${colorClass}-600 to-${colorClass}-400 group-hover:from-${colorClass}-500 group-hover:to-${colorClass}-300 transition-all`}
      />
    </div>
  </div>
);

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { getAnalytics } = useAnalytics();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await getAnalytics();
      setData(analyticsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const formatReferrer = (ref?: string) => {
    if (!ref) return 'Direct / Inconnu';
    try {
      const url = new URL(ref);
      return url.hostname.replace('www.', '');
    } catch {
      return ref;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-6 h-6 text-violet-500 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-violet-300 font-mono text-sm animate-pulse">INITIALISATION DU CORTEX...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-violet-500" />
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Centre de Contrôle
            </span>
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Système de monitoring actif • Données temps réel
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#13131a] p-1.5 rounded-xl border border-white/10">
          <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Dernière synchro</span>
            </div>
            <span className="text-sm font-mono text-white block mt-0.5">
              {lastUpdate.toLocaleTimeString('fr-FR')}
            </span>
          </div>
          <button
            onClick={fetchAnalytics}
            className="p-3 hover:bg-violet-500 hover:text-white text-gray-400 rounded-lg transition-all duration-300 active:scale-95"
            title="Forcer l'actualisation"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Visiteurs Uniques" 
          value={data.unique_visitors} 
          subtext="Session ID distincts"
          icon={Users}
          colorClass="blue"
          delay={0.1}
        />
        <StatCard 
          title="Vues Totales" 
          value={data.total_page_views} 
          subtext="Hits enregistrés"
          icon={Eye}
          colorClass="violet"
          delay={0.2}
        />
        <StatCard 
          title="Engagement" 
          value={(data.unique_visitors > 0 ? (data.total_page_views / data.unique_visitors).toFixed(1) : '0')} 
          subtext="Pages par visiteur"
          icon={TrendingUp}
          colorClass="emerald"
          delay={0.3}
        />
      </div>

      {/* Detailed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contenu Populaire */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[#13131a]/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Trafic par Page
          </h3>
          <div className="space-y-6 flex-1">
            {data.top_pages.length > 0 ? (
              data.top_pages.slice(0, 5).map((page, i) => (
                <ProgressBar 
                  key={i}
                  label={page.path === '/' ? '/ (Accueil)' : page.path}
                  value={page.count}
                  max={Math.max(...data.top_pages.map(p => p.count))}
                  colorClass="violet"
                />
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">Aucune donnée</div>
            )}
          </div>
        </motion.div>

        {/* Métriques Secondaires (Tabbed Look) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#13131a]/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col gap-6"
        >
          {/* Sources */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5" /> Sources
            </h4>
            <div className="space-y-3">
              {data.referrers.slice(0, 3).map((ref, i) => (
                <div key={i} className="flex items-center justify-between text-sm group">
                  <span className="text-gray-400 group-hover:text-white transition-colors truncate max-w-[150px]">
                    {ref.source}
                  </span>
                  <span className="font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {ref.count}
                  </span>
                </div>
              ))}
              {data.referrers.length === 0 && <p className="text-xs text-gray-600">Aucune donnée</p>}
            </div>
          </div>

          {/* Geo */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> Géographie
            </h4>
            <div className="space-y-3">
              {data.countries.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm group">
                  <span className="text-gray-400 group-hover:text-white transition-colors">
                    {c.country}
                  </span>
                  <span className="font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {c.count}
                  </span>
                </div>
              ))}
              {data.countries.length === 0 && <p className="text-xs text-gray-600">Aucune donnée</p>}
            </div>
          </div>

          {/* Langues */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Languages className="w-3.5 h-3.5" /> Langues
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.languages.slice(0, 4).map((l, i) => (
                <span key={i} className="text-xs font-medium px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-300 uppercase">
                  {l.lang} <span className="text-gray-500 ml-1">{l.count}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Live Feed Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#13131a]/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-400" />
            Flux d'Activité
          </h3>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-400 font-mono uppercase tracking-wider">Live</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-xs uppercase text-gray-500 font-medium tracking-wider">
                <th className="p-4 pl-6">ID Visiteur</th>
                <th className="p-4">Cible</th>
                <th className="p-4">Provenance</th>
                <th className="p-4">Contexte</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {data.recent_visitors.length > 0 ? (
                data.recent_visitors.slice(0, 10).map((visitor, index) => (
                  <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-white border border-white/5">
                          {visitor.visitor_id.substring(2, 4).toUpperCase()}
                        </div>
                        <span className="font-mono text-xs text-gray-400 group-hover:text-violet-300 transition-colors">
                          {visitor.visitor_id.split('_')[1] || visitor.visitor_id}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300 font-medium">{visitor.page_path}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-gray-300 text-xs">{formatReferrer(visitor.referrer)}</span>
                        {visitor.country && (
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {visitor.country}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-400" title={`${visitor.browser} sur ${visitor.device_type}`}>
                        {getDeviceIcon(visitor.device_type || 'desktop')}
                        <span className="text-xs capitalize">{visitor.device_type || 'Desktop'}</span>
                        <span className="text-[10px] bg-white/5 px-1.5 rounded text-gray-500 border border-white/5">
                          {visitor.browser}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                        {new Date(visitor.created_at).toLocaleTimeString('fr-FR')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    En attente de données...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="flex justify-center pt-8 opacity-50 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-[#13131a] px-4 py-2 rounded-full border border-white/5">
          <Shield className="w-3 h-3" />
          <span>Données anonymisées • Rétention 30 jours • No-Cookie Tracking</span>
        </div>
      </div>
    </div>
  );
};