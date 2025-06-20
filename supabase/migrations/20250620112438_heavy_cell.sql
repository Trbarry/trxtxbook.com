/*
  # Enhanced Analytics System
  
  1. Améliorations
    - Ajout d'un identifiant unique pour chaque visiteur
    - Stockage des 6 derniers chiffres de l'IP (pour détecter les doublons)
    - Géolocalisation plus précise (ville, région)
    - Détection améliorée des bots
    - Fingerprinting basique du navigateur
    - Temps de session et pages par session
*/

-- Ajouter de nouvelles colonnes à page_views
ALTER TABLE page_views 
ADD COLUMN IF NOT EXISTS visitor_id text,
ADD COLUMN IF NOT EXISTS ip_suffix text, -- 6 derniers chiffres de l'IP
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS screen_resolution text,
ADD COLUMN IF NOT EXISTS language text,
ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false;

-- Ajouter de nouvelles colonnes à visitor_sessions
ALTER TABLE visitor_sessions 
ADD COLUMN IF NOT EXISTS visitor_id text,
ADD COLUMN IF NOT EXISTS ip_suffix text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS screen_resolution text,
ADD COLUMN IF NOT EXISTS language text,
ADD COLUMN IF NOT EXISTS session_duration integer DEFAULT 0, -- en secondes
ADD COLUMN IF NOT EXISTS bounce_rate boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_bot boolean DEFAULT false;

-- Table pour tracker les visiteurs uniques sur une période plus longue
CREATE TABLE IF NOT EXISTS unique_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text UNIQUE NOT NULL,
  first_visit timestamptz NOT NULL DEFAULT now(),
  last_visit timestamptz NOT NULL DEFAULT now(),
  total_sessions integer NOT NULL DEFAULT 1,
  total_page_views integer NOT NULL DEFAULT 1,
  ip_suffix text,
  countries text[] DEFAULT '{}', -- Liste des pays visités
  cities text[] DEFAULT '{}', -- Liste des villes
  devices text[] DEFAULT '{}', -- Liste des appareils utilisés
  browsers text[] DEFAULT '{}', -- Liste des navigateurs
  is_returning boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS sur la nouvelle table
ALTER TABLE unique_visitors ENABLE ROW LEVEL SECURITY;

