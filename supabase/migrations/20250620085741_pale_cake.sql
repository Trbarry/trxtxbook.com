/*
  # Create analytics system

  1. New Tables
    - `page_views` - Track page visits
    - `visitor_sessions` - Track unique sessions
    - `analytics_summary` - Daily/monthly summaries

  2. Security
    - Enable RLS on all tables
    - Public can insert page views (anonymous)
    - Only authenticated users can read analytics
*/

-- Page views table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  page_title text,
  referrer text,
  user_agent text,
  ip_hash text, -- Hashed IP for privacy
  session_id text NOT NULL,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Visitor sessions table
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  first_visit timestamptz NOT NULL DEFAULT now(),
  last_visit timestamptz NOT NULL DEFAULT now(),
  page_count integer NOT NULL DEFAULT 1,
  is_returning boolean NOT NULL DEFAULT false,
  country text,
  device_type text,
  browser text
);

-- Analytics summary table
CREATE TABLE IF NOT EXISTS analytics_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  unique_visitors integer NOT NULL DEFAULT 0,
  total_page_views integer NOT NULL DEFAULT 0,
  top_pages jsonb NOT NULL DEFAULT '[]',
  countries jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert page views
CREATE POLICY "Anyone can track page views"
  ON page_views
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anonymous users to update sessions
CREATE POLICY "Anyone can update sessions"
  ON visitor_sessions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can read analytics
CREATE POLICY "Authenticated users can read page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read sessions"
  ON visitor_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read analytics summary"
  ON analytics_summary
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to update analytics summary
CREATE OR REPLACE FUNCTION update_analytics_summary()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO analytics_summary (
    date,
    unique_visitors,
    total_page_views,
    top_pages,
    countries
  )
  SELECT
    CURRENT_DATE,
    COUNT(DISTINCT session_id),
    COUNT(*),
    jsonb_agg(DISTINCT jsonb_build_object('path', page_path, 'count', page_count)) FILTER (WHERE page_path IS NOT NULL),
    jsonb_agg(DISTINCT jsonb_build_object('country', country, 'count', country_count)) FILTER (WHERE country IS NOT NULL)
  FROM (
    SELECT 
      session_id,
      page_path,
      COUNT(*) as page_count,
      country,
      COUNT(*) OVER (PARTITION BY country) as country_count
    FROM page_views 
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY session_id, page_path, country
  ) daily_stats
  ON CONFLICT (date) 
  DO UPDATE SET
    unique_visitors = EXCLUDED.unique_visitors,
    total_page_views = EXCLUDED.total_page_views,
    top_pages = EXCLUDED.top_pages,
    countries = EXCLUDED.countries;
END;
$$;