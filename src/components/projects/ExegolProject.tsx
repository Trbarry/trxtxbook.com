import React from 'react';
import { Project } from '../../types/project';

export const ExegolProject: Project = {
  title: "L'Environnement d'Attaque de Référence en Cybersécurité",
  description: "Exegol est un environnement Linux conteneurisé basé sur Docker, conçu pour les professionnels de la cybersécurité, notamment les pentesters, red teamers et chercheurs en sécurité.",
  longDescription: `Exegol est un environnement Linux conteneurisé basé sur Docker, développé par Dramelac et Shutdown, 
    visant à fournir un espace de travail isolé, reproductible et polyvalent pour réaliser des tests de sécurité offensive. 
    Contrairement à des distributions comme Kali Linux ou Parrot OS, Exegol repose sur une approche modulaire, permettant 
    aux utilisateurs de disposer d'un environnement optimisé, sans les inconvénients liés aux mises à jour système ou aux 
    installations lourdes.`,
  tags: ["Docker", "Pentesting", "Red Team", "Cybersécurité", "Conteneurisation", "Open Source"],
  image: "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-image/exegol.png",
  features: [
    "Environnement léger et rapide via Docker",
    "Déploiement en une seule commande",
    "Reproductible pour les équipes de pentest",
    "Modularité des outils et configurations",
    "Isolation sécurisée des environnements",
    "Support complet des outils de sécurité",
    "Intégration avec les workflows DevSecOps"
  ],
  technicalDetails: [
    "Architecture conteneurisée Docker",
    "Support multi-plateforme (Linux, WSL2)",
    "Gestion avancée des volumes persistants",
    "Intégration des outils de pentesting",
    "Configuration réseau isolée",
    "Scripts d'automatisation",
    "Documentation complète en français"
  ],
  status: 'completed',
  timeline: "Mars 2025",
  articleUrl: "/articles/exegol-docker"
};