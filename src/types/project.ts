import { Project } from '../../types/project';

export const HomeLabProject: Project = {
  id: "homelab-infrastructure",
  title: "HomeLab Ecosystem & Edge Computing",
  description: "Architecture de virtualisation avec segmentation réseau L3 et traitement de flux 4K HDR en temps réel.",
  longDescription: "Conception d'un environnement de calcul hybride orienté cybersécurité. Ce projet documente l'implémentation d'un hyperviseur Proxmox VE, d'une micro-segmentation réseau via OPNsense, et d'un pipeline de traitement de signal complexe pour un système Ambilight DIY.",
  tags: ["Proxmox", "OPNsense", "Docker", "Network Security", "VLAN", "Hardware Engineering"],
  image: "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/Project-Tiny.webp", // Hero Image
  features: [
    "Architecture Zero-Trust via segmentation VLAN stricte",
    "Routage et Firewalling virtualisés sous OPNsense",
    "Pipeline de traitement vidéo 4K HDR (Latency < 15ms)",
    "Orchestration de services via Docker Compose",
    "Hardware Acceleration (QuickSync) pour le transcodage média"
  ],
  technicalDetails: [
    "Host: Lenovo M720q Tiny (i5-8400T / 24GB RAM)",
    "Hypervisor: Proxmox VE (Kernel 6.x)",
    "Networking: OPNsense VM + Managed Switch (802.1Q)",
    "Processing: Hyperion.ng (LXC Passthrough)",
    "IoT: ESP32 / WLED via Distributed Display Protocol (DDP)",
    "Storage: NVMe Boot + Dedicated Media HDD"
  ],
  status: 'in-progress',
  timeline: "2025 - Présent",
  articleUrl: "/articles/homelab-infrastructure-deep-dive"
};