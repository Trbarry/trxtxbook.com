# Configuration du domaine personnalisé sur Netlify

## Situation actuelle
Vous avez deux projets Netlify :
1. Un ancien projet avec le bon domaine `trxtxbook.com`
2. Un nouveau projet `coruscating-treacle-b7838b` sans domaine personnalisé

## Solution recommandée : Redéployer sur l'ancien site

### Étape 1 : Identifier l'ancien projet
1. Connectez-vous à [netlify.com](https://netlify.com)
2. Dans votre dashboard, trouvez le projet qui utilise déjà `trxtxbook.com`
3. Notez l'ID de déploiement (dans l'URL ou les paramètres du site)

### Étape 2 : Redéployer sur l'ancien site
Une fois que vous avez l'ID de l'ancien projet, nous pourrons redéployer directement dessus.

## Alternative : Transférer le domaine

Si vous préférez garder le nouveau projet :

### Étape 1 : Retirer le domaine de l'ancien projet
1. Allez sur l'ancien projet Netlify
2. Site settings → Domain management
3. Cliquez sur `trxtxbook.com` → Remove domain

### Étape 2 : Ajouter le domaine au nouveau projet
1. Allez sur le nouveau projet `coruscating-treacle-b7838b`
2. Site settings → Domain management
3. Add custom domain → Entrez `trxtxbook.com`
4. Suivez les instructions de vérification DNS

### Étape 3 : Configurer les DNS (si nécessaire)
Si les DNS ne pointent pas automatiquement :
- **Enregistrement A** : Pointez vers l'IP Netlify
- **Enregistrement CNAME** : `www.trxtxbook.com` → `coruscating-treacle-b7838b.netlify.app`

## Recommandation
La **première solution** (redéployer sur l'ancien site) est plus simple et évite les problèmes de DNS.

Pouvez-vous me donner l'ID ou le nom de votre ancien projet Netlify qui utilise `trxtxbook.com` ?