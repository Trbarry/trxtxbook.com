import { supabase } from './supabase';

interface PageViewData {
  page_path: string;
  page_title?: string;
  referrer?: string;
  user_agent?: string;
  session_id: string;
  country?: string;
  device_type?: string;
}

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

class Analytics {
  private sessionId: string;
  private isInitialized: boolean = false;
  private isBot: boolean = false;
  private deviceType: string;

  constructor() {
    this.isBot = this.detectBot();
    if (!this.isBot) {
      this.deviceType = this.getDeviceType();
      this.sessionId = this.getOrCreateSessionId();
      this.initializeSession();
    }
  }

  // 🤖 PROTECTION ANTI-BOTS
  private detectBot(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Liste des bots connus
    const botPatterns = [
      'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
      'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
      'whatsapp', 'telegrambot', 'applebot', 'crawler', 'spider',
      'bot', 'crawl', 'scrape', 'fetch', 'monitor', 'check',
      'lighthouse', 'pagespeed', 'gtmetrix', 'pingdom', 'uptime',
      'headless', 'phantom', 'selenium', 'webdriver', 'puppeteer'
    ];

    // Vérifier si l'user agent contient des patterns de bots
    const isKnownBot = botPatterns.some(pattern => userAgent.includes(pattern));
    
    // Vérifier si c'est un navigateur headless
    const isHeadless = !window.navigator.webdriver && 
                      (window.navigator.languages === undefined || 
                       window.navigator.languages.length === 0);

    // Vérifier si les APIs normales du navigateur sont disponibles
    const hasNormalBrowserAPIs = 'localStorage' in window && 
                                'sessionStorage' in window &&
                                'history' in window;

    return isKnownBot || isHeadless || !hasNormalBrowserAPIs;
  }

  // 🛡️ PROTECTION CONTRE LE SPAM
  private rateLimitCheck(): boolean {
    const lastTrack = localStorage.getItem('last_track_time');
    const now = Date.now();
    
    if (lastTrack && (now - parseInt(lastTrack)) < 1000) {
      // Limite : 1 tracking par seconde maximum
      return false;
    }
    
    localStorage.setItem('last_track_time', now.toString());
    return true;
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('portfolio_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('portfolio_session_id', sessionId);
    }
    return sessionId;
  }

  // 📱 DÉTECTION DU TYPE D'APPAREIL UNIQUEMENT
  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    
    // Détection précise du type d'appareil
    if (/iPad/.test(userAgent)) {
      return 'tablet';
    }
    
    if (/iPhone|iPod|Android.*Mobile|BlackBerry|Windows Phone|webOS|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    
    if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) {
      return 'tablet';
    }
    
    // Vérification supplémentaire basée sur la taille d'écran
    if (window.screen && window.screen.width) {
      const screenWidth = window.screen.width;
      if (screenWidth <= 768) {
        return 'mobile';
      } else if (screenWidth <= 1024) {
        return 'tablet';
      }
    }
    
    return 'desktop';
  }

  private async initializeSession() {
    if (this.isInitialized || this.isBot) return;

    try {
      // Check if session exists
      const { data: existingSession } = await supabase
        .from('visitor_sessions')
        .select('*')
        .eq('session_id', this.sessionId)
        .single();

      if (existingSession) {
        // Update existing session
        await supabase
          .from('visitor_sessions')
          .update({
            last_visit: new Date().toISOString(),
            page_count: existingSession.page_count + 1
          })
          .eq('session_id', this.sessionId);
      } else {
        // Create new session
        await supabase
          .from('visitor_sessions')
          .insert({
            session_id: this.sessionId,
            device_type: this.deviceType,
            country: await this.getCountry()
          });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  private async getCountry(): Promise<string | undefined> {
    try {
      // Using a free IP geolocation service with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      return data.country_name;
    } catch {
      return undefined;
    }
  }

  async trackPageView(path: string, title?: string) {
    // 🚫 Ne pas tracker si c'est un bot
    if (this.isBot) {
      console.log('Bot detected, skipping analytics tracking');
      return;
    }

    // 🚫 Rate limiting
    if (!this.rateLimitCheck()) {
      console.log('Rate limit exceeded, skipping tracking');
      return;
    }

    try {
      const pageViewData: PageViewData = {
        page_path: path,
        page_title: title || document.title,
        referrer: document.referrer || undefined,
        user_agent: navigator.userAgent,
        session_id: this.sessionId,
        country: await this.getCountry(),
        device_type: this.deviceType
      };

      await supabase
        .from('page_views')
        .insert(pageViewData);

    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  async getAnalytics(): Promise<AnalyticsData | null> {
    try {
      // Get today's date for filtering
      const today = new Date().toISOString().split('T')[0];

      // Get all page views for today (excluding bots)
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('session_id, page_path, country, device_type, user_agent, created_at')
        .gte('created_at', today)
        .not('user_agent', 'ilike', '%bot%')
        .not('user_agent', 'ilike', '%crawler%')
        .not('user_agent', 'ilike', '%spider%')
        .not('user_agent', 'ilike', '%scrape%')
        .not('user_agent', 'ilike', '%lighthouse%')
        .not('user_agent', 'ilike', '%pagespeed%');

      if (!pageViews || pageViews.length === 0) {
        return {
          uniqueVisitors: 0,
          totalPageViews: 0,
          topPages: [],
          countries: [],
          devices: [],
          recentViews: []
        };
      }

      // Calculate unique visitors
      const uniqueVisitors = new Set(pageViews.map(pv => pv.session_id)).size;
      const totalPageViews = pageViews.length;

      // Count page views by path (fix duplication)
      const pathCounts = new Map<string, number>();
      pageViews.forEach(pv => {
        const currentCount = pathCounts.get(pv.page_path) || 0;
        pathCounts.set(pv.page_path, currentCount + 1);
      });

      // Count by country (fix duplication)
      const countryCounts = new Map<string, number>();
      pageViews.forEach(pv => {
        if (pv.country) {
          const currentCount = countryCounts.get(pv.country) || 0;
          countryCounts.set(pv.country, currentCount + 1);
        }
      });

      // Count by device (fix duplication)
      const deviceCounts = new Map<string, number>();
      pageViews.forEach(pv => {
        if (pv.device_type) {
          const currentCount = deviceCounts.get(pv.device_type) || 0;
          deviceCounts.set(pv.device_type, currentCount + 1);
        }
      });

      // Convert Maps to sorted arrays
      const topPages = Array.from(pathCounts.entries())
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const countries = Array.from(countryCounts.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const devices = Array.from(deviceCounts.entries())
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count);

      // Get recent views (last 10)
      const recentViews = pageViews
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(pv => ({
          page_path: pv.page_path,
          created_at: pv.created_at,
          country: pv.country,
          device_type: pv.device_type
        }));

      return {
        uniqueVisitors,
        totalPageViews,
        topPages,
        countries,
        devices,
        recentViews
      };

    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Hook for React components
export const useAnalytics = () => {
  const trackPageView = (path: string, title?: string) => {
    analytics.trackPageView(path, title);
  };

  const getAnalytics = () => {
    return analytics.getAnalytics();
  };

  return { trackPageView, getAnalytics };
};