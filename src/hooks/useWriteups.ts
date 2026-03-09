import useSWR from 'swr';
import { supabase } from '../lib/supabase';
import { Writeup } from '../types/writeup';

export function useWriteups(limit?: number) {
  const { data, error, isLoading, mutate } = useSWR<Writeup[]>(['writeups', limit], async () => {
    let query = supabase
      .from('writeups')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }, { revalidateOnFocus: false, dedupingInterval: 60000 });

  return {
    writeups: data,
    error,
    isLoading,
    mutate
  };
}

export function useWriteup(slug: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Writeup | null>(
    slug ? ['writeup', slug] : null,
    async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('writeups')
        .select('*')
        .eq('slug', slug)
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
    writeup: data,
    error,
    isLoading,
    mutate
  };
}
