import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Eye, Globe, TrendingUp, Clock, RefreshCw, Smartphone, Monitor, Tablet } from 'lucide-react';
import { useAnalytics } from '../lib/analytics';

interface AnalyticsData {
  uniqueVisitors: number;
  totalPageViews: number;
  topPages: Array<{ path: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
  devices: Array<{ device: string; count: number }>;
  recentViews: Array<{
    page_path: string;
    created_at: string;
    country?: string;
    device_type?: string;
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
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchAnalytics, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceLabel = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return 'Mobile';
      case 'tablet':
        return 'Tablette';
      case 'desktop':
        return 'Ordinateur';
      default:
        return deviceType;
    }
  };

  const getDeviceColor = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return 'text-blue-400';
      case 'tablet':
        return 'text-purple-400';
      case 'desktop':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
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
        <p>Aucune donnée d'analytics disponible</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Visiteurs Uniques</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{data.uniqueVisitors}</p>
          <p className="text-xs text-gray-500 mt-1">Aujourd'hui</p>
        </div>

        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Pages Vues</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{data.totalPageViews}</p>
          <p className="text-xs text-gray-500 mt-1">Aujourd'hui</p>
        </div>

        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <span className="text-sm text-gray-400">Pages/Visiteur</span>
          </div>
          <p className="text-2xl font-bold text-violet-400">
            {data.uniqueVisitors > 0 ? (data.totalPageViews / data.uniqueVisitors).toFixed(1) : '0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Moyenne</p>
        </div>

        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">Pays</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{data.countries.length}</p>
          <p className="text-xs text-gray-500 mt-1">Différents</p>
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
          {data.topPages.length > 0 ? (
            <div className="space-y-3">
              {data.topPages.slice(0, 5).map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {page.path === '/' ? 'Accueil' : page.path}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#2a2a2f] rounded-full h-2">
                      <div 
                        className="bg-violet-500 h-2 rounded-full"
                        style={{ 
                          width: `${(page.count / Math.max(...data.topPages.map(p => p.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-violet-400 w-6 text-right">
                      {page.count}
                    </span>
                  </div>
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
            Types d'Appareils
          </h3>
          {data.devices.length > 0 ? (
            <div className="space-y-3">
              {data.devices.map((device, index) => (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className={getDeviceColor(device.device)}>
                      {getDeviceIcon(device.device)}
                    </span>
                    <span className="text-sm text-gray-300">
                      {getDeviceLabel(device.device)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#2a2a2f] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          device.device === 'mobile' ? 'bg-blue-500' :
                          device.device === 'tablet' ? 'bg-purple-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${(device.count / Math.max(...data.devices.map(d => d.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className={`text-sm font-medium w-6 text-right ${getDeviceColor(device.device)}`}>
                      {device.count}
                    </span>
                  </div>
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
                <div key={country.country} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {country.country}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#2a2a2f] rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ 
                          width: `${(country.count / Math.max(...data.countries.map(c => c.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-orange-400 w-6 text-right">
                      {country.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucune donnée</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-violet-400" />
          Activité Récente
        </h3>
        {data.recentViews.length > 0 ? (
          <div className="space-y-2">
            {data.recentViews.slice(0, 10).map((view, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  {view.page_path === '/' ? 'Accueil' : view.page_path}
                </span>
                <div className="flex items-center gap-2 text-gray-400">
                  {view.device_type && (
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${getDeviceColor(view.device_type)}`}>
                      {getDeviceIcon(view.device_type)}
                      {getDeviceLabel(view.device_type)}
                    </span>
                  )}
                  {view.country && (
                    <span className="text-xs bg-[#2a2a2f] px-2 py-1 rounded">
                      {view.country}
                    </span>
                  )}
                  <span>{formatDate(view.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucune activité récente</p>
        )}
      </div>

      {/* Device Summary */}
      {data.devices.length > 0 && (
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-violet-400" />
            Répartition des Appareils
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.devices.map((device) => {
              const percentage = data.totalPageViews > 0 ? ((device.count / data.totalPageViews) * 100).toFixed(1) : '0';
              return (
                <div key={device.device} className="text-center">
                  <div className={`mx-auto mb-2 p-3 rounded-full w-12 h-12 flex items-center justify-center ${
                    device.device === 'mobile' ? 'bg-blue-500/20' :
                    device.device === 'tablet' ? 'bg-purple-500/20' : 'bg-green-500/20'
                  }`}>
                    <span className={getDeviceColor(device.device)}>
                      {getDeviceIcon(device.device)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-300">{getDeviceLabel(device.device)}</p>
                  <p className={`text-lg font-bold ${getDeviceColor(device.device)}`}>{percentage}%</p>
                  <p className="text-xs text-gray-500">{device.count} visites</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};