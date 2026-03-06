const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://srmwnujqhxaopnffesgl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybXdudWpxaHhhb3BuZmZlc2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4OTg5MjAsImV4cCI6MjA1NTQ3NDkyMH0.0oxzfA7twrPKlBzfDTL2ksyl9aV0mdImLrBCHYlr8Fs"; // Note: Use Service Role Key from .env if possible

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const WRITEUPS_DIR = path.join(process.cwd(), '.write-up');
const BUCKET_NAME = 'writeup-images';

const DIFFICULTY_MAPPING = {
  'HTB_Access': { difficulty: 'Easy', points: 20 },
  'HTB_Administrator': { difficulty: 'Medium', points: 30 },
  'HTB_Alert': { difficulty: 'Easy', points: 20 },
  'HTB_Artificial': { difficulty: 'Medium', points: 30 },
  'HTB_Backfire': { difficulty: 'Medium', points: 30 },
  'HTB_Beep': { difficulty: 'Easy', points: 20 },
  'HTB_Blue': { difficulty: 'Easy', points: 20 },
  'HTB_Cap': { difficulty: 'Easy', points: 20 },
  'HTB_Certified': { difficulty: 'Medium', points: 30 },
  'HTB_Checker': { difficulty: 'Medium', points: 30 },
  'HTB_Chemistry': { difficulty: 'Easy', points: 20 },
  'HTB_Cicada': { difficulty: 'Medium', points: 30 },
  'HTB_Code': { difficulty: 'Medium', points: 30 },
  'HTB_Cypher': { difficulty: 'Medium', points: 30 },
  'HTB_Editor': { difficulty: 'Easy', points: 20 },
  'HTB_EscapeTwo': { difficulty: 'Medium', points: 30 },
  'HTB_Heal': { difficulty: 'Medium', points: 30 },
  'HTB_Heist': { difficulty: 'Easy', points: 20 },
  'HTB_Help': { difficulty: 'Easy', points: 20 },
  'HTB_Instant': { difficulty: 'Medium', points: 30 },
  'HTB_Lame': { difficulty: 'Easy', points: 20 },
  'HTB_Legacy': { difficulty: 'Easy', points: 20 },
  'HTB_LinkVortex': { difficulty: 'Easy', points: 20 },
  'HTB_Monteverde': { difficulty: 'Medium', points: 30 },
  'HTB_Remote': { difficulty: 'Easy', points: 20 },
  'HTB_TheFrizz': { difficulty: 'Hard', points: 40 },
  'HTB_Titanic': { difficulty: 'Easy', points: 20 },
  'HTB_Vintage': { difficulty: 'Easy', points: 20 }
};

async function uploadImage(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error(`Error uploading ${fileName}:`, error.message);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return publicUrl;
}

