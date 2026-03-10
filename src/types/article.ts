export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  cover_image_url?: string;
  likes: number;
  reading_time: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type ArticleMetadata = Omit<Article, 'content'>;
