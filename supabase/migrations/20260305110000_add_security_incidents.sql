-- Migration to add security_incidents table for honeypot and fuzzing detection

CREATE TABLE IF NOT EXISTS security_incidents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id text NOT NULL,
    incident_type text NOT NULL, -- 'honeypot', 'fuzzing_attempt', 'unauthorized_access'
    path text NOT NULL,
    payload text,
    user_agent text,
    country text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- Allow public to insert incidents (to capture attacks)
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
