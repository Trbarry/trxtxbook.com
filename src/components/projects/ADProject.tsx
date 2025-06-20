import React from 'react';
import { Project } from '../../types/project';

export const ADProject: Project = {
  title: "Infrastructure Active Directory Complète",
  description: "Environnement de test AD complet avec Windows Server 2022, pfSense, et machines clientes pour la simulation d'une infrastructure d'entreprise sécurisée",
  longDescription: "Infrastructure complète Active Directory comprenant plusieurs machines virtuelles, des configurations de sécurité variées et des scénarios d'attaque préconfigurés. Cette infrastructure permet de simuler des situations réelles d'entreprise et de pratiquer différentes techniques de pentesting dans un environnement contrôlé.",
  tags: ["Windows Server", "Active Directory", "pfSense", "Virtualisation", "Pentesting"],
  image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=80",
  features: [
    "Infrastructure complète avec Windows Server 2022, pfSense, et clients Windows 11",
    "Segmentation réseau avec VLANs et politiques de sécurité",
    "Monitoring centralisé avec Zabbix et Graylog",
    "Scripts d'automatisation pour le déploiement et la configuration",
    "Environnement de test pour scénarios de pentesting"
  ],
  technicalDetails: [
    "Windows Server 2022 avec Active Directory Domain Services",
    "pfSense pour la gestion du réseau et la sécurité",
    "Monitoring avec Zabbix et Graylog sur Ubuntu Server",
    "Scripts PowerShell pour l'automatisation",
    "Documentation complète du déploiement"
  ],
  status: 'completed',
  timeline: "Janvier 2024 - Février 2024",
  articleUrl: "/articles/ad-network"
};