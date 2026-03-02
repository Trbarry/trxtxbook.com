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
    
    // Filter out duplicates or unwanted content
    const filtered = (data || []).filter(page => {
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
