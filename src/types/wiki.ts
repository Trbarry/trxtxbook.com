export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  tags: string[];
  likes: number; // ✅ NOUVEAU
  updated_at: string;
}