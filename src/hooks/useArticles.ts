import useSWR from 'swr';
import { supabase } from '../lib/supabase';
import { Article, ArticleMetadata } from '../types/article';

export function useArticles() {
  const { data, error, isLoading } = useSWR<ArticleMetadata[]>('articles_metadata', async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, category, description, tags, cover_image_url, likes, published, created_at, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  });

  return { articles: data, error, isLoading };
}

export function useArticle(slug: string | undefined) {
  const { data, error, isLoading } = useSWR<Article | null>(
    slug ? ['article_content', slug] : null,
    async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      return data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return { article: data, error, isLoading };
}
