# Product Requirements Document (PRD) - trxtxbook.com

## 1. Vision & Objectifs
**trxtxbook.com** est le portfolio technique de Tristan Barry, conçu comme une vitrine interactive de ses compétences en ingénierie système, réseau et cybersécurité.

### Objectifs Principaux
*   **Démontrer l'expertise technique :** Présenter des projets complexes (HomeLab, AD, Exegol).
*   **Partager la connaissance :** Publier des writeups de CTF (HackTheBox, TryHackMe).
*   **Branding personnel :** Créer une identité visuelle forte ("Deep Black" / "Cyber").
*   **Interactivité :** Offrir une expérience utilisateur mémorable (Terminal, animations).

---

## 2. Public Cible
*   **Recruteurs IT/Cyber :** Cherchant des profils passionnés et compétents.
*   **Professionnels du secteur :** Intéressés par les architectures documentées.
*   **Étudiants/Passionnés :** Apprenant via les writeups et retours d'expérience.

---

## 3. Spécifications Fonctionnelles (Actuelles)

### 3.1. Système de Writeups (Compte-rendus d'intrusion)
*   **Affichage Dynamique :** Liste et détails récupérés depuis Supabase.
*   **Filtres/Tags :** Classification par plateforme (HTB, THM) et difficulté.
*   **Éthique & Conformité :** Protection contre le spoil (Floutage auto si machine active).
*   **Markdown :** Rendu riche avec support de la coloration syntaxique.

### 3.2. Projets & Infrastructure
*   **Timeline de Carrière :** Parcours professionnel et académique.
*   **Détails Techniques :** Pages dédiées aux architectures complexes (ex: Active Directory).

### 3.3. Expérience Interactive
*   **Terminal Système (² ou CTRL+K) :** Émulateur de shell avec système de fichiers virtuel.
*   **Animations Framer Motion :** Transitions CRT, Scroll Reveal, effets de curseur.
*   **Mode Sombre/Clair :** Support complet du thémage.

### 3.4. Analytics & SEO
*   **Analytics Privés :** Tracking sur-mesure (Supabase) sans cookies tiers.
*   **SEO Opti :** Meta-tags dynamiques, Sitemap automatique, JSON-LD pour les moteurs de recherche.

---

## 4. Architecture Technique

### 4.1. Frontend
*   **Framework :** React 18 (Vite)
*   **Langage :** TypeScript (Typage strict)
*   **Style :** Tailwind CSS 3.4
*   **Animations :** Framer Motion + Lenis (Smooth Scroll)
*   **Gestion État/Données :** SWR (Cache & Revalidation)

### 4.2. Backend
*   **BaaS :** Supabase (PostgreSQL)
*   **Sécurité :** Row Level Security (RLS) pour protéger les données.
*   **Storage :** Supabase Buckets pour les images et certificats.

---

## 5. Roadmap & Évolutions (Suggestions)

### Phase 1 : Automatisation & Données (P1)
*   **Lien Dynamique `isActiveMachine` :** Ajouter une colonne `is_active` dans la table `writeups` pour automatiser le verrouillage éthique.
*   **Gestion des Images :** Centraliser le stockage des images dans Supabase et automatiser les URLs de fallback.

### Phase 2 : Expérience Utilisateur (P2)
*   **Recherche Globale :** Implémenter une barre de recherche ou une commande `search` dans le terminal.
*   **Commentaires/Interaction :** Système de réactions (emoji) ou commentaires simples sur les writeups.
*   **Easter Eggs :** Ajouter des commandes cachées dans le terminal liées à des événements de cybersécurité.

### Phase 3 : Performance & Ops (P3)
*   **PWA :** Rendre le site installable (Progressive Web App).
*   **Optimisation Assets :** Automatiser la compression des images via une Edge Function Supabase ou un service tiers.
*   **Monitoring :** Ajouter un dashboard admin plus complet pour les analytics.

---

## 6. Critères de Succès
*   Temps de chargement (LCP) inférieur à 1.5s.
*   Accessibilité (Score Lighthouse > 90).
*   Zéro erreur console en production.
*   Engagement utilisateur via le Terminal (suivi par analytics).
