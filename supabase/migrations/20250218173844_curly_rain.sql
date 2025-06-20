/*
  # Add CV storage support

  1. New Tables
    - `cv_files` table to store CV information
      - `id` (uuid, primary key)
      - `filename` (text)
      - `storage_path` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Storage
    - Create new bucket for CV files
    - Add RLS policies for CV access
*/

-- Create CV files table
CREATE TABLE IF NOT EXISTS cv_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE cv_files ENABLE ROW LEVEL SECURITY;

-- Allow public read access to CV files
CREATE POLICY "Public can view CV files"
  ON cv_files
  FOR SELECT
  TO public
  USING (true);

-- Create storage bucket for CV files
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-files', 'cv-files', true)
ON CONFLICT DO NOTHING;

-- Allow public read access to CV files in storage
CREATE POLICY "Public can read CV files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cv-files');

-- Allow authenticated users to manage CV files
CREATE POLICY "Authenticated users can manage CV files"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'cv-files')
WITH CHECK (bucket_id = 'cv-files');