export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  tags: string[];
  updated_at: string;
}