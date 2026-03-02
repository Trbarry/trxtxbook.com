# Analyse de la Gestion des Images

## 1. État Actuel
*   **Optimisation :** Utilisation de `wsrv.nl` comme proxy de redimensionnement pour les images Supabase et Unsplash. Très intelligent pour pallier les limitations du plan gratuit de Supabase.
*   **Fallback :** De nombreuses URLs d'images sont codées en dur dans `Writeups.tsx` et `WriteupDetail.tsx` via des conditions `if (slug === '...')`.
*   **Stockage :** Les images semblent être stockées dans un bucket public `writeup-images` sur Supabase.

---

## 2. Problèmes Identifiés
*   **Maintenabilité :** Ajouter un nouveau writeup nécessite de modifier le code frontend pour l'image de couverture si celle-ci n'est pas déjà dans la base de données.
*   **Duplication :** La logique de fallback est dupliquée entre la liste et le détail.
*   **Flexibilité :** Impossible de changer l'image d'un projet sans déployer une nouvelle version du code.

---

## 3. Améliorations Proposées

### Centralisation de la Logique
*   Créer une fonction utilitaire unique `getWriteupCoverImage(writeup)` qui centralise la logique de priorité :
    1.  `writeup.cover_image_url` (nouvelle colonne proposée).
    2.  `writeup.images[0]` (tableau existant).
    3.  Mapping par slug (pour la compatibilité ascendante).
    4.  Image par défaut générique.

### Migration vers la Base de Données
*   Remplir systématiquement la colonne `images` ou `cover_image_url` en base de données pour tous les articles.
*   Utiliser des noms de fichiers standardisés dans le bucket Supabase (ex: `{slug}.webp`).

### Lazy Loading & Performance
*   Continuer d'utiliser `getOptimizedUrl` pour servir des versions WebP légères.
*   Implémenter un effet de "Blur-up" (afficher une version très basse résolution en attendant le chargement de l'image haute qualité).
