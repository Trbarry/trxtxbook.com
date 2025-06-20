/*
  # Add Dog HTB writeup

  1. Changes
    - Insert new writeup for Dog HTB machine
    - Set as published and active
*/

INSERT INTO writeups (
  title,
  slug,
  content,
  platform,
  difficulty,
  points,
  tags,
  published,
  description,
  images
) VALUES (
  'Write-Up - Dog (Hack The Box)',
  'hackthebox-dog',
  '# Write-Up - Dog (Hack The Box)

Cette machine Linux de difficulté Easy combine plusieurs vulnérabilités web classiques avec une chaîne d''exploitation intéressante menant à une compromission complète via un CMS Backdrop.

## Points Clés
- Git leak exposant des credentials
- Upload de module malveillant dans le CMS
- Exploitation de binaire SUID pour root

## Apprentissages
- Importance de la reconnaissance approfondie
- Sécurisation des dépôts Git en production
- Validation des uploads de modules CMS',
  'hackthebox',
  'Easy',
  20,
  ARRAY['Git Leak', 'CMS', 'Privilege Escalation', 'Backdrop CMS'],
  true,
  'Machine Linux Easy combinant Git leak, exploitation de CMS Backdrop et élévation de privilèges via un binaire SUID.',
  ARRAY['https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&q=80']
);