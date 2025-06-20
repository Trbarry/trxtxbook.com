/*
  # Create writeups table

  1. New Tables
    - `writeups`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `content` (text)
      - `platform` (text)
      - `difficulty` (text)
      - `points` (integer)
      - `tags` (text[])
      - `created_at` (timestamptz)
      - `published` (boolean)
      - `description` (text)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on `writeups` table
    - Add policies for authenticated users to manage their writeups
    - Add policy for public read access to published writeups
*/

CREATE TABLE IF NOT EXISTS writeups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  platform text NOT NULL,
  difficulty text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  published boolean NOT NULL DEFAULT false,
  description text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE writeups ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own writeups
CREATE POLICY "Users can manage own writeups"
  ON writeups
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow public read access to published writeups
CREATE POLICY "Public can view published writeups"
  ON writeups
  FOR SELECT
  TO public
  USING (published = true);