import React from 'react';
import { Project } from '../../types/project';

export const SMBProject: Project = {
  title: "Mini-Projet : Serveur SMB pour Streaming 4K HDR",
  description: "Solution simple mais efficace de streaming local optimisée pour la lecture de contenu 4K HDR sans perte de qualité",
  longDescription: `Un petit projet personnel né d'un besoin simple : regarder des films 4K HDR sur ma TV sans perte de qualité. 
    Cette solution transforme un smartphone Android en serveur SMB portable, permettant un streaming local 
    de haute qualité sans transcodage ni compression. Idéal pour profiter pleinement des contenus 4K HDR 
    et Dolby Vision sans les limitations des solutions traditionnelles comme l'USB ou le Chromecast.`,
  tags: ["Android", "SMB", "Streaming", "4K HDR", "Networking"],
  image: "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/smb.png",
  features: [
    "Streaming 4K HDR sans perte de qualité",
    "Support complet Dolby Vision et Dolby Atmos",
    "Configuration simple et rapide",
    "Portable et accessible partout",
    "Compatible avec la plupart des lecteurs multimédia"
  ],
  technicalDetails: [
    "Configuration du serveur SMB sur Android",
    "Optimisation des paramètres réseau pour le streaming 4K",
    "Intégration avec Kodi et autres lecteurs multimédia",
    "Gestion des permissions et de la sécurité",
    "Configuration du Wake Lock pour éviter la mise en veille"
  ],
  status: 'completed',
  timeline: "Janvier 2024",
  articleUrl: "/articles/smb-server"
};