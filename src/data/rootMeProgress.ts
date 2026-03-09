// Data scraped from https://www.root-me.org/Jecurl
export const ROOTME_STATS = {
  rank:    6183,
  points:  2060,
  solved:  104,
  total:   604,
  pct:     17,
  ctf:     4,
  badges:  3,
};

export interface RootMeCategory {
  name: string;
  pct:  number;
}

export const ROOTME_CATEGORIES: RootMeCategory[] = [
  { name: 'Web - Serveur',    pct: 49 },
  { name: 'Web - Client',     pct: 40 },
  { name: 'Réseau',           pct: 40 },
  { name: 'Forensic',         pct: 20 },
  { name: 'Cracking',         pct: 12 },
  { name: 'Stéganographie',   pct: 8  },
  { name: 'Réaliste',         pct: 4  },
  { name: 'Cryptanalyse',     pct: 2  },
  { name: 'App - Système',    pct: 0  },
  { name: 'App - Script',     pct: 0  },
  { name: 'Programmation',    pct: 0  },
];
