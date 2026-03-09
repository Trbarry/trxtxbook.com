import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WikiPage, WikiPageMetadata, WikiSearchResult } from '../types/wiki';

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
 * Hook full-text search avec debounce (300ms)
 * Utilise la fonction RPC search_wiki_pages qui cherche dans title + category + content + tags
 */
export function useWikiSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSWR<WikiSearchResult[]>(
    debouncedQuery.length >= 2 ? ['wiki_search', debouncedQuery] : null,
    async () => {
      const { data, error } = await supabase.rpc('search_wiki_pages', {
        search_query: debouncedQuery,
        result_limit: 25,
      });
      if (error) throw error;
      return (data || []) as WikiSearchResult[];
    },
    { revalidateOnFocus: false }
  );

  return {
    results: data || [],
    isLoading: isLoading && debouncedQuery.length >= 2,
    query: debouncedQuery,
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
