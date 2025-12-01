TRTNXBOOK.COM : Portfolio d'Ingénierie Cybersécurité

1. Overview du Projet

Ce dépôt contient le code source complet de trtnxbook.com, le portfolio technique de Tristan Barry. Conçu comme une Knowledge Base et une vitrine professionnelle, le site a pour objectif de documenter une transition de carrière réussie de l'infrastructure vers l'Ingénierie Système et la Sécurité Offensive.

La plateforme présente :

Rapports d'Intrusion (Write-ups CTF)

Projets d'infrastructure (Home Lab, Active Directory, Conteneurisation)

Le suivi des certifications professionnelles (CPTS, eJPT, AZ-900).

2. Stack Technique Fondamentale

Catégorie

Technologie

Rôle et Justification

Frontend

React (Hooks), TypeScript, Vite

Vitesse, rigueur du typage, et architecture en SPA moderne.

UI Framework

Tailwind CSS 3.4

Utilitaires pour le thème Deep Black et la conception responsive.

Animation UX

Framer Motion

Transitions de pages fluides avec effet "Cyber-Spring" (simulation d'allumage d'écran CRT) pour une UX native et dynamique.

Backend

Supabase (PostgreSQL)

BaaS pour la gestion des données structurées, le stockage sécurisé des assets et les politiques RLS.

OS Développeur

Arch Linux / Hyprland

L'interface graphique et l'UX utilisateur (Terminal CLI) reflètent l'environnement de travail de l'auteur.

3. Architecture du Code Source (/src)

L'application est architecturée pour garantir la modularité et la performance dans le strict respect des conventions TypeScript et React.

3.1. Structure des Composants (/components)

Dossier

Description

Exemples de fichiers

layout

Composants structurels globaux et animations de fond.

Header.tsx, Footer.tsx, PageTransition.tsx

core

Sections complètes de la page d'accueil.

Hero.tsx, Formation.tsx, Writeups.tsx

platforms

Cartes de métriques externes (HTB, THM, Root-Me).

HackTheBoxCard.tsx, TryHackMeCard.tsx

lib

Logique métier et initialisation des services.

supabase.ts, analytics.ts

/pages

Vues complètes liées aux routes (URL).

WriteupsList.tsx, CertificationsList.tsx

3.2. Caractéristiques Techniques (Advanced Features)

Console Interactive (Terminal CLI) :

Le composant <Terminal /> est un easter egg accessible globalement via les touches ² ou CTRL+K.

Il simule un shell (zsh / bash) avec des commandes de navigation (cd, ls, neofetch, cat) et des retours colorés (erreurs, succès).

Utilisation de framer-motion pour un effet de descente "Quake Console".

Animation d'Apparition :

Le composant <ScrollReveal /> gère l'apparition progressive des éléments (opacity/translation) en utilisant l'API IntersectionObserver sans dépendance à des classes CSS externes, optimisant les performances du thread principal.

Sécurité des Write-ups :

Implémentation d'une logique frontend qui détecte les machines encore actives sur HackTheBox (via le slug) et masque ou floute le contenu des rapports par respect pour l'éthique et les règles des plateformes.

4. Architecture Backend (Supabase)

Le backend est géré via une approche Infrastructure as Code au sein du dossier /supabase/migrations.

4.1. Modèle de Données

Les données critiques sont structurées pour une récupération rapide :

writeups : Contenu des rapports d'intrusion, indexé par slug.

analytics_summary : Tables pour le système d'analytics personnalisé et respectueux de la vie privée.

4.2. Sécurité des Données (RLS)

La sécurité repose sur les politiques RLS (Row Level Security) définies dans les fichiers de migration.

L'accès public en lecture (SELECT) est autorisé sur les tables de contenu où le champ published est TRUE.

L'accès en écriture (INSERT, UPDATE, DELETE) est strictement limité aux utilisateurs authentifiés avec le rôle admin. 
