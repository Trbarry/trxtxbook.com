const homelabInfrastructure: Project = {
  title: "HomeLab Ecosystem & Edge Computing",
  description: "Infrastructure de virtualisation haute disponibilité intégrant segmentation réseau L3 et traitement de flux 4K HDR.",
  longDescription: "Ce projet documente la conception et le déploiement de mon infrastructure domestique. L'architecture repose sur un hyperviseur Proxmox VE pilotant des services critiques (OPNsense, Docker) et un cas d'étude hardware complexe : un système Ambilight DIY traitant des flux 4K HDR en temps réel avec une latence < 15ms.",
  tags: ["Proxmox", "OPNsense", "Docker", "Network Security", "VLAN", "Hardware Engineering"],
  image: "/projects/homelab-infra.jpg",
  features: [
    "Architecture Zero-Trust via segmentation VLAN stricte",
    "Routage et Firewalling virtualisés sous OPNsense",
    "Pipeline de traitement vidéo 4K HDR (Signal Processing)",
    "Gestion centralisée des conteneurs via Docker Compose",
    "Hardware Acceleration (QuickSync) pour le transcodage média"
  ],
  technicalDetails: [
    "Host: Lenovo M720q Tiny (i5-8400T / 24GB RAM)",
    "Hypervisor: Proxmox VE (Kernel 6.x)",
    "Networking: OPNsense VM + Switch Managé (802.1Q Tagging)",
    "Media Chain: Nvidia Shield Pro -> HDMI Downscaler -> USB 3.0 Capture",
    "IoT Controller: ESP32 / WLED via Distributed Display Protocol (DDP)",
    "Storage: NVMe Boot + Dedicated Media HDD Mounts"
  ],
  status: 'in-progress',
  timeline: "2025 - Présent",
  articleUrl: "/articles/homelab-infrastructure-deep-dive"
};