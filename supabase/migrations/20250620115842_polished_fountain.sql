-- Supprimer toutes les anciennes tables analytics
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS visitor_sessions CASCADE;
DROP TABLE IF EXISTS analytics_summary CASCADE;
DROP TABLE IF EXISTS unique_visitors CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;

-- Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS get_today_analytics();
DROP FUNCTION IF EXISTS get_enhanced_analytics();
DROP FUNCTION IF EXISTS get_realtime_analytics();
DROP FUNCTION IF EXISTS update_analytics_summary();
DROP FUNCTION IF EXISTS cleanup_old_analytics_data();
DROP FUNCTION IF EXISTS is_bot_user_agent(text);
DROP FUNCTION IF EXISTS extract_ip_suffix(text);
DROP FUNCTION IF EXISTS is_bot(text);

-- ==========================================
-- SYSTÈME D'ANALYTICS SIMPLE
-- ==========================================

-- Table principale pour tracker les visites
CREATE TABLE page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  visitor_id text NOT NULL,
  country text,
  device_type text CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Politiques simples
CREATE POLICY "Tout le monde peut insérer des vues"
  ON page_views FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Tout le monde peut lire les analytics"
  ON page_views FOR SELECT TO public USING (true);

-- Index pour les performances
CREATE INDEX idx_page_views_date ON page_views(created_at);
CREATE INDEX idx_page_views_visitor ON page_views(visitor_id);
CREATE INDEX idx_page_views_path ON page_views(page_path);

-- ==========================================
-- FONCTION ANALYTICS SIMPLE
-- ==========================================

CREATE OR REPLACE FUNCTION get_simple_analytics()
RETURNS TABLE(
  unique_visitors bigint,
  total_page_views bigint,
  top_pages jsonb,
  countries jsonb,
  devices jsonb,
  recent_visitors jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH today_data AS (
    SELECT *
    FROM page_views 
    WHERE DATE(created_at) = CURRENT_DATE
  ),
  stats AS (
    SELECT 
      COUNT(DISTINCT visitor_id) as visitors,
      COUNT(*) as views
    FROM today_data
  ),
  pages AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object('path', page_path, 'count', cnt)
        ORDER BY cnt DESC
      ), '[]'::jsonb
    ) as top_pages
    FROM (
      SELECT page_path, COUNT(*) as cnt
      FROM today_data
      GROUP BY page_path
      ORDER BY cnt DESC
      LIMIT 5
    ) p
  ),
  locations AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object('country', country, 'count', cnt)
        ORDER BY cnt DESC
      ), '[]'::jsonb
    ) as countries
    FROM (
      SELECT country, COUNT(DISTINCT visitor_id) as cnt
      FROM today_data
      WHERE country IS NOT NULL
      GROUP BY country
      ORDER BY cnt DESC
      LIMIT 5
    ) c
  ),
  device_stats AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object('device', device_type, 'count', cnt)
        ORDER BY cnt DESC
      ), '[]'::jsonb
    ) as devices
    FROM (
      SELECT device_type, COUNT(DISTINCT visitor_id) as cnt
      FROM today_data
      WHERE device_type IS NOT NULL
      GROUP BY device_type
    ) d
  ),
  recent AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'visitor_id', LEFT(visitor_id, 8) || '...',
          'page_path', page_path,
          'country', country,
          'device_type', device_type,
          'browser', browser,
          'created_at', created_at
        )
        ORDER BY created_at DESC
      ), '[]'::jsonb
    ) as recent_visitors
    FROM (
      SELECT DISTINCT ON (visitor_id) *
      FROM today_data
      ORDER BY visitor_id, created_at DESC
      LIMIT 10
    ) r
  )
  SELECT 
    COALESCE(s.visitors, 0),
    COALESCE(s.views, 0),
    p.top_pages,
    l.countries,
    d.devices,
    r.recent_visitors
  FROM stats s
  CROSS JOIN pages p
  CROSS JOIN locations l
  CROSS JOIN device_stats d
  CROSS JOIN recent r;
END;
$$;

-- ==========================================
-- FONCTION DE NETTOYAGE (GDPR)
-- ==========================================

CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Supprimer les données de plus de 30 jours
  DELETE FROM page_views 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  RAISE NOTICE 'Nettoyage terminé - données de plus de 30 jours supprimées';
END;
$$;

-- ==========================================
-- CONFIRMATION
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Système d''analytics simple créé avec succès !';
  RAISE NOTICE '📊 Table: page_views';
  RAISE NOTICE '🔧 Fonction: get_simple_analytics()';
  RAISE NOTICE '🧹 Fonction: cleanup_old_analytics()';
  RAISE NOTICE '🔒 RLS activé avec politiques publiques';
  RAISE NOTICE '⚡ Index créés pour les performances';
END $$;