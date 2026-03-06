import useSWR from 'swr';
import { supabase } from '../lib/supabase';
import { WikiPage, WikiPageMetadata } from '../types/wiki';

/**
 * Hook pour récupérer la liste de toutes les pages du wiki (métadonnées uniquement)
 * Idéal pour la barre latérale, la recherche et la vue en mosaïque.
 * Ne charge pas le contenu pour optimiser les performances.
 */
export function useWikiPages() {
  const { data, error, isLoading, mutate } = useSWR<WikiPageMetadata[]>('wiki_pages_metadata', async () => {
    const { data, error } = await supabase
      .from('wiki_pages')
      .select('id, title, slug, category, tags, likes, published, updated_at')
      .eq('published', true);
    
    if (error) throw error;
    
    // Filter out duplicates or unwanted content
    const filtered = (data || []).filter((page: WikiPageMetadata) => {
      // Remove CPTS duplicate if it's in a specific category or title
      const isCptsDuplicate = page.category?.toLowerCase().includes('cpts') || 
                             page.title?.toLowerCase().includes('cpts');
      
      return !isCptsDuplicate;
    });

    return filtered;
  });

  return {
    pages: data,
    error,
    isLoading,
    mutate
  };
}

/**
 * Hook pour récupérer le contenu complet d'une page spécifique
 */
export function useWikiPageContent(slug: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<WikiPage | null>(
    slug ? ['wiki_page_content', slug] : null, 
    async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    page: data,
    error,
    isLoading,
    mutate
  };
}

/**
 * Hook pour récupérer les backlinks d'une page
 */
export function useWikiBacklinks(slug: string | undefined, title: string | undefined) {
  const { data, error, isLoading } = useSWR(
    slug ? ['wiki_backlinks', slug] : null,
    async () => {
      if (!slug) return [];

      // Recherche les pages qui mentionnent le slug ou le titre dans leur contenu
      // Note: On limite à 10 pour les performances
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('id, title, slug, category, tags, published, updated_at')
        .eq('published', true)
        .neq('slug', slug)
        .or(`content.ilike.%${slug}%,content.ilike.%${title}%`)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  );

  return {
    backlinks: data as WikiPageMetadata[],
    error,
    isLoading
  };
}
