/*
  # Restrict analytics access
  
  1. Security
    - Update RLS policy for `page_views` table
    - Only allow authenticated users (admin) to read all analytics
    - Public can still insert (to allow tracking)
*/

-- Remove existing broad select policy
DROP POLICY IF EXISTS "Tout le monde peut lire les analytics" ON page_views;

-- Create restricted select policy
CREATE POLICY "Only authenticated users can read analytics"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure insert policy remains for public
DROP POLICY IF EXISTS "Tout le monde peut insérer des vues" ON page_views;
CREATE POLICY "Public can insert page views"
  ON page_views
  FOR INSERT
  TO public
  WITH CHECK (true);
