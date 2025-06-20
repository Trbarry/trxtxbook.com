/*
  # Add Root-Me stats cache table

  1. New Tables
    - `rootme_stats_cache`
      - `id` (integer, primary key)
      - `challenges` (integer)
      - `points` (integer)
      - `rank` (text)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `rootme_stats_cache` table
    - Add policy for authenticated users to manage cache
    - Add policy for public to read cache
*/

-- Create Root-Me stats cache table
CREATE TABLE IF NOT EXISTS rootme_stats_cache (
  id integer PRIMARY KEY,
  challenges integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  rank text NOT NULL DEFAULT 'Top 5%',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE rootme_stats_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access to cache
CREATE POLICY "Public can read Root-Me stats cache"
  ON rootme_stats_cache
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage cache
CREATE POLICY "Authenticated users can manage Root-Me stats cache"
  ON rootme_stats_cache
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial cache entry
INSERT INTO rootme_stats_cache (id, challenges, points, rank)
VALUES (1, 42, 735, 'Top 5%')
ON CONFLICT (id) DO NOTHING;