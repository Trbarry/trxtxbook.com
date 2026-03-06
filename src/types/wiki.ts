export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  tags: string[];
  likes: number; // ✅ NOUVEAU
  published: boolean;
  updated_at: string;
}

export type WikiPageMetadata = Omit<WikiPage, 'content'>;
