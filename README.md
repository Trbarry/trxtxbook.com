
# 📂 Structure du Projet - Trxtxbook.com

Ce document détaille l'organisation des fichiers et dossiers du portfolio **Tristan Barry**. Le projet est une Single Page Application (SPA) développée avec **React**, **TypeScript**, **Vite** et **Tailwind CSS**, utilisant **Supabase** comme backend.

## 🌳 Arborescence Globale

### 📁 Racine du Projet
C'est ici que résident les fichiers de configuration de l'environnement de développement.

* `package.json` / `package-lock.json` : Gestion des dépendances (React, Supabase, Tailwind, etc.) et scripts de lancement (`dev`, `build`).
* `vite.config.ts` : Configuration du bundler Vite (plugins, sécurité, alias).
* `tsconfig.json` (et variantes) : Configuration du compilateur TypeScript pour assurer la rigueur du typage.
* `tailwind.config.js` : Configuration du Design System (couleurs `cyber-violet`, polices, animations).
* `eslint.config.js` : Règles de linting pour la qualité du code.
* `index.html` : Point d'entrée HTML de l'application.
* `NETLIFY_SETUP.md` : Documentation spécifique au déploiement.

---

### 📁 `public/` (Assets Statiques)
Fichiers servis directement à la racine du site web.

* `robots.txt` : Directives pour les robots d'indexation (SEO).
* `sitemap.xml` : Plan du site généré pour le référencement.
* `_redirects` : Règles de redirection pour Netlify (gestion du routing SPA).
* `image.png` : Image par défaut (favicon/meta-image).

---

### 📁 `src/` (Code Source)
Le cœur de l'application Frontend.

#### 📄 Points d'entrée
* `main.tsx` : Amorçage de l'application React (injection dans le DOM, providers).
* `App.tsx` : **Routeur Principal**. Définit toutes les routes (`/`, `/writeups`, `/admin`, etc.) et la structure globale de la page.
* `index.css` : Styles globaux et directives Tailwind (`@apply`, `@layer`).

#### 📂 `components/` (Interface Utilisateur)
Composants réutilisables organisés par domaine fonctionnel.

* **`layout/`** : Structure globale.
    * `Header.tsx` : Navigation, menu mobile, accès profil.
    * `Footer.tsx` : Pied de page, liens sociaux.
* **`core/`** (Sections principales de la page d'accueil) :
    * `Hero.tsx` : Bannière d'accueil & présentation.
    * `Stats.tsx` : Affichage des scores (THM, HTB, Root-Me).
    * `Formation.tsx` : Parcours scolaire (BTS).
    * `Projects.tsx` : Grille des projets personnels.
    * `Writeups.tsx` & `WriteupsList.tsx` : Affichage et filtrage des articles CTF.
    * `Contact.tsx` : Formulaire et infos de contact.
* **`projects/`** : Données et composants des projets spécifiques.
    * Fichiers individuels (`ADProject.tsx`, `ExegolProject.tsx`, etc.) exportant la configuration de chaque projet.
    * `ProjectDetail.tsx` : Modal/Page de détail d'un projet.
* **`articles/`** : Composants pour les pages d'articles longs (Blog).
    * Contient les articles majeurs (`CPTSJourneyArticle.tsx`, `SMBArticle.tsx`, etc.).
    * Sous-dossiers (`ad/`, `linux-mint/`, `cpts/`) : Découpent les très longs articles en sous-composants pour la maintenabilité.
* **`certifications/`** : Cartes visuelles des diplômes (`BTSCertification.tsx`, `CPTSCertification.tsx`, etc.).
* **`platforms/`** : Cartes de statistiques tierces (`HackTheBoxCard.tsx`, etc.).
* **`ui/`** & **`fx/`** (Effets visuels) :
    * `CyberCharacter.tsx` : Le bot interactif.
    * `MouseTrail.tsx` : Effet de traînée de souris.
    * `ScrollReveal.tsx` : Animation d'apparition au défilement.
    * `ModalPortal.tsx` : Gestion des modales via React Portal.
* **`admin/`** :
    * `AnalyticsDashboard.tsx` : Tableau de bord des statistiques de visite.
    * `SitemapGenerator.tsx` : Outil de génération XML.

#### 📂 `pages/` (Vues)
Les composants qui correspondent directement à une URL (Route).

* `ArticlePage.tsx`, `ADArticlePage.tsx`, etc. : Pages dédiées aux articles.
* `WriteupPage.tsx` : Page dynamique affichant un write-up spécifique (chargé depuis Supabase via le slug).
* `AnalyticsPage.tsx` : Page d'administration (Dashboard).
* `CertificationsList.tsx` : Page listant toutes les certifs.

#### 📂 `lib/` (Logique & Services)
Le code "métier" sans interface graphique.

* `supabase.ts` : Client Supabase initialisé (connexion DB).
* `analytics.ts` : **Système d'analytics personnalisé**. Gère le tracking respectueux de la vie privée (sans cookies tiers).
* `sitemap.ts` : Logique de génération du sitemap XML.

#### 📂 `types/` (TypeScript)
Définitions des types pour la sécurité du code.

* `project.ts` : Interface d'un projet.
* `writeup.ts` : Interface d'un write-up (DB schema).

---

### 📁 `supabase/` (Backend)
Configuration de l'infrastructure Backend-as-a-Service.

#### 📂 `migrations/`
Fichiers SQL horodatés qui définissent la structure de la base de données.

* **Tables principales** :
    * `writeups` : Contenu des articles CTF.
    * `projects` : (Si dynamique) ou gestion via code.
    * `page_views`, `visitor_sessions`, `analytics_summary` : Tables pour le système d'analytics maison.
* **Sécurité** :
    * Définition des politiques **RLS (Row Level Security)** : Qui peut lire (Public) et qui peut écrire (Admin).
* **Storage** :
    * Création des buckets `writeup-images`, `profile-images`, `cv-files`.
* **Fonctions** :
    * Procédures stockées PL/pgSQL pour l'agrégation des données analytics.

---

## 🛠 Résumé Technique

* **Frontend** : React 18, Vite 5.
* **Langage** : TypeScript 5 (Strict Mode).
* **Styling** : Tailwind CSS 3.4 avec thème "Cyber".
* **Backend** : Supabase (PostgreSQL, Auth, Storage).
* **Routing** : React Router DOM 6.
* **SEO** : React Helmet Async.
