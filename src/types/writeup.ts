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
<<<<<<< HEAD
  da_asset?: string; // Champ pour l'actif de Direction Artistique (DA)
=======
  is_active?: boolean;
  cover_image_url?: string;
  likes_count?: number;
>>>>>>> 8934296eb67dd60afc8e6c696c49d05aa428bcbc
}