import React, { useState, useEffect } from 'react';
import { Laptop, Linkedin, Mail, Menu, X, Award, Github } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Constants
const imageUrl = 'https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/photo.jpg';

// Types
interface HeaderProps {
  setShowProfile: (show: boolean) => void;
  setActiveSection: (section: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ setShowProfile, setActiveSection, activeSection }) => {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileAnimating, setIsProfileAnimating] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Détection du scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Empêcher le scroll de la page quand le menu est ouvert
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

  // Handlers
  const scrollToContact = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          const headerOffset = 100;
          const elementPosition = contactSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        setActiveSection('contact');
      }, 100);
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const headerOffset = 100;
        const elementPosition = contactSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      setActiveSection('contact');
    }
    setIsMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    setActiveSection('home');
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileAnimating(true);
    setTimeout(() => {
      setShowProfile(true);
      setIsProfileAnimating(false);
    }, 300);
    setIsMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b 
      ${isMenuOpen 
        // CORRECTION MAJEURE : Ajout de 'backdrop-blur-none' et forçage de l'opacité totale
        ? `bg-[#0a0a0f] backdrop-blur-none border-transparent ${scrolled ? 'py-3' : 'py-5'}` 
        : scrolled 
          ? 'bg-[#0a0a0f]/90 backdrop-blur-md border-violet-900/30 py-3' 
          : 'bg-[#0a0a0f] border-transparent py-5'
      }`}
    >
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 z-20 group"
          >
            <div className="p-2 bg-violet-500/10 rounded-lg group-hover:bg-violet-500/20 transition-colors">
              <Laptop className="w-6 h-6 text-violet-500 transition-transform duration-300 group-hover:-rotate-12" />
            </div>
            <span className="text-lg font-bold tracking-wider group-hover:text-violet-400 transition-colors hidden sm:block">
              Tristan Barry
            </span>
          </button>

          {/* Menu mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden z-20 text-gray-400 hover:text-violet-400 transition-colors p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Menu overlay mobile */}
          <div className={`fixed inset-0 bg-[#0a0a0f] transition-all duration-300 md:hidden z-10
            ${isMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-full'}`}>
            
            {/* Conteneur scrollable pour le menu mobile */}
            <div className="flex flex-col h-full pt-24 px-6 overflow-y-auto pb-10">
              
              {/* Mon Profil Button - Mobile */}
              <div className="mb-8">
                <button
                    onClick={handleProfileClick}
                    className={`w-full bg-violet-500 text-white px-6 py-4 rounded-xl
                            hover:bg-violet-600 transition-all duration-300 
                            transform active:scale-95 flex items-center justify-center gap-3
                            shadow-lg shadow-violet-500/20
                            ${isProfileAnimating ? 'scale-95 opacity-80' : ''}`}
                >
                    <img 
                    src={imageUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                    />
                    <span className="font-bold text-lg">Mon Profil</span>
                </button>
              </div>

              {/* Navigation Links - Mobile */}
              <div className="flex flex-col space-y-2 mb-auto">
                <Link
                  to="/writeups"
                  className={`text-xl font-medium uppercase tracking-wider hover:text-violet-400 transition-colors w-full text-center py-4 border-b border-white/5
                    ${location.pathname === '/writeups' ? 'text-violet-500 font-bold' : 'text-gray-400'}`}
                  onClick={() => { setActiveSection('writeups'); setIsMenuOpen(false); }}
                >
                  Write-ups
                </Link>
                <Link
                  to="/projects"
                  className={`text-xl font-medium uppercase tracking-wider hover:text-violet-400 transition-colors w-full text-center py-4 border-b border-white/5
                    ${location.pathname === '/projects' ? 'text-violet-500 font-bold' : 'text-gray-400'}`}
                  onClick={() => { setActiveSection('projects'); setIsMenuOpen(false); }}
                >
                  Projects
                </Link>
                <Link
                  to="/certifications"
                  className={`flex items-center justify-center gap-2 text-xl font-medium uppercase tracking-wider hover:text-violet-400 transition-colors w-full py-4 border-b border-white/5
                    ${location.pathname === '/certifications' ? 'text-violet-500 font-bold' : 'text-gray-400'}`}
                  onClick={() => { setActiveSection('certifications'); setIsMenuOpen(false); }}
                >
                  <Award className="w-5 h-5" />
                  <span>Certifications</span>
                </Link>
                <button
                  onClick={scrollToContact}
                  className={`text-xl font-medium uppercase tracking-wider hover:text-violet-400 transition-colors w-full text-center py-4
                    ${activeSection === 'contact' ? 'text-violet-500 font-bold' : 'text-gray-400'}`}
                >
                  Contact
                </button>
              </div>

              {/* Socials Mobile */}
              <div className="flex items-center justify-center gap-6 mt-8">
                <a href="https://github.com/Trbarry" target="_blank" rel="noopener noreferrer" className="p-4 bg-[#1a1a1f] rounded-full text-gray-400 hover:text-white hover:bg-violet-500 transition-all border border-white/5">
                  <Github className="w-6 h-6" />
                </a>
                <a href="https://www.linkedin.com/in/tristan-barry-43b91b330/" target="_blank" rel="noopener noreferrer" className="p-4 bg-[#1a1a1f] rounded-full text-gray-400 hover:text-white hover:bg-blue-600 transition-all border border-white/5">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="mailto:tr.barrypro@gmail.com" className="p-4 bg-[#1a1a1f] rounded-full text-gray-400 hover:text-white hover:bg-red-500 transition-all border border-white/5">
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Menu desktop (inchangé) */}
          <div className="hidden md:flex items-center justify-center space-x-1 lg:space-x-4">
            <Link
              to="/writeups"
              className={`px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-white/5
                ${location.pathname === '/writeups' ? 'text-violet-500 font-semibold' : 'text-gray-400'}`}
              onClick={() => setActiveSection('writeups')}
            >
              Write-ups
            </Link>
            <Link
              to="/projects"
              className={`px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-white/5
                ${location.pathname === '/projects' ? 'text-violet-500 font-semibold' : 'text-gray-400'}`}
              onClick={() => setActiveSection('projects')}
            >
              Projects
            </Link>

            <button
              onClick={handleProfileClick}
              className={`mx-4 flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-full
                       hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 transform
                       border border-white/10
                       ${isProfileAnimating ? 'scale-95 opacity-80' : 'hover:scale-105'}`}
            >
              <img 
                src={imageUrl}
                alt="Profile"
                className="w-6 h-6 rounded-full border border-white/30"
              />
              <span className="font-semibold text-sm">Mon Profil</span>
            </button>

            <Link
              to="/certifications"
              className={`flex items-center gap-2 px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-white/5
                ${location.pathname === '/certifications' ? 'text-violet-500 font-semibold' : 'text-gray-400'}`}
              onClick={() => setActiveSection('certifications')}
            >
              <Award className="w-4 h-4" />
              <span>Certifications</span>
            </Link>
            <button
              onClick={scrollToContact}
              className={`px-3 py-2 text-sm uppercase tracking-wider hover:text-violet-400 transition-colors rounded-lg hover:bg-white/5
                ${activeSection === 'contact' ? 'text-violet-500 font-semibold' : 'text-gray-400'}`}
            >
              Contact
            </button>
          </div>

          {/* Social Links Desktop */}
          <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-white/10 ml-4">
            <a href="https://github.com/Trbarry" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
               title="GitHub">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/tristan-barry-43b91b330/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-gray-400 hover:text-blue-400 hover:bg-white/10 p-2 rounded-lg transition-all"
               title="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="mailto:tr.barrypro@gmail.com" 
               className="text-gray-400 hover:text-red-400 hover:bg-white/10 p-2 rounded-lg transition-all"
               title="Email">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};