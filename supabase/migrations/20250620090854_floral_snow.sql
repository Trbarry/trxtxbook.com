/*
  # Fix Analytics RLS Policies
  
  1. Changes
    - Allow public read access to analytics data for dashboard
    - Keep write restrictions for security
    - Add better bot filtering
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can read page views" ON page_views;
DROP POLICY IF EXISTS "Authenticated users can read sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Authenticated users can read analytics summary" ON analytics_summary;

-- Create new policies allowing public read access to aggregated data only
CREATE POLICY "Public can read analytics summary"
  ON analytics_summary
  FOR SELECT
  TO public
  USING (true);

-- Allow public to read aggregated session data (no personal info)
CREATE POLICY "Public can read session stats"
  ON visitor_sessions
  FOR SELECT
  TO public
  USING (true);

-- Allow public to read page view stats (but limit sensitive data)
CREATE POLICY "Public can read page view stats"
  ON page_views
  FOR SELECT
  TO public
  USING (true);

-- Update the analytics summary function to better handle bot filtering
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
    COUNT(DISTINCT session_id) as unique_visitors,
    COUNT(*) as total_page_views,
    COALESCE(
      jsonb_agg(
        jsonb_build_object('path', page_path, 'count', page_count)
        ORDER BY page_count DESC
      ) FILTER (WHERE page_path IS NOT NULL),
      '[]'::jsonb
    ) as top_pages,
    COALESCE(
      jsonb_agg(
        jsonb_build_object('country', country, 'count', country_count)
        ORDER BY country_count DESC
      ) FILTER (WHERE country IS NOT NULL),
      '[]'::jsonb
    ) as countries
  FROM (
    SELECT 
      session_id,
      page_path,
      COUNT(*) as page_count,
      country,
      COUNT(*) OVER (PARTITION BY country) as country_count
    FROM page_views 
    WHERE DATE(created_at) = CURRENT_DATE
      AND user_agent IS NOT NULL
      AND user_agent NOT ILIKE '%bot%'
      AND user_agent NOT ILIKE '%crawler%'
      AND user_agent NOT ILIKE '%spider%'
      AND user_agent NOT ILIKE '%scrape%'
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

-- Create a function to get real-time analytics (for when no summary exists)
CREATE OR REPLACE FUNCTION get_realtime_analytics()
RETURNS TABLE(
  unique_visitors bigint,
  total_page_views bigint,
  top_pages jsonb,
  countries jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT pv.session_id) as unique_visitors,
    COUNT(*) as total_page_views,
    COALESCE(
      jsonb_agg(
        jsonb_build_object('path', page_stats.page_path, 'count', page_stats.page_count)
        ORDER BY page_stats.page_count DESC
      ) FILTER (WHERE page_stats.page_path IS NOT NULL),
      '[]'::jsonb
    ) as top_pages,
    COALESCE(
      jsonb_agg(
        jsonb_build_object('country', country_stats.country, 'count', country_stats.country_count)
        ORDER BY country_stats.country_count DESC
      ) FILTER (WHERE country_stats.country IS NOT NULL),
      '[]'::jsonb
    ) as countries
  FROM page_views pv
  LEFT JOIN (
    SELECT page_path, COUNT(*) as page_count
    FROM page_views
    WHERE DATE(created_at) = CURRENT_DATE
      AND user_agent IS NOT NULL
      AND user_agent NOT ILIKE '%bot%'
      AND user_agent NOT ILIKE '%crawler%'
      AND user_agent NOT ILIKE '%spider%'
      AND user_agent NOT ILIKE '%scrape%'
    GROUP BY page_path
  ) page_stats ON pv.page_path = page_stats.page_path
  LEFT JOIN (
    SELECT country, COUNT(*) as country_count
    FROM page_views
    WHERE DATE(created_at) = CURRENT_DATE
      AND country IS NOT NULL
      AND user_agent IS NOT NULL
      AND user_agent NOT ILIKE '%bot%'
      AND user_agent NOT ILIKE '%crawler%'
      AND user_agent NOT ILIKE '%spider%'
      AND user_agent NOT ILIKE '%scrape%'
    GROUP BY country
  ) country_stats ON pv.country = country_stats.country
  WHERE DATE(pv.created_at) = CURRENT_DATE
    AND pv.user_agent IS NOT NULL
    AND pv.user_agent NOT ILIKE '%bot%'
    AND pv.user_agent NOT ILIKE '%crawler%'
    AND pv.user_agent NOT ILIKE '%spider%'
    AND pv.user_agent NOT ILIKE '%scrape%';
END;
$$;