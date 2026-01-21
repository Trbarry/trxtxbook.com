import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

// ✅ IMPORT DU THEME CONTEXT
import { ThemeProvider } from './context/ThemeContext';

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
import { CareerTimeline } from './components/CareerTimeline';

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
const WikiPage = lazy(() => import('./pages/WikiPage').then(module => ({ default: module.WikiPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

// Pages de détail et articles
const WriteupPage = lazy(() => import('./pages/WriteupPage').then(module => ({ default: module.WriteupPage })));
const ArticlePage = lazy(() => import('./pages/ArticlePage').then(module => ({ default: module.ArticlePage })));
const ADArticlePage = lazy(() => import('./pages/ADArticlePage').then(module => ({ default: module.ADArticlePage })));
const SteamDeckArticlePage = lazy(() => import('./pages/SteamDeckArticlePage').then(module => ({ default: module.SteamDeckArticlePage })));
const ExegolArticlePage = lazy(() => import('./pages/ExegolArticlePage').then(module => ({ default: module.ExegolArticlePage })));
const LinuxMintArticlePage = lazy(() => import('./pages/LinuxMintArticlePage').then(module => ({ default: module.LinuxMintArticlePage })));
const CPTSJourneyArticlePage = lazy(() => import('./pages/CPTSJourneyArticlePage').then(module => ({ default: module.CPTSJourneyArticlePage })));
const DogWriteupPage = lazy(() => import('./pages/DogWriteupPage').then(module => ({ default: module.DogWriteupPage })));

// Pages Admin & Tools
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const SitemapGeneratorPage = lazy(() => import('./pages/SitemapGeneratorPage').then(module => ({ default: module.SitemapGeneratorPage })));

// Routes Troll
const AdminTrollPage = lazy(() => import('./pages/AdminTrollPage').then(module => ({ default: module.AdminTrollPage })));

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
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
        </div>
      }>
        <Routes location={location} key={location.pathname}>
          
          {/* PAGE D'ACCUEIL */}
          <Route path="/" element={
            <>
              <ScrollMenu activeSection={activeSection} setActiveSection={setActiveSection} />
              
              <PageTransition>
                <div id="home">
                  <Hero isLoaded={isLoaded} setShowProfile={setShowProfile} />
                </div>
                <ScrollReveal><div id="stats"><Stats /></div></ScrollReveal>
                <ScrollReveal><div id="formation"><Formation /></div></ScrollReveal>
                
                <ScrollReveal><CareerTimeline /></ScrollReveal>

                <ScrollReveal><div id="projects"><Projects /></div></ScrollReveal>
                <ScrollReveal><div id="writeups"><Writeups /></div></ScrollReveal>
                <ScrollReveal><div id="contact"><Contact /></div></ScrollReveal>
              </PageTransition>
            </>
          } />

          {/* LISTES */}
          <Route path="/writeups" element={<PageTransition><WriteupsList /></PageTransition>} />
          <Route path="/projects" element={<PageTransition><ProjectsList /></PageTransition>} />
          <Route path="/certifications" element={<PageTransition><CertificationsList /></PageTransition>} />
          <Route path="/wiki" element={<PageTransition><WikiPage /></PageTransition>} />

          {/* DETAILS DYNAMIQUES */}
          <Route path="/writeups/:slug" element={<PageTransition><WriteupPage /></PageTransition>} />
          <Route path="/writeups/dog" element={<PageTransition><DogWriteupPage /></PageTransition>} />

          {/* ARTICLES STATIQUES */}
          <Route path="/articles/smb-server" element={<PageTransition><ArticlePage /></PageTransition>} />
          <Route path="/articles/ad-network" element={<PageTransition><ADArticlePage /></PageTransition>} />
          <Route path="/articles/steam-deck-kali" element={<PageTransition><SteamDeckArticlePage /></PageTransition>} />
          <Route path="/articles/exegol-docker" element={<PageTransition><ExegolArticlePage /></PageTransition>} />
          <Route path="/articles/linux-mint-revival" element={<PageTransition><LinuxMintArticlePage /></PageTransition>} />
          <Route path="/articles/cpts-journey" element={<PageTransition><CPTSJourneyArticlePage /></PageTransition>} />
          
          {/* ADMIN & TOOLS */}
          <Route path="/admin/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
          <Route path="/admin/sitemap-generator" element={<PageTransition><SitemapGeneratorPage /></PageTransition>} />

          {/* ROUTES TROLL */}
          <Route path="/admin" element={<PageTransition><AdminTrollPage /></PageTransition>} />
          <Route path="/wp-admin" element={<PageTransition><AdminTrollPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><AdminTrollPage /></PageTransition>} />

          {/* CATCH-ALL ROUTE POUR 404 */}
          <Route path="*" element={<NotFoundPage />} />
        
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    setIsLoaded(true);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ThemeProvider> {/* ✅ Enveloppe globale pour le contexte de thème */}
      <Router>
        {/* Ajout des classes de transition et utilisation des variables CSS (bg-background, text-text) */}
        <div className="min-h-screen relative text-text bg-background overflow-hidden selection:bg-violet-500/30 transition-colors duration-300">
          
          <SEOHead />
          <AnalyticsTracker />
          <Terminal />
          <Header setShowProfile={setShowProfile} setActiveSection={setActiveSection} activeSection={activeSection} />
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
    </ThemeProvider>
  );
}

export default App;