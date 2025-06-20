import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Eye, Globe, TrendingUp, RefreshCw, 
  Smartphone, Monitor, Tablet, MapPin, Activity, Shield
} from 'lucide-react';
import { useAnalytics } from '../lib/analytics';

interface AnalyticsData {
  unique_visitors: number;
  total_page_views: number;
  top_pages: Array<{ path: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
  devices: Array<{ device: string; count: number }>;
  recent_visitors: Array<{
    visitor_id: string;
    page_path: string;
    country?: string;
    device_type?: string;
    browser?: string;
    created_at: string;
  }>;
}

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
    
    // Actualiser toutes les 2 minutes
    const interval = setInterval(fetchAnalytics, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceLabel = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return 'Mobile';
      case 'tablet': return 'Tablette';
      case 'desktop': return 'Ordinateur';
      default: return deviceType;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
        <span className="ml-3 text-gray-400">Chargement des analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-gray-400">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Aucune donnée disponible</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-violet-400" />
          <h2 className="text-2xl font-bold">Analytics du Site</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </span>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Visiteurs Uniques</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{data.unique_visitors}</p>
          <p className="text-xs text-gray-500 mt-1">Aujourd'hui</p>
        </div>

        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Pages Vues</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{data.total_page_views}</p>
          <p className="text-xs text-gray-500 mt-1">Aujourd'hui</p>
        </div>

        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <span className="text-sm text-gray-400">Pages/Visiteur</span>
          </div>
          <p className="text-2xl font-bold text-violet-400">
            {data.unique_visitors > 0 ? (data.total_page_views / data.unique_visitors).toFixed(1) : '0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Moyenne</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Pages Populaires
          </h3>
          {data.top_pages.length > 0 ? (
            <div className="space-y-3">
              {data.top_pages.slice(0, 5).map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {page.path === '/' ? 'Accueil' : page.path}
                  </span>
                  <span className="text-sm font-medium text-violet-400 ml-2">
                    {page.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucune donnée</p>
          )}
        </div>

        {/* Countries */}
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-400" />
            Pays
          </h3>
          {data.countries.length > 0 ? (
            <div className="space-y-3">
              {data.countries.slice(0, 5).map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {country.country}
                  </span>
                  <span className="text-sm font-medium text-orange-400 ml-2">
                    {country.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucune donnée</p>
          )}
        </div>

        {/* Devices */}
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-violet-400" />
            Appareils
          </h3>
          {data.devices.length > 0 ? (
            <div className="space-y-3">
              {data.devices.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {getDeviceIcon(device.device)}
                    <span className="text-sm text-gray-300">
                      {getDeviceLabel(device.device)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-blue-400 ml-2">
                    {device.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucune donnée</p>
          )}
        </div>
      </div>

      {/* Recent Visitors */}
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-400" />
          Visiteurs Récents
        </h3>
        {data.recent_visitors.length > 0 ? (
          <div className="space-y-3">
            {data.recent_visitors.slice(0, 8).map((visitor, index) => (
              <div key={index} className="bg-[#2a2a2f] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-violet-300">
                    {visitor.visitor_id}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(visitor.created_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-300 truncate">
                      {visitor.page_path === '/' ? 'Accueil' : visitor.page_path}
                    </span>
                  </div>
                  
                  {visitor.device_type && (
                    <div className="flex items-center gap-1">
                      {getDeviceIcon(visitor.device_type)}
                      <span className="text-gray-300">
                        {getDeviceLabel(visitor.device_type)}
                      </span>
                    </div>
                  )}
                  
                  {visitor.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-400" />
                      <span className="text-orange-300">{visitor.country}</span>
                    </div>
                  )}
                  
                  {visitor.browser && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-cyan-400" />
                      <span className="text-cyan-300">{visitor.browser}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucune activité récente</p>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <h4 className="font-medium text-blue-400">Confidentialité</h4>
        </div>
        <p className="text-blue-300 text-sm">
          Système d'analytics simple et respectueux de la vie privée. Les données sont automatiquement 
          supprimées après 30 jours et les bots sont filtrés automatiquement.
        </p>
      </div>
    </div>
  );
};