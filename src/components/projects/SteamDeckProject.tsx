import React from 'react';
import { Project } from '../../types/project';

export const SteamDeckProject: Project = {
  title: "Steam Deck Kali Linux : Station de Pentesting Mobile",
  description: "Configuration d'un dual boot SteamOS/Kali Linux sur carte SD pour transformer le Steam Deck en plateforme de pentesting portable",
  longDescription: `Projet innovant transformant le Steam Deck en une station de pentesting mobile polyvalente 
    sans compromettre ses capacités gaming natives. En utilisant une carte SD haute performance pour Kali Linux, 
    cette solution permet de basculer facilement entre SteamOS pour le gaming et un environnement complet de 
    tests de pénétration, créant ainsi un outil unique et portable pour la cybersécurité.`,
  tags: ["Kali Linux", "Steam Deck", "Pentesting", "Dual Boot", "Customisation"],
  image: "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/steamdeck-kali.jpg",
  features: [
    "Installation non-invasive de Kali Linux sur carte SD",
    "Dual boot préservant l'intégrité de SteamOS",
    "Suite complète d'outils de pentesting préinstallés",
    "Scripts d'automatisation pour le déploiement",
    "Interface optimisée pour l'écran tactile du Steam Deck"
  ],
  technicalDetails: [
    "Configuration GRUB personnalisée pour le dual boot",
    "Optimisation des drivers pour le matériel Steam Deck",
    "Installation automatisée des outils via scripts",
    "Configuration du réseau pour le pentesting",
    "Gestion de l'autonomie et des performances"
  ],
  status: 'completed',
  timeline: "Février 2025",
  articleUrl: "/articles/steam-deck-kali"
};