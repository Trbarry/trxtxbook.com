# MASTER ARCHITECTURE - trxtxbook.com

Ce document fait office de source de vérité unique pour l'architecture, les conventions et le flux de travail du projet. Il remplace et synthétise les divers documents de planification antérieurs.

## 1. Architecture Globale du Système

### 1.1. Frontend
- **Framework** : React 18 avec Vite.
- **Langage** : TypeScript (Typage strict requis).
- **Styling** : Tailwind CSS v3.4 (Thème sombre "Night/Cyber Violet" par défaut, support du mode clair via classes `dark:`). Utilisation du plugin `@tailwindcss/typography` pour le rendu du Markdown.
- **Animations** : Framer Motion (Transitions de pages, Scroll Reveal) et Lenis (Smooth Scroll). Effets avancés (particules) via l'API `<canvas>`.
- **Routage** : React Router DOM.
- **SEO** : React Helmet Async, Sitemap dynamique.

### 1.2. Backend & Données (Supabase)
- **Base de données** : PostgreSQL (BaaS Supabase).
- **Sécurité** : Row Level Security (RLS) activé pour toutes les tables publiques (lecture seule pour les utilisateurs anonymes).
- **Stockage** : Supabase Storage (Bucket `writeup-images` principalement).
- **Analytiques** : Tracking interne via RPC/Insert sur Supabase, sans cookies tiers (Privacy First).

### 1.3. Stratégie de Cache (SWR)
- **Outil** : `swr` (Stale-While-Revalidate).
- **Principe** : Remplacer les appels directs à `supabase-js` dans les `useEffect` par des hooks personnalisés (`useWriteups`, `useWikiPages`, `useAnalyticsData`).
- **Objectif** : Éviter les rechargements redondants, gérer proprement le statut `isLoading` et centraliser la gestion des erreurs.

---

## 2. Flux de Données et Gestion de Contenu

L'intégration du contenu (Wiki, Writeups) ne se fait pas via un CMS d'administration web, mais par une approche orientée "Code as Content" / DevOps.

### 2.1. Ingestion de Contenu
1.  **Rédaction Locale** : Les articles sont rédigés en Markdown (`.md`) dans les dossiers `.doc/` (Wiki) ou `.write-up/` (HTB).
2.  **Automatisation** : Des scripts Node.js (`scripts/upload-wiki.cjs`, `scripts/upload-writeup-images.cjs`) parsents les dossiers locaux.
3.  **Traitement** : 
    - Upload des images locales vers Supabase Storage (`writeup-images`).
    - Remplacement des chemins d'images dans le Markdown par les URLs publiques Supabase.
    - Génération de la TOC (Table des matières).
4.  **Synchronisation** : `upsert` dans Supabase + Génération de fichiers de migration SQL dans `supabase/migrations/` pour le versioning.

### 2.2. Gestion des Images
- **Rendu** : Utilisation d'un proxy/CDN de redimensionnement (ex: `wsrv.nl`) par-dessus les URLs Supabase/Unsplash pour optimiser le poids (WebP).
- **Résolution des Covers** : Logique de fallback centralisée via une fonction utilitaire (`getWriteupCoverImage`):
  1. `cover_image_url` (Priorité 1)
  2. `images[0]` (Priorité 2)
  3. Image par défaut générique.
- Finies les URLs codées en dur avec des conditions `if (slug === ...)` dans les composants.

---

## 3. UI et Composants Critiques

### 3.1. Composant Terminal (`Terminal.tsx`)
- **Rôle** : Élément interactif phare du portfolio, simulant un shell.
- **État** : Isolé pour l'historique de la session. Persistance via `localStorage` pour l'historique des commandes.
- **Évolution** : Architecture basée sur un objet de commandes (`commands`) plutôt qu'un long `switch/case`, intégrant des commandes utilitaires (`search`, `theme`) et des easter eggs.

### 3.2. Rendu des Articles (Writeups & Wiki)
- **Markdown** : Rendu via `react-markdown` avec `rehype-raw` pour autoriser des balises HTML sécurisées.
- **Verrouillage Éthique (Spoiler Protection)** : Piloté dynamiquement par la base de données (colonne `is_active` dans la table `writeups`) et non codé en dur dans les composants.
- **Fonds Dynamiques (`DifficultyBackground.tsx`)** : Un composant en arrière-plan utilisant `<canvas>` avec `requestAnimationFrame` génère des particules (cendres, flammes) en fonction de la propriété `difficulty`.

---

## 4. Conventions de Code

- **Hooks** : Doivent être isolés dans `src/hooks/` (ex: `useWriteups.ts`).
- **Services** : Toute logique d'interaction avec Supabase ou utilitaires purs va dans `src/lib/` (ex: `supabase.ts`, `imageUtils.ts`).
- **Types** : Centralisés dans `src/types/` (ex: `wiki.ts`, `writeup.ts`, `project.ts`).
- **Nommage** : PascalCase pour les composants et types, camelCase pour les fonctions et variables, UPPER_SNAKE_CASE pour les constantes globales.
- **Styles** : Préférer l'usage exclusif de Tailwind via la prop `className`. Éviter le CSS classique (`index.css` réservé aux directives Tailwind et variables CSS globales).