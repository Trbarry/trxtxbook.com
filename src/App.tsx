import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

// SEO Component
import { SEOHead } from './components/SEOHead';

// Layout Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';

// Core Components (Page d'accueil)
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Formation } from './components/Formation';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import { Writeups } from './components/Writeups';

// UI Components
import { ProfileModal } from './components/ProfileModal';
import { ScrollMenu } from './components/ScrollMenu';
import { ScrollReveal } from './components/ScrollReveal';
import { MouseTrail } from './components/MouseTrail';
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { Terminal } from './components/Terminal';

// --- LAZY LOADING DES PAGES SECONDAIRES ---
const WriteupsList = lazy(() => import('./components/WriteupsList').then(module => ({ default: module.WriteupsList })));
const ProjectsList = lazy(() => import('./components/ProjectsList').then(module => ({ default: module.ProjectsList })));
const CertificationsList = lazy(() => import('./pages/CertificationsList').then(module => ({ default: module.CertificationsList })));

// Pages de détail et articles
const WriteupPage = lazy(() => import('./pages/WriteupPage').then(module => ({ default: module.WriteupPage })));
const ArticlePage = lazy(() => import('./pages/ArticlePage').then(module => ({ default: module.ArticlePage })));
const ADArticlePage = lazy(() => import('./pages/ADArticlePage').then(module => ({ default: module.ADArticlePage })));
const SteamDeckArticlePage = lazy(() => import('./pages/SteamDeckArticlePage').then(module => ({ default: module.SteamDeckArticlePage })));
const ExegolArticlePage = lazy(() => import('./pages/ExegolArticlePage').then(module => ({ default: module.ExegolArticlePage })));
const LinuxMintArticlePage = lazy(() => import('./pages/LinuxMintArticlePage').then(module => ({ default: module.LinuxMintArticlePage })));
const CPTSJourneyArticlePage = lazy(() => import('./pages/CPTSJourneyArticlePage').then(module => ({ default: module.CPTSJourneyArticlePage })));

// Pages Admin
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const SitemapGeneratorPage = lazy(() => import('./pages/SitemapGeneratorPage').then(module => ({ default: module.SitemapGeneratorPage })));

// Sous-composant pour gérer les transitions de pages
const AnimatedRoutes = ({
  isLoaded,
  setShowProfile,
  activeSection,
  setActiveSection
}: any) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
        </div>
      }>
        <Routes location={location} key={location.pathname}>
          
          {/* PAGE D'ACCUEIL */}
          <Route path="/" element={
            <PageTransition>
              <ScrollMenu activeSection={activeSection} setActiveSection={setActiveSection} />
              <div id="home">
                <Hero isLoaded={isLoaded} setShowProfile={setShowProfile} />
              </div>
              <ScrollReveal><div id="stats"><Stats /></div></ScrollReveal>
              <ScrollReveal><div id="formation"><Formation /></div></ScrollReveal>
              <ScrollReveal><div id="projects"><Projects /></div></ScrollReveal>
              <ScrollReveal><div id="writeups"><Writeups /></div></ScrollReveal>
              <ScrollReveal><div id="contact"><Contact /></div></ScrollReveal>
            </PageTransition>
          } />

          {/* LISTES */}
          <Route path="/writeups" element={<PageTransition><WriteupsList /></PageTransition>} />
          <Route path="/projects" element={<PageTransition><ProjectsList /></PageTransition>} />
          <Route path="/certifications" element={<PageTransition><CertificationsList /></PageTransition>} />

          {/* DETAILS DYNAMIQUES */}
          <Route path="/writeups/:slug" element={<PageTransition><WriteupPage /></PageTransition>} />
          
          {/* ARTICLES STATIQUES */}
          <Route path="/articles/smb-server" element={<PageTransition><ArticlePage /></PageTransition>} />
          <Route path="/articles/ad-network" element={<PageTransition><ADArticlePage /></PageTransition>} />
          <Route path="/articles/steam-deck-kali" element={<PageTransition><SteamDeckArticlePage /></PageTransition>} />
          <Route path="/articles/exegol-docker" element={<PageTransition><ExegolArticlePage /></PageTransition>} />
          <Route path="/articles/linux-mint-revival" element={<PageTransition><LinuxMintArticlePage /></PageTransition>} />
          <Route path="/articles/cpts-journey" element={<PageTransition><CPTSJourneyArticlePage /></PageTransition>} />
          
          {/* ADMIN */}
          <Route path="/admin/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
          <Route path="/admin/sitemap-generator" element={<PageTransition><SitemapGeneratorPage /></PageTransition>} />
        
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // --- INITIALISATION LENIS (SMOOTH SCROLL) ---
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function "easeOutQuart"
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2, // Améliore la réactivité sur mobile
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Initialisation de l'état loaded
    setIsLoaded(true);

    // Nettoyage lors du démontage
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen relative text-gray-100 bg-black overflow-hidden selection:bg-violet-500/30">
        
        <SEOHead />
        <AnalyticsTracker />

        {/* Le Terminal doit être ici pour flotter au-dessus de tout le reste */}
        <Terminal />

        <Header
          setShowProfile={setShowProfile}
          setActiveSection={setActiveSection}
          activeSection={activeSection}
        />

        <MouseTrail />

        <AnimatedRoutes
          isLoaded={isLoaded}
          setShowProfile={setShowProfile}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <Footer />

        {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      </div>
    </Router>
  );
}

export default App;