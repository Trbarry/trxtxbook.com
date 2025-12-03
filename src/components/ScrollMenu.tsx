import React, { useEffect } from 'react';
import { Home, BarChart2, BookOpen, FolderGit2, Terminal, Mail } from 'lucide-react';

interface ScrollMenuProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const ScrollMenu: React.FC<ScrollMenuProps> = ({ activeSection, setActiveSection }) => {
  
  const menuItems = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'formation', icon: BookOpen, label: 'Formation' },
    { id: 'projects', icon: FolderGit2, label: 'Projets' },
    { id: 'writeups', icon: Terminal, label: 'Write-ups' },
    { id: 'contact', icon: Mail, label: 'Contact' }
  ];

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset pour compenser le header fixe
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Point de déclenchement (1/3 de l'écran)
          const triggerPoint = window.innerHeight / 3;

          for (const item of menuItems) {
            const element = document.getElementById(item.id);
            if (element) {
              const rect = element.getBoundingClientRect();
              // Si le haut de l'élément est au-dessus du trigger point 
              // ET que le bas est en dessous, c'est la section active
              if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
                setActiveSection((prev) => (prev !== item.id ? item.id : prev));
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection]);

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4">
      {menuItems.map((item) => {
        const isActive = activeSection === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => handleScrollTo(item.id)}
            className="group relative flex items-center justify-end"
            aria-label={item.label}
          >
            {/* Label (Tooltip) */}
            <span 
              className={`absolute right-10 px-2 py-1 rounded bg-[#1a1a1f] border border-white/10 text-xs font-medium text-white
                transition-all duration-300 transform origin-right
                ${isActive ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}
              `}
            >
              {item.label}
            </span>

            {/* Indicateur / Icône */}
            <div 
              className={`p-2 rounded-full border transition-all duration-300
                ${isActive 
                  ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-110' 
                  : 'bg-[#1a1a1f]/50 border-white/10 text-gray-500 hover:text-white hover:border-violet-500/50 hover:bg-[#1a1a1f]'
                }
              `}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
            </div>
          </button>
        );
      })}
    </div>
  );
};