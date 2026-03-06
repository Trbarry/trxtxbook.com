-- Migration to update box difficulties
-- Generated on 2026-03-03

UPDATE writeups
SET 
  difficulty = updates.new_difficulty,
  content = REGEXP_REPLACE(
    content, 
    '<div class="difficulty">Difficulté: [^<]+</div>', 
    '<div class="difficulty">Difficulté: ' || updates.new_difficulty || '</div>'
  )
FROM (
  VALUES 
    ('htb-access', 'Easy'),
    ('htb-active', 'Easy'),
    ('htb-administrator', 'Medium'),
    ('htb-agile', 'Medium'),
    ('htb-alert', 'Easy'),
    ('htb-artificial', 'Easy'),
    ('htb-backfire', 'Medium'),
    ('htb-beep', 'Easy'),
    ('htb-blackfield', 'Hard'),
    ('htb-blue', 'Easy'),
    ('htb-cap', 'Easy'),
    ('htb-cat', 'Medium'),
    ('htb-certified', 'Medium'),
    ('htb-checker', 'Hard'),
    ('htb-chemistry', 'Easy'),
    ('htb-cicada', 'Easy'),
    ('htb-code', 'Easy'),
    ('htb-codetwo', 'Easy'),
    ('htb-cypher', 'Medium'),
    ('htb-delivery', 'Easy'),
    ('htb-dog', 'Easy'),
    ('htb-driver', 'Easy'),
    ('htb-earlyaccess', 'Hard'),
    ('htb-editor', 'Easy'),
    ('htb-escapetwo', 'Easy'),
    ('htb-forest', 'Easy'),
    ('htb-heal', 'Medium'),
    ('htb-heist', 'Easy'),
    ('htb-help', 'Easy'),
    ('htb-hospital', 'Medium'),
    ('htb-instant', 'Medium'),
    ('htb-lame', 'Easy'),
    ('htb-legacy', 'Easy'),
    ('htb-linkvortex', 'Easy'),
    ('htb-logforge', 'Medium'),
    ('htb-manager', 'Medium'),
    ('htb-metatwo', 'Easy'),
    ('htb-monteverde', 'Medium'),
    ('htb-nocturnal', 'Easy'),
    ('htb-optimum', 'Easy'),
    ('htb-pressed', 'Hard'),
    ('htb-reddish', 'Insane'),
    ('htb-remote', 'Easy'),
    ('htb-scepter', 'Hard'),
    ('htb-sekhmet', 'Insane'),
    ('htb-shoppy', 'Easy'),
    ('thm-skynet', 'Easy'),
    ('htb-soccer', 'Easy'),
    ('htb-thefrizz', 'Medium'),
    ('htb-titanic', 'Easy'),
    ('htb-trickster', 'Medium'),
    ('htb-underpass', 'Easy'),
    ('htb-union', 'Medium'),
    ('htb-vintage', 'Hard')
) AS updates(slug, new_difficulty)
WHERE writeups.slug = updates.slug;
