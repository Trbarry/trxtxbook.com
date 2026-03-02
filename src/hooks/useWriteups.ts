import useSWR from 'swr';
import { supabase } from '../lib/supabase';
import { Writeup } from '../types/writeup';

export function useWriteups() {
  const { data, error, isLoading, mutate } = useSWR<Writeup[]>('writeups', async () => {
    const { data, error } = await supabase
      .from('writeups')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
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
