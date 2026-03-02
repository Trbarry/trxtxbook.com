# Stratégie de Cache et Gestion des Données

## 1. État Actuel
*   **Méthode :** Utilisation directe de `supabase-js` dans des `useEffect` au sein des composants.
*   **Problèmes :**
    *   Pas de cache entre les navigations (les données sont rechargées à chaque fois que l'utilisateur revient sur la page).
    *   Pas de gestion centralisée des erreurs.
    *   Risque de "Waterfalls" de requêtes si plusieurs composants enfants font des appels séparés.
    *   Dépendance présente (`swr`) mais non utilisée.

---

## 2. Solution Proposée : SWR (Stale-While-Revalidate)

L'implémentation de SWR permettra d'améliorer considérablement la perception de fluidité (données instantanées lors du retour sur une page déjà visitée).

### Hooks Personnalisés
Créer des hooks réutilisables dans `src/hooks/` :

```typescript
// src/hooks/useWriteups.ts
import useSWR from 'swr';
import { supabase } from '../lib/supabase';

export function useWriteups() {
  const { data, error, isLoading } = useSWR('writeups', async () => {
    const { data } = await supabase
      .from('writeups')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    return data;
  });

  return { writeups: data, error, isLoading };
}
```

---

## 4. Implémentation (Mars 2026)
La stratégie de cache a été mise en place avec succès en utilisant SWR.

### Nouveaux Hooks Créés
*   `useWriteups()` : Gère la récupération et le cache des writeups.
*   `useWikiPages()` : Gère la récupération et le cache des pages du wiki.
*   `useAnalyticsData()` : Gère la récupération des statistiques avec un rafraîchissement automatique toutes les 2 minutes.

### Améliorations Apportées
*   **Performance :** Suppression des chargements redondants lors de la navigation entre les pages.
*   **Expérience Utilisateur :** Les données s'affichent instantanément grâce au cache SWR.
*   **Maintenance :** Centralisation de la logique de récupération des données dans des hooks réutilisables.
*   **Stabilité :** Gestion unifiée du chargement (`isLoading`) et des erreurs.
