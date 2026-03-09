import useSWR, { mutate } from 'swr';
import { useState } from 'react';
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
  }, { revalidateOnFocus: false, dedupingInterval: 60000 });

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

export function useArticleViews(slug: string | undefined) {
  const { data } = useSWR<number>(
    slug ? ['article_views', slug] : null,
    async () => {
      const { count } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('page_path', `/articles/${slug}`);
      return count ?? 0;
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  return data ?? 0;
}

export function useLikeArticle(article: Article | null | undefined) {
  const storageKey = article ? `liked_article_${article.id}` : null;
  const [liked, setLiked] = useState(() =>
    storageKey ? localStorage.getItem(storageKey) === 'true' : false
  );
  const [count, setCount] = useState(article?.likes ?? 0);

  const toggle = async () => {
    if (!article || liked) return;
    setLiked(true);
    setCount(c => c + 1);
    localStorage.setItem(storageKey!, 'true');
    await supabase
      .from('articles')
      .update({ likes: article.likes + 1 })
      .eq('id', article.id);
    mutate(['article_content', article.slug]);
  };

  return { liked, count, toggle };
}
