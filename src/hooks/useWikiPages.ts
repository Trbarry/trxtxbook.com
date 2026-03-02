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
    return data || [];
  });

  return {
    pages: data,
    error,
    isLoading,
    mutate
  };
}
