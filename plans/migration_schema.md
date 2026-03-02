# Proposition d'Évolution du Schéma de Base de Données

## 1. Automatisation de `isActiveMachine`
Actuellement, la logique de "spoiler protection" est codée en dur dans les composants React. Pour la rendre dynamique et contrôlable via l'interface d'administration Supabase, nous proposons d'ajouter une colonne à la table `writeups`.

### Migration SQL
```sql
-- Ajouter la colonne is_active pour gérer le verrouillage éthique
ALTER TABLE writeups 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Commentaire pour expliquer l'utilité
COMMENT ON COLUMN writeups.is_active IS 'Définit si la machine est toujours active sur sa plateforme. Si true, le contenu du writeup sera masqué pour respecter l''éthique.';
```

### Impact sur le Code Frontend
Le flag `isActiveMachine` dans les composants devra être remplacé par `writeup.is_active`.

---

## 2. Optimisation des Images
Pour éviter les URLs en dur dans le code, nous suggérons d'ajouter une colonne `thumbnail_url` ou de mieux utiliser la colonne `images`.

### Migration SQL
```sql
-- Ajouter une colonne pour l'image de couverture principale
ALTER TABLE writeups 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Mettre à jour les données existantes avec les URLs actuelles (exemples)
UPDATE writeups SET cover_image_url = 'https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/writeup-images/foresthtb.png' WHERE slug = 'hackthebox-forest';
```

---

## 3. Système de Feedback (Optionnel)
Pour mesurer l'intérêt des lecteurs sans complexité majeure.

### Migration SQL
```sql
-- Ajouter un compteur de likes/réactions
ALTER TABLE writeups 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
```
