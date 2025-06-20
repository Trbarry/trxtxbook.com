import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Eye, Globe, TrendingUp, Clock, RefreshCw, 
  Smartphone, Monitor, Tablet, MapPin, Activity, UserCheck,
  Shield, AlertTriangle, Fingerprint, Wifi
} from 'lucide-react';
import { useAnalytics } from '../lib/analytics';

interface EnhancedAnalyticsData {
  uniqueVisitors: number;
  totalPageViews: number;
  uniqueVisitorsToday: number;
  pageViewsToday: number;
  topPages: Array<{ path: string; count: number; unique_visitors: number }>;
  countries: Array<{ country: string; count: number }>;
  cities: Array<{ city: string; count: number }>;
  devices: Array<{ device: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
  recentVisitors: Array<{
    visitor_id: string;
    page_path: string;
    country?: string;
    city?: string;
    device_type?: string;
    ip_suffix?: string;
    created_at: string;
    is_returning: boolean;
  }>;
  visitorFlow: Array<{ hour: number; visitors: number; page_views: number }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-violet-400" />
          <h2 className="text-2xl font-bold">Analytics Avancées du Site</h2>
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
            <span className="text-sm text-gray-400">Visiteurs Aujourd'hui</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{data.uniqueVisitorsToday}</p>
          <p className="text-xs text-gray-500 mt-1">Total: {data.uniqueVisitors}</p>
        </div>

        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Pages Vues Aujourd'hui</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{data.pageViewsToday}</p>
          <p className="text-xs text-gray-500 mt-1">Total: {data.totalPageViews}</p>
        </div>

        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <span className="text-sm text-gray-400">Pages/Visiteur</span>
          </div>
          <p className="text-2xl font-bold text-violet-400">
            {data.uniqueVisitorsToday > 0 ? (data.pageViewsToday / data.uniqueVisitorsToday).toFixed(1) : '0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Aujourd'hui</p>
        </div>

        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">Visiteurs Récurrents</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {data.recentVisitors.filter(v => v.is_returning).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Sur {data.recentVisitors.length} récents</p>
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

        {/* Browsers */}
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-400" />
            Navigateurs
          </h3>
          {data.browsers.length > 0 ? (
            <div className="space-y-3">
              {data.browsers.slice(0, 5).map((browser, index) => (
                <div key={browser.browser} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {browser.browser}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#2a2a2f] rounded-full h-2">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ 
                          width: `${(browser.count / Math.max(...data.browsers.map(b => b.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-cyan-400 w-6 text-right">
                      {browser.count}
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

      {/* Location Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Cities */}
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-violet-400" />
            Villes
          </h3>
          {data.cities.length > 0 ? (
            <div className="space-y-3">
              {data.cities.slice(0, 5).map((city, index) => (
                <div key={city.city} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {city.city}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#2a2a2f] rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full"
                        style={{ 
                          width: `${(city.count / Math.max(...data.cities.map(c => c.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-pink-400 w-6 text-right">
                      {city.count}
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

      {/* Recent Visitors with Enhanced Info */}
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-400" />
          Visiteurs Récents (Informations Détaillées)
        </h3>
        {data.recentVisitors.length > 0 ? (
          <div className="space-y-3">
            {data.recentVisitors.slice(0, 10).map((visitor, index) => (
              <div key={index} className="bg-[#2a2a2f] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-mono text-violet-300">
                        {visitor.visitor_id}
                      </span>
                    </div>
                    {visitor.is_returning && (
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                        Récurrent
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(visitor.created_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3 text-blue-400" />
                    <span className="text-gray-400">Page:</span>
                    <span className="text-blue-300 truncate">
                      {visitor.page_path === '/' ? 'Accueil' : visitor.page_path}
                    </span>
                  </div>
                  
                  {visitor.device_type && (
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(visitor.device_type)}
                      <span className="text-gray-400">Appareil:</span>
                      <span className={getDeviceColor(visitor.device_type)}>
                        {getDeviceLabel(visitor.device_type)}
                      </span>
                    </div>
                  )}
                  
                  {visitor.country && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-orange-400" />
                      <span className="text-gray-400">Pays:</span>
                      <span className="text-orange-300">{visitor.country}</span>
                    </div>
                  )}
                  
                  {visitor.ip_suffix && (
                    <div className="flex items-center gap-2">
                      <Wifi className="w-3 h-3 text-cyan-400" />
                      <span className="text-gray-400">IP:</span>
                      <span className="text-cyan-300 font-mono">***{visitor.ip_suffix}</span>
                    </div>
                  )}
                </div>
                
                {visitor.city && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-pink-400" />
                    <span className="text-gray-400">Ville:</span>
                    <span className="text-pink-300">{visitor.city}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucune activité récente</p>
        )}
      </div>

      {/* Visitor Flow */}
      {data.visitorFlow.length > 0 && (
        <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-400" />
            Flux de Visiteurs par Heure
          </h3>
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 24 }, (_, hour) => {
              const hourData = data.visitorFlow.find(h => h.hour === hour);
              const visitors = hourData?.visitors || 0;
              const maxVisitors = Math.max(...data.visitorFlow.map(h => h.visitors));
              const height = maxVisitors > 0 ? (visitors / maxVisitors) * 100 : 0;
              
              return (
                <div key={hour} className="flex flex-col items-center">
                  <div className="w-full bg-[#2a2a2f] rounded-t h-16 flex items-end">
                    <div 
                      className="w-full bg-violet-500 rounded-t transition-all duration-300"
                      style={{ height: `${height}%` }}
                      title={`${hour}h: ${visitors} visiteurs`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{hour}h</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <h4 className="font-medium text-blue-400">Confidentialité et Sécurité</h4>
        </div>
        <p className="text-blue-300 text-sm">
          Toutes les données sont collectées de manière anonyme et respectueuse de la vie privée. 
          Les adresses IP sont partiellement masquées, les données sont automatiquement supprimées après 90 jours, 
          et les bots sont filtrés automatiquement.
        </p>
      </div>
    </div>
  );
};