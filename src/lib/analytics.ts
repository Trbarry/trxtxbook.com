import { supabase } from './supabase';

interface PageViewData {
  page_path: string;
  page_title?: string;
  referrer?: string;
  user_agent?: string;
  session_id: string;
  visitor_id: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  device_type?: string;
  ip_suffix?: string;
  screen_resolution?: string;
  language?: string;
  is_bot: boolean;
}

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

class Analytics {
  private sessionId: string;
  private visitorId: string;
  private isInitialized: boolean = false;
  private isBot: boolean = false;
  private deviceType: string;
  private ipSuffix: string = '';

  constructor() {
    this.isBot = this.detectBot();
    if (!this.isBot) {
      this.deviceType = this.getDeviceType();
      this.sessionId = this.getOrCreateSessionId();
      this.visitorId = this.getOrCreateVisitorId();
      this.initializeSession();
    }
  }

  // 🤖 PROTECTION ANTI-BOTS AMÉLIORÉE
  private detectBot(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Liste étendue des bots connus
    const botPatterns = [
      'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
      'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
      'whatsapp', 'telegrambot', 'applebot', 'crawler', 'spider',
      'bot', 'crawl', 'scrape', 'fetch', 'monitor', 'check',
      'lighthouse', 'pagespeed', 'gtmetrix', 'pingdom', 'uptime',
      'headless', 'phantom', 'selenium', 'webdriver', 'puppeteer',
      'playwright', 'curl', 'wget', 'python', 'java', 'go-http'
    ];

    // Vérifier si l'user agent contient des patterns de bots
    const isKnownBot = botPatterns.some(pattern => userAgent.includes(pattern));
    
    // Vérifications supplémentaires
    const hasWebdriver = 'webdriver' in navigator || (window as any).webdriver;
    const hasPhantom = (window as any).phantom || (window as any)._phantom;
    const hasSelenium = (window as any).selenium;
    
    // Vérifier si les APIs normales du navigateur sont disponibles
    const hasNormalBrowserAPIs = 'localStorage' in window && 
                                'sessionStorage' in window &&
                                'history' in window &&
                                'screen' in window;

    // Vérifier la cohérence des propriétés du navigateur
    const hasInconsistentProps = navigator.languages && navigator.languages.length === 0;

    return isKnownBot || hasWebdriver || hasPhantom || hasSelenium || 
           !hasNormalBrowserAPIs || hasInconsistentProps;
  }

  // 🛡️ PROTECTION CONTRE LE SPAM
  private rateLimitCheck(): boolean {
    const lastTrack = localStorage.getItem('last_track_time');
    const now = Date.now();
    
    if (lastTrack && (now - parseInt(lastTrack)) < 1000) {
      return false;
    }
    
    localStorage.setItem('last_track_time', now.toString());
    return true;
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('portfolio_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('portfolio_session_id', sessionId);
    }
    return sessionId;
  }

  private getOrCreateVisitorId(): string {
    let visitorId = localStorage.getItem('portfolio_visitor_id');
    if (!visitorId) {
      // Créer un ID unique basé sur plusieurs facteurs
      const fingerprint = this.generateFingerprint();
      visitorId = `visitor_${Date.now()}_${fingerprint}`;
      localStorage.setItem('portfolio_visitor_id', visitorId);
    }
    return visitorId;
  }