function extractMetadata(content, folderName) {
  const title = folderName.replace('HTB_', 'HackTheBox: ');
  const slug = folderName.toLowerCase().replace('_', '-');
  
  // Use mapping if available, else try to find or use defaults
  const mapped = DIFFICULTY_MAPPING[folderName] || {};
  let difficulty = mapped.difficulty || 'Medium';
  let points = mapped.points || 30;
  
  // Try to find OS in content
  let os = 'Windows';
  if (content.match(/OS:?\s*Linux/i) || content.match(/machine Linux/i)) os = 'Linux';
  else if (content.match(/OS:?\s*Windows/i) || content.match(/machine Windows/i)) os = 'Windows';
  else if (content.match(/CentOS|Ubuntu|Debian|Linux/i)) os = 'Linux';

  // Description: clean up content and take first part
  let description = content
    .replace(/!\[.*\]\(.*\)/g, '') // remove images
    .replace(/^#+ .*/gm, '') // remove headers
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim()
    .substring(0, 250) + '...';

  // Tags
  const tags = [];
  if (content.match(/Active Directory/i)) tags.push('Active Directory');
  if (content.match(/SMB/i)) tags.push('SMB');
  if (content.match(/Web|HTTP|Apache|Nginx/i)) tags.push('Web');
  if (content.match(/Kerberos/i)) tags.push('Kerberos');
  if (content.match(/SQL/i)) tags.push('SQL');
  if (content.match(/Privilege Escalation|Escalade de Privilèges/i)) tags.push('Privilege Escalation');
  if (tags.length === 0) tags.push('HackTheBox');

  return { title, slug, difficulty, points, os, description, tags };
}

async function processWriteups() {
  const folders = fs.readdirSync(WRITEUPS_DIR).filter(f => fs.statSync(path.join(WRITEUPS_DIR, f)).isDirectory());
  
  let sql = `-- Migration to add writeups from .write-up directory\n-- Generated on ${new Date().toISOString()}\n\n`;

  for (const folder of folders) {
    console.log(`Processing ${folder}...`);
    const folderPath = path.join(WRITEUPS_DIR, folder);
    const mdPath = path.join(folderPath, 'writeup.md');
    const imagePath = path.join(folderPath, 'cover.png');

    if (!fs.existsSync(mdPath)) continue;

    let content = fs.readFileSync(mdPath, 'utf8');
    const metadata = extractMetadata(content, folder);

    // Upload image if exists
    let imageUrl = null;
    if (fs.existsSync(imagePath)) {
      const fileName = `${metadata.slug}-cover.png`;
      imageUrl = await uploadImage(imagePath, fileName);
    }

    // Prepare content with Kali-style header
    const kaliHeader = `<div class="kali-header">
  <div class="difficulty">Difficulté: ${metadata.difficulty}</div>
  <div class="points">Points: ${metadata.points}</div>
  <div class="os">OS: ${metadata.os}</div>
</div>\n\n`;

    // Remove the initial image link
    let finalContent = content.replace(/!\[.*\]\(.*\)/, '').trim();
    finalContent = kaliHeader + finalContent;

    const escapedContent = finalContent.replace(/'/g, "''");
    const escapedTitle = metadata.title.replace(/'/g, "''");
    const escapedDescription = metadata.description.replace(/'/g, "''");
    const tagsArray = `ARRAY[${Array.from(new Set(metadata.tags)).map(t => `'${t}'`).join(', ')}]`;
    const imagesArray = imageUrl ? `ARRAY['${imageUrl}']` : 'NULL';
    const coverImageUrl = imageUrl ? `'${imageUrl}'` : 'NULL';
    // is_active on HTB implies true if published
    const isActive = 'true';

    sql += `-- Writeup: ${metadata.title}\n`;
    sql += `INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, images, cover_image_url, is_active, created_at)\n`;
    sql += `VALUES (\n`;
    sql += `  '${escapedTitle}',\n`;
    sql += `  '${metadata.slug}',\n`;
    sql += `  '${escapedContent}',\n`;
    sql += `  'HackTheBox',\n`;
    sql += `  '${metadata.difficulty}',\n`;
    sql += `  ${metadata.points},\n`;
    sql += `  ${tagsArray},\n`;
    sql += `  '${escapedDescription}',\n`;
    sql += `  true,\n`;
    sql += `  ${imagesArray},\n`;
    sql += `  ${coverImageUrl},\n`;
    sql += `  ${isActive},\n`;
    sql += `  now()\n`;
    sql += `) ON CONFLICT (slug) DO UPDATE SET\n`;
    sql += `  title = EXCLUDED.title,\n`;
    sql += `  content = EXCLUDED.content,\n`;
    sql += `  platform = EXCLUDED.platform,\n`;
    sql += `  difficulty = EXCLUDED.difficulty,\n`;
    sql += `  points = EXCLUDED.points,\n`;
    sql += `  tags = EXCLUDED.tags,\n`;
    sql += `  images = COALESCE(EXCLUDED.images, writeups.images),\n`;
    sql += `  cover_image_url = COALESCE(EXCLUDED.cover_image_url, writeups.cover_image_url),\n`;
    sql += `  is_active = EXCLUDED.is_active,\n`;
    sql += `  description = EXCLUDED.description;\n\n`;
  }

  fs.writeFileSync('supabase/migrations/20260303131000_add_writeups.sql', sql);
  console.log('SQL generated in supabase/migrations/20260303131000_add_writeups.sql');
}

processWriteups().catch(console.error);
