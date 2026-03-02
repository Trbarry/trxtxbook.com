# Évolution du Terminal Interactif

## 1. Nouvelles Commandes Proposées

| Commande | Action | Intérêt |
| :--- | :--- | :--- |
| `search <terme>` | Recherche dans les titres/tags des writeups et projets. | Améliore l'utilité du terminal pour la navigation. |
| `contact` | Déclenche le défilement vers la section contact ou affiche les liens. | Raccourci direct pour les recruteurs. |
| `theme <mode>` | Change le thème du site (`light` / `dark`). | Renforce le côté interactif et "root". |
| `uptime` | Affiche un temps de fonctionnement simulé (ex: `up 1337 days`). | Ajoute une touche de fun (cyber-flavor). |
| `ping <host>` | Simule un ping vers un service externe (ex: `ping hackthebox.com`). | Renforce l'identité cybersécurité. |
| `history` | Affiche l'historique des commandes de la session. | Standard UNIX. |
| `echo <text>` | Affiche le texte saisi. | Base de tout shell. |

---

## 2. Améliorations de l'Interface (UX)

### Autocomplétion (Tab)
*   Permettre l'autocomplétion des commandes et des noms de fichiers (`cat readme.t[TAB]`).

### Persistance de l'Historique
*   Utiliser le `localStorage` pour sauvegarder l'historique des commandes entre les sessions.

### Easter Eggs
*   Commande `idontknow` : Répond par une citation d'un film de hacker (ex: Matrix, WarGames).
*   Commande `rm -rf /` : Affiche un message d'erreur humoristique ou un effet visuel de "crash" temporaire.

---

## 3. Plan d'Implémentation Technique

1.  **Refactoring du switch case :** Déplacer la logique des commandes dans un objet `commands` pour faciliter l'extension.
2.  **Gestionnaire d'état :** Ajouter un état pour l'historique persistent.
3.  **Hooks :** Utiliser des hooks personnalisés pour gérer les actions système (navigation, thème).
