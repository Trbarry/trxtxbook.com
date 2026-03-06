# Plan d'Évolution du Wiki TRTNX (Focus UI/UX & Volume)

L'objectif est de mettre en avant le volume massif de connaissances accumulées et d'élever la qualité visuelle globale pour une expérience "premium" façon Obsidian/Notion, sans vue en graphe pour rester focalisé sur l'efficacité et la clarté.

## 1. Impact Visuel de "Volume" (Home Page)
- **Dashboard Statistique Avancé** : Remplacer l'accueil actuel par une vue "Mission Control" montrant :
  - Compteur de notes indexées avec animation.
  - Activité récente (feed des 10 dernières modifications).
  - Nuage de tags ou liste dense stylisée pour montrer la richesse thématique.
- **Masonry Browse View** : Un mode "Parcourir tout" qui affiche les notes sous forme de cartes denses, permettant de scroller longuement pour visualiser la quantité.

## 2. Navigation "Power User" & Contexte
- **Sidebar Count** : Afficher le nombre de pages entre parenthèses pour chaque dossier (ex: `PENTEST (124)`).
- **Breadcrumbs (Fil d'Ariane)** : Positionné en haut de chaque article pour une meilleure orientation.
- **Backlinks & Related** : En bas de chaque page, lister les pages liées pour encourager l'exploration transversale.

## 3. Qualité Visuelle & Rendu Markdown (Focus Beauté)
- **Callouts (Admonitions) "Premium"** : Support complet des syntaxes `> [!note]`, `> [!warning]`, etc. avec des bordures lumineuses, icônes Lucide et arrière-plans translucides (Glassmorphism).
- **Intégration Mermaid.js** : Pour des schémas techniques propres et intégrés.
- **Image Lightbox & Zoom** : Interaction fluide pour agrandir les captures d'écran.
- **Reading Experience** : Amélioration de la typographie (interlignage, contrastes) et ajout d'un temps de lecture estimé.

## 4. UI/UX Global
- **Recherche Enrichie** : Surlignage des termes recherchés dans les résultats et transition fluide vers l'article.
- **Polissage des Transitions** : Utilisation de Framer Motion pour des entrées de pages et de sidebar plus fluides.
