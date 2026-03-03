const fs = require('fs');
const path = require('path');

const writeupsDir = path.join(__dirname, '../.write-up');
const outputMigration = path.join(__dirname, '../supabase/migrations/20260303131000_add_writeups.sql');

const metadataMapping = {
  'HTB_Agile': { title: 'Agile', platform: 'HackTheBox', difficulty: 'Medium', points: 30, tags: ['Flask', 'LFI', 'Werkzeug', 'Sudoedit', 'CVE-2023-22809'] },
  'HTB_Blackfield': { title: 'Blackfield', platform: 'HackTheBox', difficulty: 'Hard', points: 40, tags: ['Active Directory', 'AS-REP Roasting', 'BloodHound', 'SeBackupPrivilege', 'LSASS'] },
  'HTB_CodeTwo': { title: 'CodeTwo', platform: 'HackTheBox', difficulty: 'Hard', points: 40, tags: ['Active Directory', 'LDAP', 'Exchange', 'PowerShell'] },
  'HTB_Delivery': { title: 'Delivery', platform: 'HackTheBox', difficulty: 'Easy', points: 20, tags: ['Mattermost', 'Hashcat', 'Ticket system'] },
  'HTB_Driver': { title: 'Driver', platform: 'HackTheBox', difficulty: 'Easy', points: 20, tags: ['SMB', 'Printer', 'SCF', 'SPOOLER'] },
  'HTB_EarlyAccess': { title: 'EarlyAccess', platform: 'HackTheBox', difficulty: 'Medium', points: 30, tags: ['Web', 'SQLi', 'Enumeration'] },
  'HTB_Hospital': { title: 'Hospital', platform: 'HackTheBox', difficulty: 'Medium', points: 30, tags: ['Web', 'RCE', 'Windows'] },
  'HTB_LogForge': { title: 'LogForge', platform: 'HackTheBox', difficulty: 'Hard', points: 40, tags: ['Log4j', 'Java', 'RCE', 'FTP'] },
  'HTB_Manager': { title: 'Manager', platform: 'HackTheBox', difficulty: 'Easy', points: 20, tags: ['Active Directory', 'MSSQL', 'RID Cycling'] },
  'HTB_MetaTwo': { title: 'MetaTwo', platform: 'HackTheBox', difficulty: 'Easy', points: 20, tags: ['WordPress', 'XXE', 'WPScan'] },
  'HTB_Nocturnal': { title: 'Nocturnal', platform: 'HackTheBox', difficulty: 'Hard', points: 40, tags: ['Active Directory', 'Web', 'RCE'] },
  'HTB_Optimum': { title: 'Optimum', platform: 'HackTheBox', difficulty: 'Easy', points: 20, tags: ['HFS', 'CVE-2014-6287', 'Kernel Exploit'] },
  'HTB_Pressed': { title: 'Pressed', platform: 'HackTheBox', difficulty: 'Easy', points: 20, tags: ['WordPress', 'Backdoor'] },
  'HTB_Sekhmet': { title: 'Sekhmet', platform: 'HackTheBox', difficulty: 'Medium', points: 30, tags: ['Node.js', 'Deserialization', 'ModSecurity', 'WAF Bypass'] },
  'HTB_Shoppy': { title: 'Shoppy', platform: 'HackTheBox', difficulty: 'Easy', points: 20, tags: ['Web', 'NoSQL Injection', 'Docker'] },
  'HTB_Trickster': { title: 'Trickster', platform: 'HackTheBox', difficulty: 'Medium', points: 30, tags: ['Web', 'PrestaShop', 'RCE'] },
  'HTB_UnderPass': { title: 'UnderPass', platform: 'HackTheBox', difficulty: 'Easy', points: 20, tags: ['Web', 'Hashcat', 'Cracking'] },
  'HTB_Union': { title: 'Union', platform: 'HackTheBox', difficulty: 'Medium', points: 30, tags: ['Web', 'SQLi', 'RCE'] },
  'seckmet.md': { title: 'Scepter', platform: 'HackTheBox', difficulty: 'Hard', points: 40, tags: ['Active Directory', 'AD CS', 'ESC14', 'DCSync'] }
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function escapeSql(text) {
  return text.replace(/'/g, "''");
}

let sql = '-- Migration to add writeups from .write-up directory\n' +
'-- Generated on ' + new Date().toISOString() + '\n\n';

const items = fs.readdirSync(writeupsDir);

for (const item of items) {
  const itemPath = path.join(writeupsDir, item);
  let content = '';
  let meta = null;

  if (fs.statSync(itemPath).isDirectory()) {
    const mdPath = path.join(itemPath, 'writeup.md');
    if (fs.existsSync(mdPath)) {
      content = fs.readFileSync(mdPath, 'utf8');
      meta = metadataMapping[item];
    }
  } else if (item.endsWith('.md')) {
    content = fs.readFileSync(itemPath, 'utf8');
    meta = metadataMapping[item];
  }

  if (meta && content) {
    const slug = slugify(meta.platform + '-' + meta.title);
    const title = meta.platform + ': ' + meta.title;
    
    const paragraphs = content.split('\n').filter(p => p.trim() !== '' && !p.trim().startsWith('#') && !p.trim().startsWith('!'));
    const firstPara = paragraphs.length > 0 ? paragraphs[0] : '';
    const description = firstPara.length > 200 ? firstPara.substring(0, 200) + '...' : firstPara || ('Analyse technique détaillée de la machine ' + meta.title + ' sur ' + meta.platform + '.');

    let cleanContent = content.replace(/!\[Cover\]\(cover\.png\)/g, '');
    
    const os = (meta.title.toLowerCase().includes('windows') || meta.tags.some(t => t.toLowerCase().includes('active directory'))) ? 'Windows' : 'Linux';
    
    const kaliHeader = '\n<div class="kali-header">\n' +
'  <div class="difficulty">Difficulté: ' + meta.difficulty + '</div>\n' +
'  <div class="points">Points: ' + meta.points + '</div>\n' +
'  <div class="os">OS: ' + os + '</div>\n' +
'</div>\n';
    
    if (cleanContent.trim().startsWith('# ')) {
      const lines = cleanContent.split('\n');
      lines.splice(1, 0, kaliHeader);
      cleanContent = lines.join('\n');
    } else {
      cleanContent = kaliHeader + '\n' + cleanContent;
    }

    sql += '\n-- Writeup: ' + meta.title + '\n' +
'INSERT INTO writeups (title, slug, content, platform, difficulty, points, tags, description, published, created_at)\n' +
'VALUES (\n' +
'  \'' + escapeSql(title) + '\',\n' +
'  \'' + escapeSql(slug) + '\',\n' +
'  \'' + escapeSql(cleanContent.trim()) + '\',\n' +
'  \'' + escapeSql(meta.platform) + '\',\n' +
'  \'' + escapeSql(meta.difficulty) + '\',\n' +
'  ' + meta.points + ',\n' +
'  ARRAY[' + meta.tags.map(t => '\'' + escapeSql(t) + '\'').join(', ') + '],\n' +
'  \'' + escapeSql(description) + '\',\n' +
'  true,\n' +
'  now()\n' +
') ON CONFLICT (slug) DO UPDATE SET\n' +
'  title = EXCLUDED.title,\n' +
'  content = EXCLUDED.content,\n' +
'  platform = EXCLUDED.platform,\n' +
'  difficulty = EXCLUDED.difficulty,\n' +
'  points = EXCLUDED.points,\n' +
'  tags = EXCLUDED.tags,\n' +
'  description = EXCLUDED.description;\n';
  }
}

fs.writeFileSync(outputMigration, sql);
console.log('Migration generated: ' + outputMigration);
