import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('--- TABLES INFO ---');
  
  // Requête pour lister les tables du schéma public
  const { data: tables, error: tableError } = await supabase
    .rpc('get_table_counts'); // On va essayer de voir si cette fonction existe ou en utiliser une générique

  if (tableError) {
    // Si la fonction n'existe pas, on tente via SQL direct (via une astuce)
    // Mais le plus simple est de lister les tables connues et compter
    const knownTables = ['writeups', 'wiki_pages', 'wiki_votes', 'page_views', 'cv_files'];
    
    for (const table of knownTables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`[${table}] Erreur ou inaccessible`);
      } else {
        console.log(`[${table}] ${count} lignes`);
      }
    }
  } else {
    console.table(tables);
  }
}

listTables();
