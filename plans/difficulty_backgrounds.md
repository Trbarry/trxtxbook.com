# Plan: Arrière-plans de Write-up Dynamiques selon la Difficulté

L'objectif est d'ajouter un effet visuel immersif en arrière-plan des pages de write-ups, dont l'intensité et le style varient en fonction de la difficulté de la box HackTheBox ou de l'article.

## 1. Composant `DifficultyBackground.tsx`

Ce composant utilisera un `<canvas>` pour afficher des animations fluides et performantes.

### Mappage des Effets
| Difficulté | Couleur | Type d'effet |
| :--- | :--- | :--- |
| **Easy / Facile** | Vert (#10b981) | Particules douces montantes |
| **Medium / Moyen** | Orange (#f59e0b) | Particules de données flottantes |
| **Hard / Difficile** | Rouge (#ef4444) | Flammes montantes et cendres / pixels |
| **Insane** | Violet (#8b5cf6) | Effet de distorsion / vide énergétique |

### Caractéristiques Techniques
- **Canvas Pleine Page** : Position fixe, `z-index: -1`.
- **Performance** : Utilisation de `requestAnimationFrame`, limitation du nombre de particules.
- **Adaptabilité** : Réagit aux changements de taille de fenêtre.
- **Intégration** : Simple prop `difficulty` transmise au composant.

## 2. Modifications des Fichiers

### `src/components/DifficultyBackground.tsx` (Nouveau)
- Logique de rendu Canvas.
- Fonctions pour dessiner différents types de particules.

### `src/pages/WriteupPage.tsx`
- Import et ajout du composant `<DifficultyBackground difficulty={writeup.difficulty} />` juste avant le `WriteupDetail`.
- S'assurer que le conteneur principal a `relative overflow-hidden` pour ne pas avoir de scrollbars parasites si on sort du cadre (bien que `fixed` devrait suffire).

## 3. Détails des Effets

### Effet "Cendres" (Hard)
- Petits carrés (pixels) de tailles variées.
- Mouvement oscillant horizontal tout en descendant ou montant lentement.
- Opacité variable pour simuler l'incandescence qui s'éteint.

### Effet "Flammes" (Hard/Insane)
- Cercles avec un dégradé radial ou flou (`ctx.filter = 'blur(4px)'` si performance OK, sinon dégradés).
- Changement de couleur au cours de la vie de la particule (Jaune -> Orange -> Rouge -> Noir).

## 4. Todo List pour l'Implémentation

- [ ] Créer `src/components/DifficultyBackground.tsx`.
- [ ] Implémenter la détection de difficulté (insensible à la casse, support FR/EN).
- [ ] Développer le système de particules générique.
- [ ] Configurer les presets d'effets (Easy/Medium/Hard/Insane).
- [ ] Modifier `src/pages/WriteupPage.tsx`.
- [ ] Vérifier la lisibilité sur fond sombre et clair.
