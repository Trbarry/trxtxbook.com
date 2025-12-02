import { supabase } from './supabase';

// ... (Garde l'interface AnalyticsData telle quelle) ...
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

  private detectBot(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const botPatterns = ['bot', 'crawler', 'spider', 'scrape', 'lighthouse', 'headless'];
    return botPatterns.some(pattern => userAgent.includes(pattern));
  }

  private getOrCreateVisitorId(): string {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/iPad/.test(userAgent)) return 'tablet';
    if (/iPhone|Android.*Mobile|BlackBerry|Windows Phone/i.test(userAgent)) return 'mobile';
    if (/Android/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Autre';
  }

  // --- CORRECTION DU PROBLÈME CORS ---
  private async getLocation(): Promise<{ country?: string }> {
    try {
      // On utilise une API plus permissive ou on catch l'erreur silencieusement
      // ipapi.co bloque souvent les requêtes front-end directes (CORS)
      // On tente, mais si ça fail, on renvoie un objet vide sans faire planter l'app
      const response = await fetch('https://ipapi.co/json/', { 
        signal: AbortSignal.timeout(1500) // Timeout réduit
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      return { country: data.country_name };
    } catch (error) {
      // On ignore l'erreur de localisation pour ne pas bloquer le reste
      return {}; 
    }
  }

  async trackPageView(path: string) {
    if (this.isBot) return;

    try {
      const location = await this.getLocation();
      
      await supabase.from('page_views').insert({
        page_path: path,
        visitor_id: this.visitorId,
        country: location.country || 'Unknown', // Fallback
        device_type: this.getDeviceType(),
        browser: this.getBrowser()
      });
    } catch (error) {
      // Log discret en dev, rien en prod
      if (import.meta.env.DEV) console.warn('Analytics tracking failed:', error);
    }
  }

  async getAnalytics(): Promise<AnalyticsData | null> {
    try {
      const { data, error } = await supabase.rpc('get_simple_analytics');
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }
}

export const analytics = new SimpleAnalytics();

export const useAnalytics = () => {
  const trackPageView = (path: string) => {
    analytics.trackPageView(path);
  };
  const getAnalytics = () => {
    return analytics.getAnalytics();
  };
  return { trackPageView, getAnalytics };
};