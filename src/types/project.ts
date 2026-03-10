export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  long_description: string;
  tags: string[];
  image_url: string;
  features: string[];
  technical_details: string[];
  status: 'completed' | 'in-progress';
  timeline: string;
  article_url?: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
