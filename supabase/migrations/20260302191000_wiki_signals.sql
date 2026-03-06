-- Migration to support Wiki signals (likes/votes)

-- Create wiki_pages table if it doesn't exist
CREATE TABLE IF NOT EXISTS wiki_pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    category text NOT NULL,
    content text NOT NULL,
    tags text[] DEFAULT '{}',
    likes integer DEFAULT 0,
    published boolean DEFAULT true,
    updated_at timestamptz DEFAULT now()
);

-- Create wiki_votes table for IP-based rate limiting
CREATE TABLE IF NOT EXISTS wiki_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id uuid REFERENCES wiki_pages(id) ON DELETE CASCADE,
    user_ip text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(page_id, user_ip)
);

-- Create RPC for voting to ensure atomicity and security
CREATE OR REPLACE FUNCTION vote_for_page(target_page_id uuid, target_ip text)
RETURNS void AS $$
BEGIN
    -- Only insert if the vote doesn't already exist for this IP and page
    INSERT INTO wiki_votes (page_id, user_ip)
    VALUES (target_page_id, target_ip);
    
    -- Increment the likes count
    UPDATE wiki_pages
    SET likes = likes + 1
    WHERE id = target_page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_votes ENABLE ROW LEVEL SECURITY;

-- Policies for wiki_pages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view published wiki pages') THEN
        CREATE POLICY "Public can view published wiki pages" ON wiki_pages FOR SELECT TO public USING (published = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view global signal') THEN
        CREATE POLICY "Public can view global signal" ON wiki_pages FOR SELECT TO public 
        USING (id = '00000000-0000-0000-0000-000000000000');
    END IF;
END $$;

-- Policies for wiki_votes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read wiki_votes') THEN
        CREATE POLICY "Public read wiki_votes" ON wiki_votes FOR SELECT TO public USING (true);
    END IF;
END $$;

-- Create the Global Signal row if it doesn't exist
INSERT INTO wiki_pages (id, title, slug, category, content, tags, published)
VALUES ('00000000-0000-0000-0000-000000000000', 'Global Signal', 'global-signal', 'Internal', 'Global wiki signal tracking', '{}', false)
ON CONFLICT (id) DO NOTHING;
