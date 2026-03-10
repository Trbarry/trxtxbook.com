import useSWR from 'swr';
import { supabase } from '../lib/supabase';
import { Project } from '../types/project';

export function useProject(slug: string) {
  const { data, error, isLoading } = useSWR<Project | null>(
    slug ? `project-${slug}` : null,
    async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      return data;
    },
    { revalidateOnFocus: false }
  );

  return { project: data ?? null, error, isLoading };
}
