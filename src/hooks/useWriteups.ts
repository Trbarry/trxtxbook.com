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
  });

  return {
    writeups: data,
    error,
    isLoading,
    mutate
  };
}
