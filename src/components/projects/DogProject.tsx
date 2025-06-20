import React from 'react';
import { Project } from '../../types/project';

export const DogProject: Project = {
  title: "Write-Up - Dog (Hack The Box)",
  description: "Machine Linux Easy combinant Git leak, exploitation de CMS Backdrop et élévation de privilèges via un binaire SUID.",
  longDescription: `Cette machine Linux de difficulté Easy combine plusieurs vulnérabilités web classiques avec une chaîne d'exploitation intéressante menant à une compromission complète via un CMS Backdrop. Le parcours inclut la découverte d'un dépôt Git exposé, l'exploitation d'un CMS via upload de module malveillant, et une élévation de privilèges via un binaire SUID.`,
  tags: ["Git Leak", "CMS", "Privilege Escalation", "Backdrop CMS"],
  image: "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/dog.png",
  features: [
    "Exploitation d'un dépôt Git exposé",
    "Upload de module malveillant dans le CMS",
    "Élévation de privilèges via binaire SUID",
    "Documentation détaillée du processus",
    "Analyse des vulnérabilités"
  ],
  technicalDetails: [
    "Analyse et extraction du dépôt Git",
    "Exploitation du CMS Backdrop",
    "Techniques de post-exploitation",
    "Analyse de binaires SUID",
    "Méthodologie de documentation"
  ],
  status: 'completed',
  timeline: "Mars 2025",
  articleUrl: "/writeups/dog"
};