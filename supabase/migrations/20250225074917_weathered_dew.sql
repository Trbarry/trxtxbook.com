/*
  # Mise à jour du write-up Cat HTB
  
  1. Modifications
    - Changement des points de 50 à 45
    - Changement de la difficulté de "Difficile" à "Moyen"
*/

UPDATE writeups
SET 
  points = 45,
  difficulty = 'Moyen'
WHERE slug = 'hackthebox-cat-analysis';