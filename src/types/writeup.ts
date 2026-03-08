export interface Writeup {
  id: string;
  title: string;
  slug: string;
  content: string;
  platform: string;
  difficulty: string;
  points: number;
  tags: string[];
  created_at: string;
  published: boolean;
  description: string;
  images?: string[];
  da_asset?: string;
  is_active?: boolean;
  cover_image_url?: string;
  likes_count?: number;
}