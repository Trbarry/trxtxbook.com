export const PORTSWIGGER_LEVELS = {
  apprentice:  { solved: 36,  total: 59,  pct: 61 },
  practitioner:{ solved: 75,  total: 172, pct: 43 },
  expert:      { solved: 0,   total: 39,  pct: 0  },
  total:       { solved: 111, total: 270, pct: 41 },
};

export interface LabCategory {
  name:   string;
  solved: number;
  total:  number;
}

export const PORTSWIGGER_CATEGORIES: LabCategory[] = [
  { name: 'Access Control',         solved: 13, total: 13 },
  { name: 'Path Traversal',         solved: 6,  total: 6  },
  { name: 'Clickjacking',           solved: 5,  total: 5  },
  { name: 'CORS',                   solved: 3,  total: 3  },
  { name: 'XSS',                    solved: 24, total: 30 },
  { name: 'CSRF',                   solved: 8,  total: 12 },
  { name: 'XXE',                    solved: 6,  total: 9  },
  { name: 'SSRF',                   solved: 4,  total: 7  },
  { name: 'DOM-based',              solved: 5,  total: 7  },
  { name: 'SSTI',                   solved: 5,  total: 7  },
  { name: 'File Upload',            solved: 5,  total: 7  },
  { name: 'SQL Injection',          solved: 11, total: 18 },
  { name: 'HTTP Smuggling',         solved: 8,  total: 21 },
  { name: 'OS Command Injection',   solved: 3,  total: 5  },
  { name: 'Web Cache Deception',    solved: 4,  total: 5  },
  { name: 'Authentication',         solved: 2,  total: 14 },
  { name: 'Web Cache Poisoning',    solved: 0,  total: 13 },
  { name: 'Business Logic',         solved: 0,  total: 12 },
  { name: 'Insecure Deserializ.',   solved: 0,  total: 10 },
  { name: 'Prototype Pollution',    solved: 0,  total: 10 },
  { name: 'JWT',                    solved: 0,  total: 8  },
  { name: 'HTTP Host Header',       solved: 0,  total: 7  },
  { name: 'OAuth',                  solved: 0,  total: 6  },
  { name: 'Race Conditions',        solved: 0,  total: 6  },
  { name: 'GraphQL',                solved: 0,  total: 5  },
  { name: 'API Testing',            solved: 0,  total: 5  },
  { name: 'NoSQL Injection',        solved: 0,  total: 4  },
  { name: 'Web LLM Attacks',        solved: 0,  total: 4  },
  { name: 'Information Disclosure', solved: 0,  total: 5  },
  { name: 'WebSockets',             solved: 0,  total: 3  },
  { name: 'Essential Skills',       solved: 0,  total: 2  },
];

export const MASTERED = PORTSWIGGER_CATEGORIES.filter(c => c.solved === c.total && c.total > 0);

// Top catégories par % de complétion (hors 100%)
export const TOP_CATEGORIES = PORTSWIGGER_CATEGORIES
  .filter(c => c.solved > 0 && c.solved < c.total)
  .sort((a, b) => (b.solved / b.total) - (a.solved / a.total))
  .slice(0, 6);
