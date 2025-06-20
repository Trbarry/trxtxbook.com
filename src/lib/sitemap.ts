import { supabase } from './supabase';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

interface RouteConfig {
  path: string;
  priority: number;
  changefreq: SitemapUrl['changefreq'];
  dynamic?: boolean;
}

// Configuration des routes statiques
const staticRoutes: RouteConfig[] = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/writeups', priority: 0.9, changefreq: 'weekly' },
  { path: '/projects', priority: 0.9, changefreq: 'monthly' },
  { path: '/certifications', priority: 0.8, changefreq: 'monthly' },
];

// Configuration des routes d'articles statiques
const staticArticles: RouteConfig[] = [
  { path: '/articles/cpts-journey', priority: 0.9, changefreq: 'monthly' },
  { path: '/articles/linux-mint-revival', priority: 0.8, changefreq: 'monthly' },
  { path: '/articles/exegol-docker', priority: 0.8, changefreq: 'monthly' },
  { path: '/articles/ad-network', priority: 0.8, changefreq: 'monthly' },
  { path: '/articles/smb-server', priority: 0.8, changefreq: 'monthly' },
  { path: '/articles/steam-deck-kali', priority: 0.8, changefreq: 'monthly' },
];

export class SitemapGenerator {
  private baseUrl = 'https://trxtxbook.com';

  async generateSitemap(): Promise<string> {
    const urls: SitemapUrl[] = [];

    // Ajouter les routes statiques
    urls.push(...this.generateStaticUrls());

    // Ajouter les articles statiques
    urls.push(...this.generateStaticArticleUrls());

    // Ajouter les write-ups dynamiques depuis Supabase
    const writeupUrls = await this.generateWriteupUrls();
    urls.push(...writeupUrls);

    // Générer le XML
    return this.generateXML(urls);
  }

  private generateStaticUrls(): SitemapUrl[] {
    return staticRoutes.map(route => ({
      loc: `${this.baseUrl}${route.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: route.changefreq,
      priority: route.priority
    }));
  }

  private generateStaticArticleUrls(): SitemapUrl[] {
    return staticArticles.map(article => ({
      loc: `${this.baseUrl}${article.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: article.changefreq,
      priority: article.priority
    }));
  }

  private async generateWriteupUrls(): Promise<SitemapUrl[]> {
    try {
      const { data: writeups, error } = await supabase
        .from('writeups')
        .select('slug, created_at, updated_at')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching writeups for sitemap:', error);
        return [];
      }

      return writeups?.map(writeup => ({
        loc: `${this.baseUrl}/writeups/${writeup.slug}`,
        lastmod: (writeup.updated_at || writeup.created_at).split('T')[0],
        changefreq: 'monthly' as const,
        priority: 0.7
      })) || [];
    } catch (error) {
      console.error('Error generating writeup URLs:', error);
      return [];
    }
  }

  private generateXML(urls: SitemapUrl[]): string {
    const urlElements = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlElements}
</urlset>`;
  }

  // Méthode pour sauvegarder le sitemap (côté serveur)
  async saveSitemap(): Promise<void> {
    const sitemapContent = await this.generateSitemap();
    
    // En production, vous pourriez utiliser une API route ou un webhook
    // Pour le développement, on peut l'afficher dans la console
    console.log('Generated sitemap:', sitemapContent);
    
    // Optionnel: sauvegarder dans Supabase Storage
    try {
      const { error } = await supabase.storage
        .from('assets')
        .upload('sitemap.xml', new Blob([sitemapContent], { type: 'application/xml' }), {
          upsert: true
        });

      if (error) {
        console.error('Error saving sitemap to storage:', error);
      } else {
        console.log('Sitemap saved to Supabase Storage');
      }
    } catch (error) {
      console.error('Error uploading sitemap:', error);
    }
  }
}

// Hook React pour utiliser le générateur de sitemap
export const useSitemapGenerator = () => {
  const generator = new SitemapGenerator();

  const generateSitemap = async () => {
    return await generator.generateSitemap();
  };

  const saveSitemap = async () => {
    await generator.saveSitemap();
  };

  return { generateSitemap, saveSitemap };
};