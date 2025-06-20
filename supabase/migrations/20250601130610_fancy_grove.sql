/*
  # Unify articles and projects into a single table
  
  1. New Table
    - `articles` table to store all content (articles, projects, write-ups)
    - Includes metadata and content fields
    - Supports different content types via category field
*/

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('writeup', 'project', 'tutorial')),
  tags text[] NOT NULL DEFAULT '{}',
  image text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published boolean NOT NULL DEFAULT false,
  article_url text
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles
CREATE POLICY "Public can view published articles"
  ON articles
  FOR SELECT
  TO public
  USING (published = true);

-- Allow authenticated users to manage articles
CREATE POLICY "Authenticated users can manage articles"
  ON articles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial articles
INSERT INTO articles (title, slug, content, description, category, tags, image, published)
VALUES 
  ('Linux Mint : Une Bouffée d''Air Frais pour Votre Ancien PC', 
   'linux-mint-revival',
   'Article content here...',
   'Trop lent sous Windows 11 ? Linux Mint redonne fluidité, sécurité et simplicité à votre PC, même avec seulement 4 Go de RAM.',
   'tutorial',
   ARRAY['Linux Mint', 'Performance', 'PC ancien', 'Alternative Windows'],
   'https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/linux-mint.png',
   true),
  ('Infrastructure Active Directory Complète',
   'ad-network',
   'Article content here...',
   'Infrastructure complète AD pour tests de sécurité et apprentissage',
   'project',
   ARRAY['Windows Server', 'Active Directory', 'pfSense', 'Virtualisation'],
   'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=80',
   true);