import React, { useState } from 'react';
import { Laptop, Linkedin, Mail, Menu, X, Award } from 'lucide-react';
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
    <header className="fixed top-0 w-full bg-[#0a0a0f] z-50 border-b border-violet-900/20">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 z-20 group"
          >
            <Laptop className="w-8 h-8 text-violet-500 transition-transform duration-300 group-hover:-rotate-12" />
            <span className="text-xl font-bold tracking-wider group-hover:text-violet-400 transition-colors">
              Mon Portfolio
            </span>
          </button>

          {/* Menu mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden z-20 text-gray-400 hover:text-violet-400 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Menu overlay mobile */}
          <div className={`fixed inset-0 bg-[#0a0a0f] transition-all duration-300 md:hidden
            ${isMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-full'}`}>
            <div className="flex flex-col items-center justify-start pt-24 h-full space-y-8 bg-[#0a0a0f] px-6">
              {/* Mon Profil Button - Mobile */}
              <button
                onClick={handleProfileClick}
                className={`w-full bg-violet-500 text-white px-6 py-3 rounded-lg
                         hover:bg-violet-600 transition-all duration-300 
                         transform hover:scale-105 flex items-center justify-center gap-2
                         ${isProfileAnimating ? 'scale-95 opacity-80' : ''}`}
              >
                <img 
                  src={imageUrl}
                  alt="Profile"
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-semibold">Mon Profil</span>
              </button>

              {/* Navigation Links - Mobile */}
              <Link
                to="/writeups"
                className={`text-lg uppercase tracking-wider hover:text-violet-400 transition-colors w-full text-center
                  ${location.pathname === '/writeups' ? 'text-violet-500' : 'text-gray-400'}`}
                onClick={() => {
                  setActiveSection('writeups');
                  setIsMenuOpen(false);
                }}
              >
                Write-ups
              </Link>
              <Link
                to="/projects"
                className={`text-lg uppercase tracking-wider hover:text-violet-400 transition-colors w-full text-center
                  ${location.pathname === '/projects' ? 'text-violet-500' : 'text-gray-400'}`}
                onClick={() => {
                  setActiveSection('projects');
                  setIsMenuOpen(false);
                }}
              >
                Projects
              </Link>
              <Link
                to="/certifications"
                className={`text-lg uppercase tracking-wider hover:text-violet-400 transition-colors flex items-center justify-center gap-2 w-full
                  ${location.pathname === '/certifications' ? 'text-violet-500' : 'text-gray-400'}`}
                onClick={() => {
                  setActiveSection('certifications');
                  setIsMenuOpen(false);
                }}
              >
                <Award className="w-5 h-5" />
                <span>Certifications</span>
              </Link>
              <button
                onClick={scrollToContact}
                className={`text-lg uppercase tracking-wider hover:text-violet-400 transition-colors w-full text-center
                  ${activeSection === 'contact' ? 'text-violet-500' : 'text-gray-400'}`}
              >
                Contact
              </button>
            </div>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-8">
            {/* Navigation Links - Desktop */}
            <Link
              to="/writeups"
              className={`text-sm uppercase tracking-wider hover:text-violet-400 transition-colors
                ${location.pathname === '/writeups' ? 'text-violet-500' : 'text-gray-400'}`}
              onClick={() => setActiveSection('writeups')}
            >
              Write-ups
            </Link>
            <Link
              to="/projects"
              className={`text-sm uppercase tracking-wider hover:text-violet-400 transition-colors
                ${location.pathname === '/projects' ? 'text-violet-500' : 'text-gray-400'}`}
              onClick={() => setActiveSection('projects')}
            >
              Projects
            </Link>

            {/* Mon Profil Button - Desktop (Centered) */}
            <button
              onClick={handleProfileClick}
              className={`flex items-center gap-2 px-6 py-2 bg-violet-500 text-white rounded-lg
                       hover:bg-violet-600 transition-all duration-300 transform
                       shadow-lg hover:shadow-violet-500/25
                       ${isProfileAnimating ? 'scale-95 opacity-80' : 'hover:scale-105'}`}
            >
              <img 
                src={imageUrl}
                alt="Profile"
                className="w-6 h-6 rounded-full"
              />
              <span className="font-semibold">Mon Profil</span>
            </button>

            <Link
              to="/certifications"
              className={`text-sm uppercase tracking-wider hover:text-violet-400 transition-colors flex items-center gap-2
                ${location.pathname === '/certifications' ? 'text-violet-500' : 'text-gray-400'}`}
              onClick={() => setActiveSection('certifications')}
            >
              <Award className="w-4 h-4" />
              <span>Certifications</span>
            </Link>
            <button
              onClick={scrollToContact}
              className={`text-sm uppercase tracking-wider hover:text-violet-400 transition-colors
                ${activeSection === 'contact' ? 'text-violet-500' : 'text-gray-400'}`}
            >
              Contact
            </button>
          </div>

          {/* Social Links */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="https://www.linkedin.com/in/tristan-barry-43b91b330/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="hover:text-violet-400 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="mailto:tr.barrypro@gmail.com" 
               className="hover:text-violet-400 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};