  // 🔍 FINGERPRINTING BASIQUE (respectueux de la vie privée)
  private generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      canvas.toDataURL().slice(-10) // Seulement les 10 derniers caractères
    ].join('|');
    
    // Hash simple
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  // 📱 DÉTECTION DU TYPE D'APPAREIL
  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    
    if (/iPad/.test(userAgent)) {
      return 'tablet';
    }
    
    if (/iPhone|iPod|Android.*Mobile|BlackBerry|Windows Phone|webOS|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    
    if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) {
      return 'tablet';
    }
    
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

  // 🌍 GÉOLOCALISATION AMÉLIORÉE
  private async getLocationData(): Promise<{
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
  }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city,
        region: data.region,
        timezone: data.timezone
      };
    } catch {
      return {};
    }
  }

  // 📊 INFORMATIONS SYSTÈME
  private getSystemInfo(): {
    screen_resolution: string;
    language: string;
  } {
    return {
      screen_resolution: `${screen.width}x${screen.height}`,
      language: navigator.language
    };
  }

  // 🔢 EXTRACTION IP SUFFIX (simulé côté client)
  private async getIpSuffix(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const ip = data.ip;
      // Extraire seulement les 6 derniers chiffres
      const digits = ip.replace(/[^0-9]/g, '');
      return digits.slice(-6);
    } catch {
      return Math.random().toString().slice(-6);
    }
  }

  private async initializeSession() {
    if (this.isInitialized || this.isBot) return;

    try {
      const locationData = await this.getLocationData();
      this.ipSuffix = await this.getIpSuffix();

      // Check if session exists
      const { data: existingSession } = await supabase
        .from('visitor_sessions')
        .select('*')
        .eq('session_id', this.sessionId)
        .single();

      const systemInfo = this.getSystemInfo();

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
            visitor_id: this.visitorId,
            device_type: this.deviceType,
            ip_suffix: this.ipSuffix,
            ...locationData,
            ...systemInfo,
            is_bot: this.isBot
          });
      }

      // Update unique visitors table
      await supabase
        .from('unique_visitors')
        .upsert({
          visitor_id: this.visitorId,
          last_visit: new Date().toISOString(),
          ip_suffix: this.ipSuffix,
          countries: locationData.country ? [locationData.country] : [],
          cities: locationData.city ? [locationData.city] : [],
          devices: [this.deviceType]
        }, {
          onConflict: 'visitor_id'
        });

      this.isInitialized = true;
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  async trackPageView(path: string, title?: string) {
    if (this.isBot) {
      console.log('Bot detected, skipping analytics tracking');
      return;
    }

    if (!this.rateLimitCheck()) {
      console.log('Rate limit exceeded, skipping tracking');
      return;
    }

    try {
      const locationData = await this.getLocationData();
      const systemInfo = this.getSystemInfo();

      const pageViewData: PageViewData = {
        page_path: path,
        page_title: title || document.title,
        referrer: document.referrer || undefined,
        user_agent: navigator.userAgent,
        session_id: this.sessionId,
        visitor_id: this.visitorId,
        device_type: this.deviceType,
        ip_suffix: this.ipSuffix,
        is_bot: this.isBot,
        ...locationData,
        ...systemInfo
      };

      await supabase
        .from('page_views')
        .insert(pageViewData);

    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  async getEnhancedAnalytics(): Promise<EnhancedAnalyticsData | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_enhanced_analytics');

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          uniqueVisitors: 0,
          totalPageViews: 0,
          uniqueVisitorsToday: 0,
          pageViewsToday: 0,
          topPages: [],
          countries: [],
          cities: [],
          devices: [],
          browsers: [],
          recentVisitors: [],
          visitorFlow: []
        };
      }

      const result = data[0];
      return {
        uniqueVisitors: result.unique_visitors || 0,
        totalPageViews: result.total_page_views || 0,
        uniqueVisitorsToday: result.unique_visitors_today || 0,
        pageViewsToday: result.page_views_today || 0,
        topPages: result.top_pages || [],
        countries: result.countries || [],
        cities: result.cities || [],
        devices: result.devices || [],
        browsers: result.browsers || [],
        recentVisitors: result.recent_visitors || [],
        visitorFlow: result.visitor_flow || []
      };

    } catch (error) {
      console.error('Error fetching enhanced analytics:', error);
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

  const getEnhancedAnalytics = () => {
    return analytics.getEnhancedAnalytics();
  };

  return { trackPageView, getAnalytics: getEnhancedAnalytics };
};