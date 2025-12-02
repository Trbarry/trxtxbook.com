import React, { useState, useEffect } from 'react';
import { Laptop, Linkedin, Mail, Menu, X, Award, Github } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Import de la librairie d'animation

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

  // Gestion du scroll pour le fond du header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Blocage du scroll du body quand le menu est ouvert
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

  // Variantes d'animation pour le menu
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
      className={`fixed top-0 w-full z-50 transition-colors duration-300 border-b 
      ${isMenuOpen 
        ? 'bg-[#0a0a0f] border-transparent' // Fond noir opaque si menu ouvert
        : scrolled 
          ? 'bg-[#0a0a0f]/90 backdrop-blur-md border-violet-900/30' 
          : 'bg-[#0a0a0f] border-transparent'
      }`}
      style={{ padding: scrolled || isMenuOpen ? '12px 0' : '20px 0' }}
    >
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between relative z-50">
          {/* Logo */}
          <button 
            onClick={() => handleNavigation('/', 'home')}
            className="flex items-center space-x-2 group"
          >
            <div className="p-2 bg-violet-500/10 rounded-lg group-hover:bg-violet-500/20 transition-colors">
              <Laptop className="w-6 h-6 text-violet-500 transition-transform duration-300 group-hover:-rotate-12" />
            </div>
            <span className="text-lg font-bold tracking-wider group-hover:text-violet-400 transition-colors hidden sm:block">
              Tristan Barry
            </span>
          </button>

          {/* Toggle Menu Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center space-x-4">
            <Link
              to="/writeups"
              className={`px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-white/5 ${location.pathname === '/writeups' ? 'text-violet-500 font-semibold' : 'text-gray-400'}`}
              onClick={() => setActiveSection('writeups')}
            >
              Write-ups
            </Link>
            <Link
              to="/projects"
              className={`px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-white/5 ${location.pathname === '/projects' ? 'text-violet-500 font-semibold' : 'text-gray-400'}`}
              onClick={() => setActiveSection('projects')}
            >
              Projects
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
              className={`flex items-center gap-2 px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-white/5 ${location.pathname === '/certifications' ? 'text-violet-500 font-semibold' : 'text-gray-400'}`}
              onClick={() => setActiveSection('certifications')}
            >
              <Award className="w-4 h-4" />
              <span>Certifications</span>
            </Link>
            <button
              onClick={() => handleNavigation('/', 'contact')}
              className={`px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-white/5 ${activeSection === 'contact' ? 'text-violet-500 font-semibold' : 'text-gray-400'}`}
            >
              Contact
            </button>
          </div>

          {/* Socials Desktop */}
          <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-white/10 ml-4">
            <a href="https://github.com/Trbarry" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"><Github className="w-5 h-5" /></a>
            <a href="https://www.linkedin.com/in/tristan-barry-43b91b330/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 hover:bg-white/10 p-2 rounded-lg transition-all"><Linkedin className="w-5 h-5" /></a>
            <a href="mailto:tr.barrypro@gmail.com" className="text-gray-400 hover:text-red-400 hover:bg-white/10 p-2 rounded-lg transition-all"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY - Animation gérée par Framer Motion */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 bg-[#0a0a0f] z-40 md:hidden pt-24 px-6 overflow-y-auto"
          >
            <div className="flex flex-col h-full pb-10">
              {/* Mon Profil Button */}
              <div className="mb-8">
                <button
                  onClick={handleProfileClick}
                  className="w-full bg-violet-500 text-white px-6 py-4 rounded-xl hover:bg-violet-600 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-violet-500/20"
                >
                  <img src={imageUrl} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white/20" />
                  <span className="font-bold text-lg">Mon Profil</span>
                </button>
              </div>

              {/* Liens de Navigation */}
              <div className="flex flex-col space-y-2 mb-auto">
                <Link
                  to="/writeups"
                  onClick={() => { setIsMenuOpen(false); setActiveSection('writeups'); }}
                  className="text-xl font-medium uppercase tracking-wider text-center py-4 border-b border-white/5 text-gray-400 hover:text-violet-400"
                >
                  Write-ups
                </Link>
                <Link
                  to="/projects"
                  onClick={() => { setIsMenuOpen(false); setActiveSection('projects'); }}
                  className="text-xl font-medium uppercase tracking-wider text-center py-4 border-b border-white/5 text-gray-400 hover:text-violet-400"
                >
                  Projects
                </Link>
                <Link
                  to="/certifications"
                  onClick={() => { setIsMenuOpen(false); setActiveSection('certifications'); }}
                  className="flex items-center justify-center gap-2 text-xl font-medium uppercase tracking-wider text-center py-4 border-b border-white/5 text-gray-400 hover:text-violet-400"
                >
                  <Award className="w-5 h-5" />
                  Certifications
                </Link>
                <button
                  onClick={() => handleNavigation('/', 'contact')}
                  className="text-xl font-medium uppercase tracking-wider text-center py-4 text-gray-400 hover:text-violet-400"
                >
                  Contact
                </button>
              </div>

              {/* Socials */}
              <div className="flex items-center justify-center gap-6 mt-8">
                <a href="https://github.com/Trbarry" target="_blank" rel="noopener noreferrer" className="p-4 bg-[#1a1a1f] rounded-full text-gray-400 hover:text-white hover:bg-violet-500 transition-all border border-white/5"><Github className="w-6 h-6" /></a>
                <a href="https://www.linkedin.com/in/tristan-barry-43b91b330/" target="_blank" rel="noopener noreferrer" className="p-4 bg-[#1a1a1f] rounded-full text-gray-400 hover:text-white hover:bg-blue-600 transition-all border border-white/5"><Linkedin className="w-6 h-6" /></a>
                <a href="mailto:tr.barrypro@gmail.com" className="p-4 bg-[#1a1a1f] rounded-full text-gray-400 hover:text-white hover:bg-red-500 transition-all border border-white/5"><Mail className="w-6 h-6" /></a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};