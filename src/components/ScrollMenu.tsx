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

  // Gestion du Scroll (Détection Robuste)
  useEffect(() => {
    const handleScroll = () => {
      // Point de déclenchement (1/3 de l'écran)
      const triggerPoint = window.innerHeight / 3;

      for (const item of menuItems) {
        const element = document.getElementById(item.id);
        if (element) {
          // getBoundingClientRect est plus fiable que offsetTop car il donne
          // la position par rapport à la fenêtre visible, ignorant les parents transformés (ScrollReveal)
          const rect = element.getBoundingClientRect();
          
          // Si le haut de l'élément est au-dessus du point de déclenchement
          // ET que le bas de l'élément est encore en dessous
          if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
            setActiveSection(item.id);
            break; 
          }
        }
      }
    };

    // Vérification immédiate + au scroll
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerOffset = 100;
      // Calcul absolu robuste
      const elementPosition = section.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-end gap-6 pointer-events-none">
      {/* pointer-events-none sur le conteneur pour ne pas bloquer les clics en dessous, 
          mais on le réactive sur les boutons (pointer-events-auto) */}
      
      {/* Ligne Guide Discrète */}
      <div className="absolute right-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent -z-10" />

      {menuItems.map((item) => {
        const isActive = activeSection === item.id;
        const isHovered = hovered === item.id;

        return (
          <div 
            key={item.id} 
            className="relative flex items-center justify-end group pointer-events-auto"
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
          >
            
            {/* Label Flottant */}
            <AnimatePresence>
              {(isHovered || isActive) && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute right-14 cursor-pointer"
                  onClick={() => scrollToSection(item.id)}
                >
                  <div className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg backdrop-blur-md border transition-colors duration-300
                    ${isActive 
                      ? 'bg-violet-500/10 border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                      : 'bg-black/60 border-white/10 text-gray-400'
                    }
                  `}>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-violet-300' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
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
              {isActive && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute inset-0 bg-violet-500/20 rounded-full blur-md"
                  transition={{ duration: 0.3 }}
                />
              )}

              <motion.div
                className={`
                  relative z-10 rounded-full transition-colors duration-300
                  ${isActive ? 'bg-violet-400' : 'bg-white/20 group-hover:bg-white/50'}
                `}
                animate={{
                  width: isActive ? 4 : 4,
                  height: isActive ? 24 : 4,
                  borderRadius: 999
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
};