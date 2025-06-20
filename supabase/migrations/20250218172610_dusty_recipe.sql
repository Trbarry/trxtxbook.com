/*
  # Add images support for writeups

  1. Changes
    - Add `images` column to `writeups` table to store image URLs
  
  2. Storage
    - Create `writeup-images` bucket for storing writeup images
    - Set up RLS policies for the bucket
*/

-- Add images column to writeups table
ALTER TABLE writeups 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Create storage bucket for writeup images
INSERT INTO storage.buckets (id, name)
VALUES ('writeup-images', 'writeup-images')
ON CONFLICT DO NOTHING;

-- Enable RLS for the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to writeup images
CREATE POLICY "Public can read writeup images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'writeup-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload writeup images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'writeup-images'
);