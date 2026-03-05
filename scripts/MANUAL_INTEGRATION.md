# Processus d'Intégration de Contenu (Wiki & Writeups)

Ce document décrit la méthode habituelle pour intégrer de nouveaux documents (Markdown + Images) dans la plateforme.

## 1. Structure du Contenu Source
Les nouveaux documents doivent être organisés dans un dossier dédié (par exemple dans `.doc/` pour le Wiki ou `.write-up/` pour les rapports HTB).
- `document.md` : Le contenu technique.
- `image1.png`, `image2.png`, ... : Les captures d'écran référencées dans le MD.

## 2. Automatisation via Scripts Node.js
Plusieurs scripts dans le dossier `scripts/` permettent d'automatiser l'importation.

### Pour le Wiki
Utilisez le script générique `scripts/upload-wiki.cjs`.
Le script effectue les actions suivantes :
1. **Upload des images** : Les images locales (.png) du dossier sont envoyées vers le bucket Supabase `writeup-images` (sous le préfixe `wiki/`).
2. **Traitement Markdown** :
   - Remplacement des liens d'images locaux par les URLs publiques Supabase.
   - Génération automatique d'une Table des Matières (TOC) avec des ancres compatibles avec le frontend.
3. **Synchronisation Base de Données** : Utilise `upsert` pour ajouter ou mettre à jour la page dans la table `wiki_pages`.
4. **Génération de Migration** : Crée un fichier `.sql` dans `supabase/migrations/` pour versionner le contenu.

**Commande (PowerShell) :**
```powershell
powershell -Command "node scripts/upload-wiki.cjs <dossier> <titre> <slug> <categorie> [tags_virgule]"
```
*Exemple :*
```powershell
powershell -Command "node scripts/upload-wiki.cjs \".doc/kerberos_...\" \"Le Titre\" \"le-slug\" \"Pentest/Theorie\" \"tag1,tag2\""
```

### Pour les Writeups (HTB)
Le script `scripts/upload-writeup-images.cjs` scanne le dossier `.write-up/` et :
1. Extrait les métadonnées (Difficulté, Points, OS) du contenu.
2. Upload l'image de couverture (`cover.png`).
3. Génère une migration SQL massive regroupant tous les writeups.

## 3. Déploiement
Une fois les scripts exécutés localement :
1. Vérifiez le rendu sur l'interface locale (`npm run dev`).
2. Les migrations SQL générées peuvent être appliquées via l'interface Supabase ou via CLI si nécessaire.
3. Commitez les changements (notamment les nouvelles migrations et les images sources) dans Git.

---
*Note: Toujours s'assurer que les variables d'environnement `VITE_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont correctement configurées dans le fichier `.env`.*
