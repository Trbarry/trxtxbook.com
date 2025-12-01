import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// SEO Component
import { SEOHead } from './components/SEOHead';

// Layout Components (Gardés en statique car toujours affichés)
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';

// Core Components (Page d'accueil - Gardés en statique pour le LCP)
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Formation } from './components/Formation';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import { Writeups } from './components/Writeups';

// UI Components (Gardés en statique car légers ou critiques)
import { ProfileModal } from './components/ProfileModal';
import { ScrollMenu } from './components/ScrollMenu';
import { ScrollReveal } from './components/ScrollReveal';
import { MouseTrail } from './components/MouseTrail';
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { Terminal } from './components/Terminal';

// --- LAZY LOADING DES PAGES SECONDAIRES ---
// Cela divise le bundle JavaScript et accélère le chargement initial
const WriteupsList = lazy(() => import('./components/WriteupsList').then(module => ({ default: module.WriteupsList })));
const ProjectsList = lazy(() => import('./components/ProjectsList').then(module => ({ default: module.ProjectsList })));
const CertificationsList = lazy(() => import('./pages/CertificationsList').then(module => ({ default: module.CertificationsList })));

// Pages de détail et articles
const WriteupPage = lazy(() => import('./pages/WriteupPage').then(module => ({ default: module.WriteupPage })));
const DogWriteupPage = lazy(() => import('./pages/DogWriteupPage').then(module => ({ default: module.DogWriteupPage }))); // Gardé si besoin, mais normalement remplacé par WriteupPage dynamique
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
    // mode="wait" assure que l'ancienne page a fini de disparaitre avant que la nouvelle n'arrive
    <AnimatePresence mode="wait">
      {/* Suspense gère l'état de chargement des composants Lazy */}
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
        </div>
      }>
        <Routes location={location} key={location.pathname}>
          
          {/* PAGE D'ACCUEIL (Chargée statiquement) */}
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

          {/* LISTES (Lazy Loaded) */}
          <Route path="/writeups" element={<PageTransition><WriteupsList /></PageTransition>} />
          <Route path="/projects" element={<PageTransition><ProjectsList /></PageTransition>} />
          <Route path="/certifications" element={<PageTransition><CertificationsList /></PageTransition>} />

          {/* DETAILS DYNAMIQUES (Le coeur de ton nouveau système) */}
          <Route path="/writeups/:slug" element={<PageTransition><WriteupPage /></PageTransition>} />
          
          {/* Ancienne route statique Dog supprimée volontairement pour forcer le dynamique */}
          {/* <Route path="/writeups/dog" element={<PageTransition><DogWriteupPage /></PageTransition>} /> */}
          
          {/* ARTICLES STATIQUES (Lazy Loaded) */}
          <Route path="/articles/smb-server" element={<PageTransition><ArticlePage /></PageTransition>} />
          <Route path="/articles/ad-network" element={<PageTransition><ADArticlePage /></PageTransition>} />
          <Route path="/articles/steam-deck-kali" element={<PageTransition><SteamDeckArticlePage /></PageTransition>} />
          <Route path="/articles/exegol-docker" element={<PageTransition><ExegolArticlePage /></PageTransition>} />
          <Route path="/articles/linux-mint-revival" element={<PageTransition><LinuxMintArticlePage /></PageTransition>} />
          <Route path="/articles/cpts-journey" element={<PageTransition><CPTSJourneyArticlePage /></PageTransition>} />
          
          {/* ADMIN (Lazy Loaded) */}
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

  useEffect(() => {
    setIsLoaded(true);
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
