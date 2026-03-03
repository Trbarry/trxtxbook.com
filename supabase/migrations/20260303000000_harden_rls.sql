/*
  # Hardening RLS Policies
  
  1. Security
    - Update RLS policies to restrict access to the admin user only (tr.barrypro@gmail.com).
    - Affects `page_views`, `daily_stats`, and `cv_files` tables.
    - Hardens storage policies for `cv-files` and `profile-images`.
*/

-- --- PAGE_VIEWS ---
-- First, remove any broad access for authenticated users
DROP POLICY IF EXISTS "Only authenticated users can read analytics" ON page_views;
DROP POLICY IF EXISTS "Admins peuvent tout faire" ON page_views;
DROP POLICY IF EXISTS "Tout le monde peut lire les analytics" ON page_views;

-- Allow only the specific admin email to read all analytics
CREATE POLICY "Admin select page_views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (auth.email() = 'tr.barrypro@gmail.com');

-- Allow only the specific admin email to manage (delete/update)
CREATE POLICY "Admin manage page_views"
  ON page_views
  FOR ALL
  TO authenticated
  USING (auth.email() = 'tr.barrypro@gmail.com')
  WITH CHECK (auth.email() = 'tr.barrypro@gmail.com');

-- Public can still insert to allow tracking
-- (Assuming the insert policy "Public can insert page views" or similar already exists and is correct)
-- Let's ensure it exists and is restricted to INSERT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'page_views' AND policyname = 'Public can insert page views'
    ) THEN
        CREATE POLICY "Public can insert page views"
          ON page_views
          FOR INSERT
          TO public
          WITH CHECK (true);
    END IF;
END $$;


-- --- DAILY_STATS ---
DROP POLICY IF EXISTS "Admins peuvent gérer les stats" ON daily_stats;

CREATE POLICY "Admin manage daily_stats"
  ON daily_stats
  FOR ALL
  TO authenticated
  USING (auth.email() = 'tr.barrypro@gmail.com')
  WITH CHECK (auth.email() = 'tr.barrypro@gmail.com');


-- --- STORAGE (CV-FILES) ---
DROP POLICY IF EXISTS "Authenticated users can manage CV files" ON storage.objects;

CREATE POLICY "Admin manage CV files"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'cv-files' AND (auth.jwt() ->> 'email') = 'tr.barrypro@gmail.com')
WITH CHECK (bucket_id = 'cv-files' AND (auth.jwt() ->> 'email') = 'tr.barrypro@gmail.com');


-- --- STORAGE (PROFILE-IMAGES) ---
DROP POLICY IF EXISTS "Admins can manage profile images" ON storage.objects;

CREATE POLICY "Admin manage profile images"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'profile-images' AND (auth.jwt() ->> 'email') = 'tr.barrypro@gmail.com')
WITH CHECK (bucket_id = 'profile-images' AND (auth.jwt() ->> 'email') = 'tr.barrypro@gmail.com');