-- Politique pour la nouvelle table
CREATE POLICY "Public can manage unique visitors"
  ON unique_visitors
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Fonction pour détecter si c'est un bot
CREATE OR REPLACE FUNCTION is_bot_user_agent(user_agent text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  IF user_agent IS NULL THEN
    RETURN true;
  END IF;
  
  RETURN user_agent ILIKE ANY(ARRAY[
    '%bot%', '%crawler%', '%spider%', '%scrape%',
    '%lighthouse%', '%pagespeed%', '%gtmetrix%',
    '%pingdom%', '%uptime%', '%monitor%', '%check%',
    '%headless%', '%phantom%', '%selenium%', '%webdriver%',
    '%puppeteer%', '%playwright%', '%curl%', '%wget%',
    '%python%', '%java%', '%go-http%', '%node%'
  ]);
END;
$$;

-- Fonction pour extraire les 6 derniers chiffres d'une IP
CREATE OR REPLACE FUNCTION extract_ip_suffix(ip_address text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  -- Extraire seulement les chiffres et prendre les 6 derniers
  RETURN RIGHT(REGEXP_REPLACE(ip_address, '[^0-9]', '', 'g'), 6);
END;
$$;

-- Fonction améliorée pour les analytics en temps réel
CREATE OR REPLACE FUNCTION get_enhanced_analytics()
RETURNS TABLE(
  unique_visitors bigint,
  total_page_views bigint,
  unique_visitors_today bigint,
  page_views_today bigint,
  top_pages jsonb,
  countries jsonb,
  cities jsonb,
  devices jsonb,
  browsers jsonb,
  recent_visitors jsonb,
  visitor_flow jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH today_stats AS (
    SELECT 
      COUNT(DISTINCT pv.visitor_id) as visitors_today,
      COUNT(*) as views_today
    FROM page_views pv
    WHERE DATE(pv.created_at) = CURRENT_DATE
      AND NOT COALESCE(pv.is_bot, false)
  ),
  all_time_stats AS (
    SELECT 
      COUNT(DISTINCT pv.visitor_id) as total_visitors,
      COUNT(*) as total_views
    FROM page_views pv
    WHERE NOT COALESCE(pv.is_bot, false)
  ),
  page_stats AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'path', page_path, 
          'count', page_count,
          'unique_visitors', unique_count
        )
        ORDER BY page_count DESC
      ) as top_pages
    FROM (
      SELECT 
        page_path, 
        COUNT(*) as page_count,
        COUNT(DISTINCT visitor_id) as unique_count
      FROM page_views
      WHERE DATE(created_at) = CURRENT_DATE
        AND NOT COALESCE(is_bot, false)
        AND page_path IS NOT NULL
      GROUP BY page_path
      LIMIT 10
    ) p
  ),
  location_stats AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object('country', country, 'count', country_count)
        ORDER BY country_count DESC
      ) as countries,
      jsonb_agg(
        jsonb_build_object('city', city, 'count', city_count)
        ORDER BY city_count DESC
      ) as cities
    FROM (
      SELECT 
        country, 
        COUNT(DISTINCT visitor_id) as country_count,
        city,
        COUNT(DISTINCT visitor_id) as city_count
      FROM page_views
      WHERE DATE(created_at) = CURRENT_DATE
        AND NOT COALESCE(is_bot, false)
        AND country IS NOT NULL
      GROUP BY country, city
      LIMIT 10
    ) l
  ),
  device_stats AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object('device', device_type, 'count', device_count)
        ORDER BY device_count DESC
      ) as devices
    FROM (
      SELECT 
        device_type, 
        COUNT(DISTINCT visitor_id) as device_count
      FROM page_views
      WHERE DATE(created_at) = CURRENT_DATE
        AND NOT COALESCE(is_bot, false)
        AND device_type IS NOT NULL
      GROUP BY device_type
    ) d
  ),
  browser_stats AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object('browser', browser, 'count', browser_count)
        ORDER BY browser_count DESC
      ) as browsers
    FROM (
      SELECT 
        CASE 
          WHEN user_agent ILIKE '%chrome%' AND user_agent NOT ILIKE '%edge%' THEN 'Chrome'
          WHEN user_agent ILIKE '%firefox%' THEN 'Firefox'
          WHEN user_agent ILIKE '%safari%' AND user_agent NOT ILIKE '%chrome%' THEN 'Safari'
          WHEN user_agent ILIKE '%edge%' THEN 'Edge'
          WHEN user_agent ILIKE '%opera%' THEN 'Opera'
          ELSE 'Autre'
        END as browser,
        COUNT(DISTINCT visitor_id) as browser_count
      FROM page_views
      WHERE DATE(created_at) = CURRENT_DATE
        AND NOT COALESCE(is_bot, false)
        AND user_agent IS NOT NULL
      GROUP BY browser
    ) b
  ),
  recent_activity AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'visitor_id', SUBSTRING(visitor_id, 1, 8) || '...',
          'page_path', page_path,
          'country', country,
          'city', city,
          'device_type', device_type,
          'ip_suffix', ip_suffix,
          'created_at', created_at,
          'is_returning', (
            SELECT COUNT(*) > 1 
            FROM page_views pv2 
            WHERE pv2.visitor_id = pv.visitor_id 
              AND DATE(pv2.created_at) < DATE(pv.created_at)
          )
        )
        ORDER BY created_at DESC
      ) as recent_visitors
    FROM (
      SELECT DISTINCT ON (visitor_id) *
      FROM page_views pv
      WHERE DATE(created_at) = CURRENT_DATE
        AND NOT COALESCE(is_bot, false)
      ORDER BY visitor_id, created_at DESC
      LIMIT 20
    ) pv
  ),
  visitor_flow_stats AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'hour', hour_of_day,
          'visitors', visitor_count,
          'page_views', view_count
        )
        ORDER BY hour_of_day
      ) as visitor_flow
    FROM (
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour_of_day,
        COUNT(DISTINCT visitor_id) as visitor_count,
        COUNT(*) as view_count
      FROM page_views
      WHERE DATE(created_at) = CURRENT_DATE
        AND NOT COALESCE(is_bot, false)
      GROUP BY EXTRACT(HOUR FROM created_at)
    ) vf
  )
  SELECT 
    COALESCE(ats.total_visitors, 0),
    COALESCE(ats.total_views, 0),
    COALESCE(ts.visitors_today, 0),
    COALESCE(ts.views_today, 0),
    COALESCE(ps.top_pages, '[]'::jsonb),
    COALESCE(ls.countries, '[]'::jsonb),
    COALESCE(ls.cities, '[]'::jsonb),
    COALESCE(ds.devices, '[]'::jsonb),
    COALESCE(bs.browsers, '[]'::jsonb),
    COALESCE(ra.recent_visitors, '[]'::jsonb),
    COALESCE(vfs.visitor_flow, '[]'::jsonb)
  FROM today_stats ts
  CROSS JOIN all_time_stats ats
  CROSS JOIN page_stats ps
  CROSS JOIN location_stats ls
  CROSS JOIN device_stats ds
  CROSS JOIN browser_stats bs
  CROSS JOIN recent_activity ra
  CROSS JOIN visitor_flow_stats vfs;
END;
$$;

-- Fonction pour nettoyer les anciennes données (GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Supprimer les données de plus de 90 jours
  DELETE FROM page_views 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  DELETE FROM visitor_sessions 
  WHERE first_visit < NOW() - INTERVAL '90 days';
  
  -- Anonymiser les données de plus de 30 jours
  UPDATE page_views 
  SET 
    ip_suffix = 'XXXX',
    user_agent = 'ANONYMIZED'
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND ip_suffix != 'XXXX';
    
  RAISE NOTICE 'Analytics data cleanup completed';
END;
$$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_is_bot ON page_views(is_bot);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_id ON visitor_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_unique_visitors_visitor_id ON unique_visitors(visitor_id);

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE 'Enhanced analytics system setup completed!';
  RAISE NOTICE 'New features:';
  RAISE NOTICE '- Visitor IDs for duplicate detection';
  RAISE NOTICE '- IP suffix tracking (last 6 digits)';
  RAISE NOTICE '- Enhanced geolocation (city, region)';
  RAISE NOTICE '- Browser detection';
  RAISE NOTICE '- Bot detection';
  RAISE NOTICE '- Visitor flow analysis';
  RAISE NOTICE '- GDPR compliance with data cleanup';
END $$;