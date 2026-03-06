-- Migration to reset and properly create security_incidents table

DROP TABLE IF EXISTS security_incidents CASCADE;

CREATE TABLE security_incidents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id text NOT NULL,
    incident_type text NOT NULL, -- 'honeypot_hit', 'fuzzing_attempt', 'unauthorized_access'
    path text NOT NULL,
    payload jsonb, -- Changed to jsonb for better flexibility
    user_agent text,
    country text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- Allow public to insert incidents
CREATE POLICY "Public can insert security incidents"
    ON security_incidents
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Only admin can view incidents
CREATE POLICY "Admin can view security incidents"
    ON security_incidents
    FOR SELECT
    TO authenticated
    USING (auth.email() = 'tr.barrypro@gmail.com');

-- Index for performance
CREATE INDEX idx_security_incidents_type ON security_incidents(incident_type);
CREATE INDEX idx_security_incidents_visitor ON security_incidents(visitor_id);
CREATE INDEX idx_security_incidents_date ON security_incidents(created_at);
