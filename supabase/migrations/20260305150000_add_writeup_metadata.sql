-- Ajout de la colonne is_active pour le "verrouillage éthique" des writeups de machines actives
ALTER TABLE writeups ADD COLUMN is_active BOOLEAN DEFAULT false;
COMMENT ON COLUMN writeups.is_active IS 'Si true, la machine est active (spoil interdit)';

-- Ajout de la colonne pour centraliser la gestion des images de couverture
ALTER TABLE writeups ADD COLUMN cover_image_url TEXT;

-- Ajout de la colonne pour gérer le nombre de likes
ALTER TABLE writeups ADD COLUMN likes_count INTEGER DEFAULT 0;
