import React from 'react';
import { Project } from '../../types/project';

export const LinuxMintProject: Project = {
  title: "Linux Mint : Une Bouffée d'Air Frais pour Votre Ancien PC",
  description: "Trop lent sous Windows 11 ? Linux Mint redonne fluidité, sécurité et simplicité à votre PC, même avec seulement 4 Go de RAM.",
  longDescription: `Votre ordinateur équipé d'un processeur Intel i3 et de 4 Go de RAM peine à faire tourner Windows 11 ?
Mises à jour interminables, lenteurs, blocages… Vous n'êtes pas seul.

Linux Mint est une alternative légère, moderne et gratuite, conçue pour offrir une expérience fluide même sur des machines anciennes.
Son interface est intuitive et proche de Windows : aucun apprentissage compliqué, tout est accessible dès le premier démarrage.

Avec Linux Mint, vous pouvez :
- Naviguer sur internet (Firefox, Chrome)
- Rédiger des documents (LibreOffice ou OpenOffice)
- Lire vos mails, regarder des vidéos, gérer vos fichiers — sans ralentissements ni blocages

Le tout avec une sécurité renforcée, des mises à jour légères et un système stable reconnu pour sa fiabilité.
Votre ancien PC peut encore servir efficacement pendant des années.`,
  tags: [
    "Linux Mint",
    "Performance",
    "PC ancien",
    "Alternative Windows",
    "Open Source",
    "Optimisation",
    "Sécurité"
  ],
  image: "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/linux-mint.png",
  features: [
    "Interface familière pour les utilisateurs Windows",
    "Excellente performance même avec 4 Go de RAM",
    "Navigation web fluide (Firefox/Chrome)",
    "Suite bureautique complète (LibreOffice/OpenOffice)",
    "Lecture vidéo fluide, sans saccades",
    "Sécurité native contre les virus",
    "Mises à jour rapides et légères",
    "Installation simple en français"
  ],
  technicalDetails: [
    "Distribution Linux Mint 21.3 (MATE ou XFCE)",
    "Compatible avec processeurs Intel/AMD",
    "Minimum 2 Go RAM (4 Go recommandé)",
    "20 Go d'espace disque requis",
    "Support UEFI et BIOS hérité",
    "Pilotes matériels détectés automatiquement",
    "Compatible avec formats Windows (NTFS, FAT32)"
  ],
  status: "completed",
  timeline: "Mars 2025",
  articleUrl: "/articles/linux-mint-revival"
};