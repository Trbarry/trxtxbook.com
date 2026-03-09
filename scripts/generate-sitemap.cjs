/**
 * generate-sitemap.cjs
 * Exécuté avant vite build — génère public/sitemap.xml depuis Supabase.
 * Couvre : pages statiques + wiki_pages + articles + writeups.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'https://trxtxbook.com';
const OUTPUT = path.join(__dirname, '..', 'public', 'sitemap.xml');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://srmwnujqhxaopnffesgl.supabase.co';
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybXdudWpxaHhhb3BuZmZlc2dsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTg5ODkyMCwiZXhwIjoyMDU1NDc0OTIwfQ.RLd2mrctE3EDmXh4mGzUtofFv3yOcJmqwEwlXMgBEsI';

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Pages statiques ────────────────────────────────────────────────────────────
const STATIC = [
  { path: '/',               priority: 1.0, changefreq: 'weekly'  },
  { path: '/writeups',       priority: 0.9, changefreq: 'weekly'  },
  { path: '/projects',       priority: 0.9, changefreq: 'monthly' },
  { path: '/certifications', priority: 0.8, changefreq: 'monthly' },
  { path: '/articles',       priority: 0.8, changefreq: 'weekly'  },
  { path: '/wiki',           priority: 0.8, changefreq: 'daily'   },
];

// Articles codés en dur dans le codebase (pas en DB)
const STATIC_ARTICLES = [
  '/articles/cpts-journey',
  '/articles/linux-mint-revival',
  '/articles/exegol-docker',
  '/articles/ad-network',
  '/articles/smb-server',
  '/articles/steam-deck-kali',
  '/articles/homelab-infrastructure-deep-dive',
];

const today = new Date().toISOString().split('T')[0];

function toDate(iso) {
  if (!iso) return today;
  return iso.split('T')[0];
}

function url({ loc, lastmod = today, changefreq = 'monthly', priority = 0.6 }) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

function xml(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join('\n')}
</urlset>`;
}

async function fetchTable(table, select, filter = {}) {
  let q = supabase.from(table).select(select);
  for (const [col, val] of Object.entries(filter)) q = q.eq(col, val);
  const { data, error } = await q;
  if (error) {
    console.warn(`[sitemap] Warning: could not fetch ${table}:`, error.message);
    return [];
  }
  return data || [];
}

async function main() {
  console.log('[sitemap] Generating sitemap...');
  const entries = [];

  // Pages statiques
  for (const s of STATIC) {
    entries.push(url({ loc: `${BASE_URL}${s.path}`, changefreq: s.changefreq, priority: s.priority }));
  }

  // Articles statiques
  for (const a of STATIC_ARTICLES) {
    entries.push(url({ loc: `${BASE_URL}${a}`, priority: 0.8 }));
  }

  // Wiki pages (dynamiques)
  const wikiPages = await fetchTable('wiki_pages', 'slug, updated_at', { published: true });
  for (const p of wikiPages) {
    entries.push(url({ loc: `${BASE_URL}/wiki/${p.slug}`, lastmod: toDate(p.updated_at), priority: 0.7 }));
  }
  console.log(`[sitemap]   ${wikiPages.length} wiki pages`);

  // Articles DB (dynamiques)
  const articles = await fetchTable('articles', 'slug, updated_at', { published: true });
  for (const a of articles) {
    entries.push(url({ loc: `${BASE_URL}/articles/${a.slug}`, lastmod: toDate(a.updated_at), priority: 0.8 }));
  }
  console.log(`[sitemap]   ${articles.length} articles (DB)`);

  // Writeups (dynamiques)
  const writeups = await fetchTable('writeups', 'slug, created_at', { published: true });
  for (const w of writeups) {
    entries.push(url({ loc: `${BASE_URL}/writeups/${w.slug}`, lastmod: toDate(w.created_at), priority: 0.7 }));
  }
  console.log(`[sitemap]   ${writeups.length} writeups`);

  fs.writeFileSync(OUTPUT, xml(entries), 'utf8');
  console.log(`[sitemap] ✓ Written to public/sitemap.xml (${entries.length} URLs)`);
}

main().catch(err => {
  console.error('[sitemap] Fatal error:', err);
  process.exit(0); // exit 0 pour ne pas bloquer le build
});
