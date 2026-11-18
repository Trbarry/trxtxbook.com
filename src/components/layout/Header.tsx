import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Linkedin, Mail, Menu, X, Github, Sun, Moon } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// ✅ IMPORT DU HOOK DE THEME
import { useTheme } from '../../context/ThemeContext';

const imageUrl = 'https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/photo.jpg';

const destinations = [
  { section: 'writeups', label: 'Write-ups' },
  { section: 'articles', label: 'Articles' },
  { section: 'projects', label: 'Projets' },
  { section: 'wiki', label: 'Wiki' },
  { section: 'certifications', label: 'Certifications' },
];

interface HeaderProps {
  setShowProfile: (show: boolean) => void;
  setActiveSection: (section: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ setShowProfile, setActiveSection, activeSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  
  // ✅ Récupération du thème
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!isMenuOpen) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setIsMenuOpen(false);
    };
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [isMenuOpen]);

  const handleNavigation = (section: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        scrollToTarget(section);
      }, 100);
    } else {
      scrollToTarget(section);
    }
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  const scrollToTarget = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const section = document.getElementById(sectionId);
    if (section) {
      const headerOffset = 100;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleProfileClick = () => {
    if (isMenuOpen) menuToggle.current?.focus();
    setIsMenuOpen(false);
    setShowProfile(true);
  };

  return (
    <header
      ref={headerRef}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsMenuOpen(false);
      }}
      onKeyDown={event => {
        if (isMenuOpen && event.key === 'Escape') {
          setIsMenuOpen(false);
          menuToggle.current?.focus();
        }
      }}
      className="fixed top-0 w-full z-50 border-b border-gray-300 dark:border-white/10 bg-background text-text"
    >
      <nav className="container mx-auto px-4 lg:px-6" aria-label="Navigation principale">
        <div className="flex items-center justify-between h-16 relative z-50">
          {/* Logo & Brand Name */}
          <button 
            onClick={() => handleNavigation('home')}
            className="inline-flex shrink-0 items-center gap-2"
            aria-label="TRXTXBook, retour à l'accueil"
          >
            <BookOpen aria-hidden="true" className="w-5 h-5 text-teal-800 dark:text-teal-300" />
            <span className="text-lg font-bold tracking-tight">TRXTX<span className="text-teal-800 dark:text-teal-300">Book</span></span>
          </button>

          {/* Toggle Menu Mobile & Theme */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-surface/50 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400"
                aria-label={theme === 'dark' ? "Passer en mode clair" : "Passer en mode sombre"}
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              ref={menuToggle}
              aria-expanded={isMenuOpen}
              aria-controls={isMenuOpen ? 'mobile-navigation' : undefined}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-text transition-colors rounded-lg hover:bg-surface/50"
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 whitespace-nowrap">
            {destinations.map(({ section, label }) => (
              <NavLink
                key={section}
                to={'/' + section}
                onClick={() => setActiveSection(section)}
                className={({ isActive }) => [
                  'px-2 py-2 text-sm transition-colors hover:text-teal-800 dark:hover:text-teal-300',
                  isActive ? 'text-teal-800 dark:text-teal-300 font-semibold underline underline-offset-8' : 'text-text',
                ].join(' ')}
              >
                {label}
              </NavLink>
            ))}

            <button
              onClick={handleProfileClick}
              className="mx-1 flex items-center gap-2 px-3 py-1.5 border border-teal-800/30 dark:border-teal-300/30 rounded-md bg-surface hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
              aria-label="Ouvrir le profil détaillé"
            >
              <img src={imageUrl} alt="" className="w-6 h-6 rounded-full border border-white/30" />
              <span className="font-semibold text-sm">Mon profil</span>
            </button>

            {/* ✅ BOUTON THEME DESKTOP */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-surface border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-teal-800 dark:hover:text-teal-300 hover:border-teal-700/60 transition-all active:scale-95"
              aria-label={theme === 'dark' ? "Passer en mode clair" : "Passer en mode sombre"}
              title={theme === 'dark' ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => handleNavigation('contact')}
              className={`px-2 py-2 text-sm hover:text-teal-800 dark:hover:text-teal-300 transition-colors ${activeSection === 'contact' ? 'text-teal-800 dark:text-teal-300 font-semibold' : 'text-text'}`}
              aria-label="Aller à la section contact"
            >
              Contact
            </button>
          </div>

          {/* Socials Desktop */}
          <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-white/10 ml-1">
            <a 
              href="https://github.com/Trbarry" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-600 dark:text-gray-300 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-surface p-2.5 rounded-lg transition-all"
              aria-label="Accéder à mon GitHub"
            >
              <Github className="w-6 h-6" />
            </a>
            <a 
              href="https://www.linkedin.com/in/tristan-barry-43b91b330/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-600 dark:text-gray-300 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-surface p-2.5 rounded-lg transition-all"
              aria-label="Accéder à mon LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a 
              href="mailto:tr.barrypro@gmail.com" 
              className="text-gray-600 dark:text-gray-300 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-surface p-2.5 rounded-lg transition-all"
              aria-label="M'envoyer un email"
            >
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <nav id="mobile-navigation" aria-label="Liens du menu mobile" data-lenis-prevent
          className="absolute inset-x-0 top-full lg:hidden bg-background border-b border-gray-200 dark:border-white/10 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain shadow-lg"
        >
          <div className="container mx-auto px-4 pt-2 pb-4">
            <div className="mb-2">
              <button
                onClick={handleProfileClick}
                className="w-full bg-surface text-text border border-teal-800/30 dark:border-teal-300/30 px-4 py-2 rounded-md hover:text-teal-800 dark:hover:text-teal-300 transition-colors flex items-center justify-start gap-3"
                aria-label="Ouvrir mon profil détaillé"
              >
                <img src={imageUrl} alt="" className="w-8 h-8 rounded-full border-2 border-white/20" />
                <span className="font-semibold text-base">Mon profil</span>
              </button>
            </div>

            <div className="flex flex-col">
              {destinations.map(({ section, label }) => (
                <NavLink
                  key={section}
                  to={'/' + section}
                  onClick={() => { setIsMenuOpen(false); setActiveSection(section); }}
                  className={({ isActive }) => [
                    'px-3 py-3 text-base border-b border-gray-200 dark:border-white/10 hover:bg-teal-700/10',
                    isActive ? 'text-teal-800 dark:text-teal-300 font-semibold' : 'text-gray-700 dark:text-gray-300',
                  ].join(' ')}
                >
                  {label}
                </NavLink>
              ))}
              <button
                onClick={() => handleNavigation('contact')}
                className="px-3 py-3 text-base text-left text-gray-700 dark:text-gray-300 hover:bg-teal-700/10"
                aria-label="Aller à la section contact"
              >
                Contact
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <a href="https://github.com/Trbarry" target="_blank" rel="noopener noreferrer" className="p-3 bg-surface rounded-md text-gray-500 dark:text-gray-400 hover:text-teal-800 dark:hover:text-teal-300 transition-all border border-gray-200 dark:border-white/5" aria-label="GitHub"><Github className="w-6 h-6" /></a>
              <a href="https://www.linkedin.com/in/tristan-barry-43b91b330/" target="_blank" rel="noopener noreferrer" className="p-3 bg-surface rounded-md text-gray-500 dark:text-gray-400 hover:text-teal-800 dark:hover:text-teal-300 transition-all border border-gray-200 dark:border-white/5" aria-label="LinkedIn"><Linkedin className="w-6 h-6" /></a>
              <a href="mailto:tr.barrypro@gmail.com" className="p-3 bg-surface rounded-md text-gray-500 dark:text-gray-400 hover:text-teal-800 dark:hover:text-teal-300 transition-all border border-gray-200 dark:border-white/5" aria-label="Email"><Mail className="w-6 h-6" /></a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};
