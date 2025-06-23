import React from 'react';
import { Project } from '../../types/project';

export const CPTSJourneyProject: Project = {
  title: "CPTS: My Journey into Professional Pentesting",
  description: "Un parcours de 5 mois vers la certification CPTS - Retour d'expérience détaillé sur une montée en compétences intensive dans le domaine du pentesting.",
  longDescription: `Ce projet retrace mon cheminement sur 5 mois pour obtenir la certification CPTS (Certified Penetration Testing Specialist) de Hack The Box Academy.

Après avoir validé l'eJPT, j'avais soif d'aller plus loin, de structurer mes connaissances, et surtout de consolider ma pratique sur des bases solides. La CPTS s'est imposée comme une évidence : une formation 100% pratique, abordable, avec un contenu dense, exigeant, mais passionnant.

C'est en lisant [cet article de Bruno Rocha Moura](https://www.brunorochamoura.com/posts/cpts-tips/) que j'ai décidé de documenter à mon tour mon expérience de manière approfondie, dans l'espoir d'apporter une valeur similaire à celles et ceux qui envisagent la certification.

Dans cet article, je partage tout ce que j'aurais aimé savoir avant de commencer : ma méthode de travail, les outils que j'ai adoptés (Exegol, Obsidian, Sysreptor), les erreurs que j'ai faites, et les ajustements qui m'ont permis de tenir sur la durée. J'y détaille également le déroulé de l'examen sur 10 jours et la rédaction de mon rapport final (~190 pages), sans filtre.

Ce projet m'a fait grandir techniquement, m'a permis de repousser mes limites mentales, et m'a aidé à acquérir une rigueur que je n'avais pas auparavant. Ce n'est pas une fin, mais une étape majeure dans mon apprentissage en cybersécurité.`,
  tags: ["CPTS", "Pentesting", "Certification", "HTB Academy", "Cybersécurité", "Professional Development"],
  image: "https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets//bandeaucpts.png",
  features: [
    "Parcours détaillé de 5 mois de montée en compétences",
    "Méthodologie d'étude structurée avec planning réaliste",
    "Retour sur les 28 modules de HTB Academy",
    "Déroulé complet de l'examen de 10 jours",
    "Conseils honnêtes pour rédiger un rapport clair et complet",
    "Présentation de mon environnement de travail personnalisé",
    "Gestion du mental, des blocages et de l'organisation",
    "Progression concrète et apprentissage intensif en autonomie"
  ],
  technicalDetails: [
    "Utilisation de Exegol comme environnement de pentest",
    "Documentation avec Obsidian (templates, structure logique)",
    "Rédaction de rapport avec Sysreptor (format CPTS officiel)",
    "Entraînement sur plus de 30 machines Hack The Box ciblées",
    "Approfondissement de l'Active Directory et des techniques réseau",
    "Mise en pratique de méthodologies de test réalistes",
    "Rédaction d'un rapport structuré de 190 pages en anglais",
    "Planification rigoureuse sur 5 mois, avec feedback continu"
  ],
  status: 'completed',
  timeline: "Janvier - Mai 2025",
  articleUrl: "/articles/cpts-journey"
};