/*
  # Système Analytics Simple et Efficace
  
  1. Tables essentielles
    - `page_views` - Vues de pages avec infos basiques
    - `daily_stats` - Statistiques quotidiennes agrégées
  
  2. Fonctionnalités clés
    - Tracking des pages visitées
    - Détection basique des doublons
    - Géolocalisation simple
    - Protection anti-bots
    - Statistiques quotidiennes
*/

-- Nettoyer les anciennes tables analytics
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS visitor_sessions CASCADE;
DROP TABLE IF EXISTS analytics_summary CASCADE;
DROP TABLE IF EXISTS unique_visitors CASCADE;

-- Table principale pour les vues de pages
CREATE TABLE page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  visitor_id text NOT NULL, -- ID unique par visiteur
  country text,
  city text,
  device_type text, -- mobile, tablet, desktop
  browser text, -- Chrome, Firefox, Safari, etc.
  is_bot boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table pour les statistiques quotidiennes
CREATE TABLE daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  unique_visitors integer DEFAULT 0,
  total_page_views integer DEFAULT 0,
  top_pages jsonb DEFAULT '[]',
  countries jsonb DEFAULT '[]',
  devices jsonb DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Politiques simples
CREATE POLICY "Public peut insérer des vues"
  ON page_views FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public peut lire les stats"
  ON daily_stats FOR SELECT TO public USING (true);

CREATE POLICY "Admins peuvent tout faire"
  ON page_views FOR ALL TO authenticated USING (true);

CREATE POLICY "Admins peuvent gérer les stats"
  ON daily_stats FOR ALL TO authenticated USING (true);

-- Fonction pour détecter les bots
CREATE OR REPLACE FUNCTION is_bot(user_agent text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  IF user_agent IS NULL THEN RETURN true; END IF;
  
  RETURN user_agent ILIKE ANY(ARRAY[
    '%bot%', '%crawler%', '%spider%', '%scrape%',
    '%lighthouse%', '%headless%', '%phantom%'
  ]);
END;
$$;

-- Fonction pour obtenir les analytics du jour
CREATE OR REPLACE FUNCTION get_today_analytics()
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
  WITH stats AS (
    SELECT 
      COUNT(DISTINCT visitor_id) as visitors,
      COUNT(*) as views
    FROM page_views 
    WHERE DATE(created_at) = CURRENT_DATE 
      AND NOT is_bot
  ),
  pages AS (
    SELECT jsonb_agg(
      jsonb_build_object('path', page_path, 'count', cnt)
      ORDER BY cnt DESC
    ) as top_pages
    FROM (
      SELECT page_path, COUNT(*) as cnt
      FROM page_views 
      WHERE DATE(created_at) = CURRENT_DATE AND NOT is_bot
      GROUP BY page_path
      ORDER BY cnt DESC
      LIMIT 5
    ) p
  ),
  locations AS (
    SELECT jsonb_agg(
      jsonb_build_object('country', country, 'count', cnt)
      ORDER BY cnt DESC
    ) as countries
    FROM (
      SELECT country, COUNT(DISTINCT visitor_id) as cnt
      FROM page_views 
      WHERE DATE(created_at) = CURRENT_DATE 
        AND NOT is_bot 
        AND country IS NOT NULL
      GROUP BY country
      ORDER BY cnt DESC
      LIMIT 5
    ) c
  ),
  device_stats AS (
    SELECT jsonb_agg(
      jsonb_build_object('device', device_type, 'count', cnt)
      ORDER BY cnt DESC
    ) as devices
    FROM (
      SELECT device_type, COUNT(DISTINCT visitor_id) as cnt
      FROM page_views 
      WHERE DATE(created_at) = CURRENT_DATE 
        AND NOT is_bot 
        AND device_type IS NOT NULL
      GROUP BY device_type
    ) d
  ),
  recent AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'visitor_id', LEFT(visitor_id, 8) || '...',
        'page_path', page_path,
        'country', country,
        'device_type', device_type,
        'browser', browser,
        'created_at', created_at
      )
      ORDER BY created_at DESC
    ) as recent_visitors
    FROM (
      SELECT DISTINCT ON (visitor_id) *
      FROM page_views 
      WHERE DATE(created_at) = CURRENT_DATE AND NOT is_bot
      ORDER BY visitor_id, created_at DESC
      LIMIT 10
    ) r
  )
  SELECT 
    COALESCE(s.visitors, 0),
    COALESCE(s.views, 0),
    COALESCE(p.top_pages, '[]'::jsonb),
    COALESCE(l.countries, '[]'::jsonb),
    COALESCE(d.devices, '[]'::jsonb),
    COALESCE(r.recent_visitors, '[]'::jsonb)
  FROM stats s
  CROSS JOIN pages p
  CROSS JOIN locations l
  CROSS JOIN device_stats d
  CROSS JOIN recent r;
END;
$$;

-- Index pour les performances
CREATE INDEX idx_page_views_date ON page_views(created_at);
CREATE INDEX idx_page_views_visitor ON page_views(visitor_id);
CREATE INDEX idx_page_views_bot ON page_views(is_bot);

-- Insérer les stats du jour actuel
INSERT INTO daily_stats (date) VALUES (CURRENT_DATE) ON CONFLICT DO NOTHING;