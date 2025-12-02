import React, { useEffect, useState } from 'react';
import { Target, Award, Code, Mail, User, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollMenuProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const ScrollMenu: React.FC<ScrollMenuProps> = ({ activeSection, setActiveSection }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { id: 'home', label: 'Identity', icon: User },
    { id: 'stats', label: 'Stats', icon: Target },
    { id: 'formation', label: 'Cursus', icon: Award },
    { id: 'projects', label: 'Projets', icon: Code },
    { id: 'writeups', label: 'Archives', icon: Terminal },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];

  // Gestion du Scroll (Détection Section Active)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const item of menuItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.offsetTop;
          const bottom = top + element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveSection(item.id);
            break; 
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerOffset = 100;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-6">
      
      {/* Ligne Guide Discrète (Optionnelle, pour lier les points) */}
      <div className="absolute right-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent -z-10" />

      {menuItems.map((item) => {
        const isActive = activeSection === item.id;
        const isHovered = hovered === item.id;

        return (
          <div 
            key={item.id} 
            className="relative flex items-center justify-end group"
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
          >
            
            {/* Label Flottant (Apparition fluide) */}
            <AnimatePresence>
              {(isHovered || isActive) && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute right-14 pointer-events-none"
                >
                  <div className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg backdrop-blur-md border 
                    ${isActive 
                      ? 'bg-violet-500/10 border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                      : 'bg-black/40 border-white/10'
                    }
                  `}>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-violet-300' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                    {/* Petit numéro décoratif */}
                    <span className="text-[10px] font-mono text-gray-600 opacity-50">
                      0{menuItems.indexOf(item) + 1}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton Interactif */}
            <button
              onClick={() => scrollToSection(item.id)}
              className="relative w-10 h-10 flex items-center justify-center outline-none"
              aria-label={`Aller à la section ${item.label}`}
            >
              {/* Cercle Glow Actif */}
              {isActive && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute inset-0 bg-violet-500/20 rounded-full blur-md"
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Indicateur Visuel (Barre ou Point) */}
              <motion.div
                className={`
                  relative z-10 rounded-full transition-colors duration-300
                  ${isActive ? 'bg-violet-400' : 'bg-white/20 group-hover:bg-white/50'}
                `}
                animate={{
                  width: isActive ? 6 : 4,
                  height: isActive ? 24 : 4, // Devient une barre verticale si actif
                  borderRadius: 999
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />

              {/* Icône (Visible uniquement au survol si inactif, ou toujours si actif) */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -right-8 text-violet-500" // Icône déplacée à droite pour style
                  >
                    {/* On peut afficher l'icône ici si on veut, ou la garder minimaliste */}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        );
      })}
    </div>
  );
};