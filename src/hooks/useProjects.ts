import useSWR from 'swr';
import { supabase } from '../lib/supabase';
import { Project } from '../types/project';

export function useProjects() {
  const { data, error, isLoading } = useSWR<Project[]>('projects', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }, { revalidateOnFocus: false, dedupingInterval: 60000 });

  return { projects: data ?? [], error, isLoading };
}
