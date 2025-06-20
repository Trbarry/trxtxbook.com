/*
  # Ajout du stockage pour l'image de profil

  1. Nouveau Bucket
    - Création d'un bucket 'profile-images' pour stocker les images de profil
  
  2. Sécurité
    - Enable RLS sur le bucket
    - Politique de lecture publique
    - Politique d'écriture pour les utilisateurs authentifiés
*/

-- Création du bucket pour les images de profil
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT DO NOTHING;

-- Enable RLS sur les objets storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les images de profil
CREATE POLICY "Les images de profil sont publiques"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Politique d'upload pour les utilisateurs authentifiés
CREATE POLICY "Les utilisateurs authentifiés peuvent gérer les images de profil"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'profile-images')
WITH CHECK (bucket_id = 'profile-images');