import { supabase } from './supabase';

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

class SimpleAnalytics {
  private visitorId: string;
  private isBot: boolean = false;

  constructor() {
    this.isBot = this.detectBot();
    if (!this.isBot) {
      this.visitorId = this.getOrCreateVisitorId();
    }
  }

  // Détection simple des bots
  private detectBot(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const botPatterns = ['bot', 'crawler', 'spider', 'scrape', 'lighthouse', 'headless'];
    return botPatterns.some(pattern => userAgent.includes(pattern));
  }

  // Générer un ID visiteur unique
  private getOrCreateVisitorId(): string {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
  }

  // Détecter le type d'appareil
  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/iPad/.test(userAgent)) return 'tablet';
    if (/iPhone|Android.*Mobile|BlackBerry|Windows Phone/i.test(userAgent)) return 'mobile';
    if (/Android/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  // Détecter le navigateur
  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Autre';
  }

  // Obtenir la géolocalisation
  private async getLocation(): Promise<{ country?: string; city?: string }> {
    try {
      const response = await fetch('https://ipapi.co/json/', { 
        signal: AbortSignal.timeout(3000) 
      });
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city
      };
    } catch {
      return {};
    }
  }

  // Tracker une vue de page
  async trackPageView(path: string) {
    if (this.isBot) return;

    try {
      const location = await this.getLocation();
      
      await supabase.from('page_views').insert({
        page_path: path,
        visitor_id: this.visitorId,
        country: location.country,
        city: location.city,
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        is_bot: false
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Obtenir les analytics
  async getAnalytics(): Promise<AnalyticsData | null> {
    try {
      const { data, error } = await supabase.rpc('get_today_analytics');
      
      if (error) throw error;
      
      return data?.[0] || {
        unique_visitors: 0,
        total_page_views: 0,
        top_pages: [],
        countries: [],
        devices: [],
        recent_visitors: []
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }
}

// Instance singleton
export const analytics = new SimpleAnalytics();

// Hook React
export const useAnalytics = () => {
  const trackPageView = (path: string) => {
    analytics.trackPageView(path);
  };

  const getAnalytics = () => {
    return analytics.getAnalytics();
  };

  return { trackPageView, getAnalytics };
};