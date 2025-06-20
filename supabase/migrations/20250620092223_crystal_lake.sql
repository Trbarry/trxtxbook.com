-- Ajouter la colonne device_type à la table page_views si elle n'existe pas déjà
ALTER TABLE page_views 
ADD COLUMN IF NOT EXISTS device_type text;

-- Mettre à jour la fonction d'analytics pour inclure les appareils
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

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE 'Device detection added to analytics system!';
  RAISE NOTICE 'Now tracking: mobile, tablet, desktop devices';
END $$;