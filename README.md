# TRTNXBOOK.COM - Portfolio d'Ingénierie & Cybersécurité

## 1. Vue d'ensemble

Ce dépôt contient le code source de **trtnxbook.com**, la plateforme technique personnelle de Tristan Barry. Conçu comme une base de connaissances (*Knowledge Base*) dynamique, ce projet documente la transition professionnelle de l'auteur, passant de l'infrastructure physique (fibre optique) à l'administration système et la sécurité offensive.

L'application sert de vitrine technique démontrant des compétences en :

* **Développement Fullstack** : Architecture SPA moderne, typage strict, intégration BaaS.
* **Cybersécurité** : Rapports d'intrusion (*Write-ups*), gestion de secrets, logique de divulgation responsable.
* **Infrastructure** : Gestion de projets, Active Directory, Home Lab.

---

## 2. Stack Technique

L'architecture privilégie la performance, la sécurité et la maintenabilité.

| Domaine | Technologie | Justification Technique |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Architecture basée sur les composants, typage statique fort pour la robustesse, et build tool ultra-rapide. |
| **Interface (UI)** | Tailwind CSS 3.4 | Système de classes utilitaires pour un design system cohérent (thème "Deep Black") et responsive. |
| **Expérience (UX)** | Framer Motion | Gestion des transitions de pages (cycle de vie mount/unmount) et animations physiques (spring physics). |
| **Backend** | Supabase | Backend-as-a-Service (PostgreSQL) gérant l'authentification, la base de données relationnelle et le stockage d'objets. |
| **Routing** | React Router v6 | Gestion déclarative des routes et de la navigation client-side. |
| **Environnement** | Arch Linux / Hyprland | L'UX du site (notamment le terminal) est inspirée des gestionnaires de fenêtres par pavage (tiling WM). |

---

## 3. Architecture du Code Source

Le projet suit une structure modulaire stricte dans le dossier `/src`.

### 3.1. Organisation des Dossiers

* `components/layout` : Composants structurels persistants (Header, Footer) et wrappers d'animation (PageTransition).
* `components/core` : Blocs fonctionnels principaux de la page d'accueil (Hero, Formation, Writeups).
* `components/platforms` : Cartes de visualisation de données pour les plateformes externes (HackTheBox, TryHackMe).
* `lib` : Initialisation des clients externes (`supabase.ts`) et utilitaires.
* `pages` : Vues correspondant aux routes de l'application.
* `types` : Définitions des interfaces TypeScript (Schemas DB).

### 3.2. Fonctionnalités Avancées

#### Terminal Système Interactif
Un émulateur de terminal est accessible globalement sur l'application (Overlay Z-Index élevé).

* **Activation** : Touches `²` (Backquote) ou `CTRL+K`.
* **Fonctionnalités** : Navigation au clavier, système de fichiers simulé, historique de commandes, commandes système (`neofetch`, `whoami`, `ls`, `cd`).

#### Moteur d'Animation
L'application n'utilise pas de transitions CSS standard mais un moteur physique via Framer Motion.

* **Page Transitions** : Effet "CRT Turn On" (scale + brightness) lors des changements de routes.
* **Scroll Reveal** : Apparition progressive des éléments au défilement via l'API Intersection Observer.

#### Sécurité & Éthique (Write-ups)
Une logique conditionnelle est implémentée pour les rapports de pentest (*Writeups*). Le système vérifie le slug de la machine concernée. Si la machine est toujours active sur la plateforme d'entraînement (ex: HackTheBox), le contenu est automatiquement flouté et verrouillé pour empêcher la divulgation de solutions (spoilers), respectant ainsi les règles académiques.

---

## 4. Architecture Backend & Données

Le backend repose sur Supabase (PostgreSQL). La configuration est gérée via SQL et le versioning des migrations.

### 4.1. Modèle de Données (Schéma simplifié)

* **`writeups`** : Stocke les articles techniques.
    * `slug` (Primary Key, string) : Identifiant URL unique.
    * `content` (Text) : Contenu en Markdown.
    * `published` (Boolean) : Flag de visibilité.
    * `tags` (Array) : Mots-clés pour le moteur de recherche.
* **`analytics`** : Tables dédiées aux métriques de visite (respectueuses de la vie privée, sans cookies tiers).

### 4.2. Sécurité (Row Level Security)

L'accès aux données est contrôlé par des politiques RLS strictes au niveau de la base de données :

* **Public (Anon)** : Droit de lecture (`SELECT`) uniquement sur les enregistrements où `published = true`.
* **Admin (Auth)** : Droit d'écriture (`INSERT`, `UPDATE`, `DELETE`) réservé à l'UUID de l'administrateur.

---

## 5. Installation et Développement

### Prérequis
* Node.js (v18+)
* NPM ou Yarn
* Variables d'environnement Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

### Commandes

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement (HMR)
npm run dev

# Compilation pour la production
npm run build

# Prévisualisation du build local
npm run preview
