import useSWR from 'swr';
import { supabase } from '../lib/supabase';
import { WikiPage } from '../types/wiki';

export function useWikiPages() {
  const { data, error, isLoading, mutate } = useSWR<WikiPage[]>('wiki_pages', async () => {
    const { data, error } = await supabase
      .from('wiki_pages')
      .select('*')
      .eq('published', true);
    
    if (error) throw error;
    
    // Filter out duplicates, unwanted content, or empty/placeholder pages
    const filtered = (data || []).filter((page: WikiPage) => {
      // Remove CPTS duplicate if it's in a specific category or title
      const isCptsDuplicate = page.category?.toLowerCase().includes('cpts') || 
                             page.title?.toLowerCase().includes('cpts');
      
      // Hide empty pages (no content or placeholder)
      const isEmpty = !page.content || 
                     page.content.trim().length === 0 || 
                     page.content.trim().toLowerCase() === 'en cours de rédaction' ||
                     page.content.trim().toLowerCase() === 'coming soon';
      
      return !isCptsDuplicate && !isEmpty;
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
