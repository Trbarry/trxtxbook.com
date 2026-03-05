const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://srmwnujqhxaopnffesgl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybXdudWpxaHhhb3BuZmZlc2dsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTg5ODkyMCwiZXhwIjoyMDU1NDc0OTIwfQ.RLd2mrctE3EDmXh4mGzUtofFv3yOcJmqwEwlXMgBEsI";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const slug = "ntlm-relay-attack-guide";

async function makeBeautifulToc() {
  const { data: page, error: fetchError } = await supabase
    .from('wiki_pages')
    .select('content, title, category, tags')
    .eq('slug', slug)
    .single();

  if (fetchError || !page) {
    console.error('Error fetching page:', fetchError);
    return;
  }

  let content = page.content;
  // Remove existing TOC if present
  content = content.replace(/> \[!\w+\] Sommaire[\s\S]*?---\n\n/, '');

  // Generate TOC
  const lines = content.split('\n');
  const tocEntries = [];
  lines.forEach(line => {
    const match = line.trim().match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2].replace(/\*/g, '').trim();
      const anchor = title.toLowerCase().replace(/[^\w]+/g, '-');
      
      if (level === 2) {
          tocEntries.push(`\n**${title}**`);
      } else {
          tocEntries.push(`  * [${title}](#${anchor})`);
      }
    }
  });

  if (tocEntries.length === 0) {
      console.log('No headings found for TOC');
      return;
  }

  const tocMarkdown = `> [!info] Table des Matières\n>\n${tocEntries.map(e => `> ${e}`).join('\n')}\n>\n\n---\n\n`;
  content = tocMarkdown + content;

  const { error: updateError } = await supabase
    .from('wiki_pages')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('slug', slug);

  if (updateError) {
    console.error('Error updating page with TOC:', updateError);
  } else {
    console.log('Beautiful TOC added successfully!');
    
    const sqlPath = path.join(process.cwd(), 'supabase/migrations/20260304150000_add_ntlm_relay_wiki.sql');
    const escapedContent = content.replace(/'/g, "''");
    const tagsArray = `ARRAY[${page.tags.map(t => `'${t}'`).join(', ')}]`;
    const newSql = `-- Migration to add NTLM Relay Wiki Page (with WebP images and Beautiful TOC)
INSERT INTO wiki_pages (title, slug, category, content, tags, published, updated_at)
VALUES (
  '${page.title.replace(/'/g, "''")}',
  '${slug}',
  '${page.category.replace(/'/g, "''")}',
  '${escapedContent}',
  ${tagsArray},
  true,
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  updated_at = now();
`;
    fs.writeFileSync(sqlPath, newSql);
  }
}

makeBeautifulToc().catch(console.error);
