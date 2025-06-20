import React, { useEffect, useState } from 'react';
import { Target, Award, Code, Mail, User } from 'lucide-react';

interface ScrollMenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface ScrollMenuProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const ScrollMenu: React.FC<ScrollMenuProps> = ({ activeSection, setActiveSection }) => {
  const [progress, setProgress] = useState(0);

  const menuItems: ScrollMenuItem[] = [
    { id: 'home', label: 'Présentation', icon: User },
    { id: 'stats', label: 'Plateformes', icon: Target },
    { id: 'formation', label: 'Formation', icon: Award },
    { id: 'projects', label: 'Projets', icon: Code },
    { id: 'writeups', label: 'Write-ups', icon: Target },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setProgress(scrolled);

      // Find current section
      const sections = menuItems.map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
      }));

      const currentSection = sections.find(section => {
        if (!section.element) return false;
        const rect = section.element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerOffset = 80;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40">
      {/* Progress Bar */}
      <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-violet-900/20 rounded-full">
        <div 
          className="w-full bg-violet-500 rounded-full transition-all duration-300"
          style={{ height: `${progress}%` }}
        />
      </div>

      {/* Navigation Dots */}
      <div className="relative space-y-6">
        {menuItems.map((item) => (
          <div key={item.id} className="group relative">
            {/* Label tooltip */}
            <div className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 
                          bg-[#1a1a1f]/90 backdrop-blur-sm rounded-lg border border-violet-900/20
                          transition-all duration-300 whitespace-nowrap
                          ${activeSection === item.id ? 'opacity-100 translate-x-0' : 
                            'opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0'}`}>
              <span className="text-sm font-medium">{item.label}</span>
            </div>

            {/* Navigation dot */}
            <button
              onClick={() => scrollToSection(item.id)}
              className={`w-4 h-4 rounded-full transition-all duration-300 relative
                       ${activeSection === item.id ? 
                         'bg-violet-500 scale-125' : 
                         'bg-violet-900/20 hover:bg-violet-500/50'}`}
            >
              <item.icon className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2
                                 transition-all duration-300
                                 ${activeSection === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};