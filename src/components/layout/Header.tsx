import React, { useState, useEffect } from 'react';
import { Laptop, Linkedin, Mail, Menu, X, Award, Github, Brain, Sparkles, Sun, Moon } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// ✅ IMPORT DU HOOK DE THEME
import { useTheme } from '../../context/ThemeContext';

const imageUrl = 'https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/photo.jpg';

interface HeaderProps {
  setShowProfile: (show: boolean) => void;
  setActiveSection: (section: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ setShowProfile, setActiveSection, activeSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileAnimating, setIsProfileAnimating] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // ✅ Récupération du thème
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleNavigation = (path: string, section: string) => {
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
    setIsProfileAnimating(true);
    setTimeout(() => {
      setShowProfile(true);
      setIsProfileAnimating(false);
    }, 300);
    setIsMenuOpen(false);
  };

  const menuVariants = {
    closed: { 
      opacity: 0,
      y: "-100%",
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    open: { 
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b 
      ${isMenuOpen 
        ? 'bg-background border-transparent' 
        : scrolled 
          ? 'bg-background/90 backdrop-blur-md border-gray-200/50 dark:border-violet-900/30 shadow-sm dark:shadow-none' 
          : 'bg-transparent border-transparent'
      }`}
      style={{ padding: scrolled || isMenuOpen ? '12px 0' : '20px 0' }}
    >
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between relative z-50">
          {/* Logo & Brand Name */}
          <button 
            onClick={() => handleNavigation('/', 'home')}
            className="flex items-center space-x-2 group"
          >
            <div className="p-2 bg-violet-500/10 rounded-lg group-hover:bg-violet-500/20 transition-colors border border-violet-500/20">
              <Laptop className="w-6 h-6 text-violet-500 transition-transform duration-300 group-hover:-rotate-12" />
            </div>
            
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-lg font-bold tracking-widest font-mono group-hover:text-violet-400 transition-colors text-text">
                TRTNX
              </span>
            </div>
          </button>

          {/* Toggle Menu Mobile & Theme */}
          <div className="flex items-center gap-2 md:hidden">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-surface/50 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-text transition-colors rounded-lg hover:bg-surface/50"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center space-x-4">
            <Link
              to="/writeups"
              className={`px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-surface/50 ${location.pathname === '/writeups' ? 'text-violet-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveSection('writeups')}
            >
              Write-ups
            </Link>
            <Link
              to="/projects"
              className={`px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-surface/50 ${location.pathname === '/projects' ? 'text-violet-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveSection('projects')}
            >
              Projects
            </Link>

            {/* Wiki Badge */}
            <Link
              to="/wiki"
              onClick={() => setActiveSection('wiki')}
              className="group relative flex items-center justify-center mx-1"
            >
              <div className="absolute inset-0 bg-violet-500 rounded-full blur opacity-10 group-hover:opacity-30 animate-pulse transition-opacity"></div>
              <div className={`
                relative px-3 py-1.5 rounded-full flex items-center gap-2 border transition-all duration-300
                ${location.pathname === '/wiki' 
                  ? 'bg-surface border-violet-500 text-violet-500 dark:text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                  : 'bg-surface/50 border-gray-200 dark:border-violet-500/20 text-gray-500 dark:text-gray-400 hover:text-violet-500 dark:hover:text-violet-300 hover:border-violet-500/50'
                }
              `}>
                <Brain className={`w-3.5 h-3.5 ${location.pathname === '/wiki' ? 'text-violet-500 dark:text-violet-400' : 'text-gray-400 group-hover:text-violet-400'} transition-colors`} />
                <span className="text-[11px] font-bold tracking-wider uppercase">Wiki</span>
                <Sparkles className="w-2.5 h-2.5 text-yellow-500 dark:text-yellow-300 animate-pulse" />
              </div>
            </Link>

            <button
              onClick={handleProfileClick}
              className={`mx-2 flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-full hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 border border-white/10 transform hover:scale-105`}
            >
              <img src={imageUrl} alt="Profile" className="w-6 h-6 rounded-full border border-white/30" />
              <span className="font-semibold text-sm">Mon Profil</span>
            </button>

            <Link
              to="/certifications"
              className={`flex items-center gap-2 px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-surface/50 ${location.pathname === '/certifications' ? 'text-violet-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveSection('certifications')}
            >
              <Award className="w-4 h-4" />
              <span>Certifications</span>
            </Link>

            {/* ✅ BOUTON THEME DESKTOP */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-surface border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-violet-500 hover:border-violet-500 transition-all active:scale-95"
              aria-label="Toggle Theme"
              title={theme === 'dark' ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => handleNavigation('/', 'contact')}
              className={`px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-surface/50 ${activeSection === 'contact' ? 'text-violet-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Contact
            </button>
          </div>

          {/* Socials Desktop */}
          <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-white/10 ml-4">
            <a 
              href="https://github.com/Trbarry" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-text hover:bg-surface/50 p-2.5 rounded-lg transition-all"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6" />
            </a>
            <a 
              href="https://www.linkedin.com/in/tristan-barry-43b91b330/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-blue-500 hover:bg-surface/50 p-2.5 rounded-lg transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a 
              href="mailto:tr.barrypro@gmail.com" 
              className="text-gray-400 hover:text-red-500 hover:bg-surface/50 p-2.5 rounded-lg transition-all"
              aria-label="Email"
            >
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 bg-background z-40 md:hidden pt-24 px-6 overflow-y-auto"
          >
            <div className="flex flex-col h-full pb-10">
              <div className="mb-8">
                <button
                  onClick={handleProfileClick}
                  className="w-full bg-violet-500 text-white px-6 py-4 rounded-xl hover:bg-violet-600 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-violet-500/20"
                >
                  <img src={imageUrl} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white/20" />
                  <span className="font-bold text-lg">Mon Profil</span>
                </button>
              </div>

              <div className="flex flex-col space-y-2 mb-auto">
                <Link
                  to="/writeups"
                  onClick={() => { setIsMenuOpen(false); setActiveSection('writeups'); }}
                  className="text-xl font-medium uppercase tracking-wider text-center py-4 border-b border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-violet-400"
                >
                  Write-ups
                </Link>
                <Link
                  to="/projects"
                  onClick={() => { setIsMenuOpen(false); setActiveSection('projects'); }}
                  className="text-xl font-medium uppercase tracking-wider text-center py-4 border-b border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-violet-400"
                >
                  Projects
                </Link>
                <Link
                  to="/wiki"
                  onClick={() => { setIsMenuOpen(false); setActiveSection('wiki'); }}
                  className="flex items-center justify-center gap-2 text-xl font-medium uppercase tracking-wider text-center py-4 border-b border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-violet-400"
                >
                  <Brain className="w-5 h-5" />
                  Wiki
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </Link>
                <Link
                  to="/certifications"
                  onClick={() => { setIsMenuOpen(false); setActiveSection('certifications'); }}
                  className="flex items-center justify-center gap-2 text-xl font-medium uppercase tracking-wider text-center py-4 border-b border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-violet-400"
                >
                  <Award className="w-5 h-5" />
                  Certifications
                </Link>
                <button
                  onClick={() => handleNavigation('/', 'contact')}
                  className="text-xl font-medium uppercase tracking-wider text-center py-4 text-gray-500 dark:text-gray-400 hover:text-violet-400"
                >
                  Contact
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8">
                <a href="https://github.com/Trbarry" target="_blank" rel="noopener noreferrer" className="p-4 bg-surface rounded-full text-gray-500 dark:text-gray-400 hover:text-text hover:bg-violet-500 transition-all border border-gray-200 dark:border-white/5"><Github className="w-6 h-6" /></a>
                <a href="https://www.linkedin.com/in/tristan-barry-43b91b330/" target="_blank" rel="noopener noreferrer" className="p-4 bg-surface rounded-full text-gray-500 dark:text-gray-400 hover:text-text hover:bg-blue-600 transition-all border border-gray-200 dark:border-white/5"><Linkedin className="w-6 h-6" /></a>
                <a href="mailto:tr.barrypro@gmail.com" className="p-4 bg-surface rounded-full text-gray-500 dark:text-gray-400 hover:text-text hover:bg-red-500 transition-all border border-gray-200 dark:border-white/5"><Mail className="w-6 h-6" /></a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};