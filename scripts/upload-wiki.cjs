const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://srmwnujqhxaopnffesgl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybXdudWpxaHhhb3BuZmZlc2dsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTg5ODkyMCwiZXhwIjoyMDU1NDc0OTIwfQ.RLd2mrctE3EDmXh4mGzUtofFv3yOcJmqwEwlXMgBEsI";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'writeup-images';

function generateAnchor(text) {
  return text.toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uploadImage(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(`wiki/${fileName}`, fileBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error(`Error uploading ${fileName}:`, error.message);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(`wiki/${fileName}`);

  return publicUrl;
}

async function integrateWiki(dirPath, title, slug, category, tags) {
  const mdFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
  if (mdFiles.length === 0) {
    console.error('No .md file found in directory');
    return;
  }

  const mdPath = path.join(dirPath, mdFiles[0]);
  let content = fs.readFileSync(mdPath, 'utf8');

  console.log(`Processing ${mdFiles[0]}...`);

  // 1. Upload images and replace links
  const imageMatches = content.match(/!\[(.*?)\]\((.*?\.png)\)/g);
  if (imageMatches) {
    for (const match of imageMatches) {
      const parts = match.match(/!\[(.*?)\]\((.*?\.png)\)/);
      const altText = parts[1];
      const imageFileName = parts[2];
      const imagePath = path.join(dirPath, imageFileName);

      if (fs.existsSync(imagePath)) {
        console.log(`Uploading ${imageFileName}...`);
        const publicUrl = await uploadImage(imagePath, imageFileName);
        if (publicUrl) {
          content = content.replace(match, `![${altText}](${publicUrl})`);
        }
      }
    }
  }

  // 2. Add Beautiful TOC
  // Remove existing TOC if present
  content = content.replace(/^## Sommaire[\s\S]*?## PARTIE 1/, '## PARTIE 1');
  // Handle case where there is no PARTIE 1 but already a TOC
  content = content.replace(/^> \[!info\] Table des Matières[\s\S]*?---\n\n/, '');

  const lines = content.split('\n');
  const tocEntries = [];
  lines.forEach(line => {
    const match = line.trim().match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const hText = match[2].replace(/\*/g, '').trim();
      const anchor = generateAnchor(hText);
      
      if (level === 2) {
          tocEntries.push(`\n**${hText}**`);
      } else {
          tocEntries.push(`  * [${hText}](#${anchor})`);
      }
    }
  });

  if (tocEntries.length > 0) {
    const tocMarkdown = `> [!info] Table des Matières\n>\n${tocEntries.map(e => `> ${e}`).join('\n')}\n>\n\n---\n\n`;
    content = tocMarkdown + content;
  }

  // 3. Update Supabase
  console.log(`Updating Supabase for slug: ${slug}...`);
  const { error: upsertError } = await supabase
    .from('wiki_pages')
    .upsert({
      title,
      slug,
      category,
      content,
      tags: tags || [],
      published: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });

  if (upsertError) {
    console.error('Error upserting wiki page:', upsertError);
    return;
  }

  console.log('Wiki page integrated successfully!');

  // 4. Generate Migration File
  const migrationFileName = `20260305_${slug.replace(/-/g, '_')}.sql`;
  const migrationPath = path.join(process.cwd(), 'supabase/migrations', migrationFileName);
  const escapedContent = content.replace(/'/g, "''");
  const tagsArray = tags ? `ARRAY[${tags.map(t => `'${t}'`).join(', ')}]` : 'ARRAY[]::text[]';
  
  const sql = `-- Migration to add/update Wiki Page: ${title}
INSERT INTO wiki_pages (title, slug, category, content, tags, published, updated_at)
VALUES (
  '${title.replace(/'/g, "''")}',
  '${slug}',
  '${category.replace(/'/g, "''")}',
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

  fs.writeFileSync(migrationPath, sql);
  console.log(`Migration generated: ${migrationPath}`);
}

// Example usage: node scripts/upload-wiki.cjs ".doc/kerberos_..." "Title" "slug" "category" "tag1,tag2"
const [,, dir, title, slug, category, tagsStr] = process.argv;

if (!dir || !title || !slug || !category) {
  console.log('Usage: node scripts/upload-wiki.cjs <directory> <title> <slug> <category> [tags]');
  process.exit(1);
}

const tags = tagsStr ? tagsStr.split(',') : [];

integrateWiki(path.resolve(dir), title, slug, category, tags).catch(console.error);
