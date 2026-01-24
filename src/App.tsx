import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

// ✅ Contextes et SEO
import { ThemeProvider } from './context/ThemeContext';
import { SEOHead } from './components/SEOHead';

// ✅ Layout Components (Statiques car présents sur toutes les pages)
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';

// ✅ Core Components - Hero reste statique pour optimiser le LCP (Largest Contentful Paint)
import { Hero } from './components/Hero';

// --- LAZY LOADING DES COMPOSANTS DE L'ACCUEIL (Below the fold) ---
const Stats = lazy(() => import('./components/Stats').then(module => ({ default: module.Stats })));
const Formation = lazy(() => import('./components/Formation').then(module => ({ default: module.Formation })));
const Projects = lazy(() => import('./components/Projects').then(module => ({ default: module.Projects })));
const Writeups = lazy(() => import('./components/Writeups').then(module => ({ default: module.Writeups })));
const Contact = lazy(() => import('./components/Contact').then(module => ({ default: module.Contact })));
const CareerTimeline = lazy(() => import('./components/CareerTimeline').then(module => ({ default: module.CareerTimeline })));

// --- LAZY LOADING DES UI HELPERS ---
const ProfileModal = lazy(() => import('./components/ProfileModal').then(module => ({ default: module.ProfileModal })));
const ScrollMenu = lazy(() => import('./components/ScrollMenu').then(module => ({ default: module.ScrollMenu })));
const MouseTrail = lazy(() => import('./components/MouseTrail').then(module => ({ default: module.MouseTrail })));
const Terminal = lazy(() => import('./components/Terminal').then(module => ({ default: module.Terminal })));
const AnalyticsTracker = lazy(() => import('./components/AnalyticsTracker').then(module => ({ default: module.AnalyticsTracker })));

// --- LAZY LOADING DES PAGES SECONDAIRES ---
const WriteupsList = lazy(() => import('./components/WriteupsList').then(module => ({ default: module.WriteupsList })));
const ProjectsList = lazy(() => import('./components/ProjectsList').then(module => ({ default: module.ProjectsList })));
const CertificationsList = lazy(() => import('./pages/CertificationsList').then(module => ({ default: module.CertificationsList })));
const WikiPage = lazy(() => import('./pages/WikiPage').then(module => ({ default: module.WikiPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(module => ({ default: module.LegalPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

// Articles et Writeups
const WriteupPage = lazy(() => import('./pages/WriteupPage').then(module => ({ default: module.WriteupPage })));
const ArticlePage = lazy(() => import('./pages/ArticlePage').then(module => ({ default: module.ArticlePage })));
const ADArticlePage = lazy(() => import('./pages/ADArticlePage').then(module => ({ default: module.ADArticlePage })));
const SteamDeckArticlePage = lazy(() => import('./pages/SteamDeckArticlePage').then(module => ({ default: module.SteamDeckArticlePage })));
const ExegolArticlePage = lazy(() => import('./pages/ExegolArticlePage').then(module => ({ default: module.ExegolArticlePage })));
const LinuxMintArticlePage = lazy(() => import('./pages/LinuxMintArticlePage').then(module => ({ default: module.LinuxMintArticlePage })));
const CPTSJourneyArticlePage = lazy(() => import('./pages/CPTSJourneyArticlePage').then(module => ({ default: module.CPTSJourneyArticlePage })));
const DogWriteupPage = lazy(() => import('./pages/DogWriteupPage').then(module => ({ default: module.DogWriteupPage })));
const HomeLabArticlePage = lazy(() => import('./pages/HomeLabArticlePage'));

// Admin & Tools
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const SitemapGeneratorPage = lazy(() => import('./pages/SitemapGeneratorPage').then(module => ({ default: module.SitemapGeneratorPage })));
const AdminTrollPage = lazy(() => import('./pages/AdminTrollPage').then(module => ({ default: module.AdminTrollPage })));

// Fallback léger pour les sections de l'accueil
const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
  </div>
);

interface AnimatedRoutesProps {
  isLoaded: boolean;
  setShowProfile: (show: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const AnimatedRoutes = ({
  isLoaded,
  setShowProfile,
  activeSection,
  setActiveSection
}: AnimatedRoutesProps) => {
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
              <Suspense fallback={null}>
                <ScrollMenu activeSection={activeSection} setActiveSection={setActiveSection} />
              </Suspense>
              
              <PageTransition>
                <div id="home">
                  <Hero isLoaded={isLoaded} setShowProfile={setShowProfile} />
                </div>

                {/* Chargement progressif des sections */}
                <Suspense fallback={<SectionLoader />}>
                  <div id="stats"><Stats /></div>
                  <div id="formation"><Formation /></div>
                  <CareerTimeline />
                  <div id="projects"><Projects /></div>
                  <div id="writeups"><Writeups /></div>
                  <div id="contact"><Contact /></div>
                </Suspense>
              </PageTransition>
            </>
          } />

          {/* LISTES & PAGES SECONDAIRES */}
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
          <Route path="/articles/homelab-infrastructure-deep-dive" element={<PageTransition><HomeLabArticlePage /></PageTransition>} />
          
          {/* ADMIN & TOOLS */}
          <Route path="/admin/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
          <Route path="/admin/sitemap-generator" element={<PageTransition><SitemapGeneratorPage /></PageTransition>} />

          {/* ROUTES TROLL */}
          <Route path="/admin" element={<PageTransition><AdminTrollPage /></PageTransition>} />
          <Route path="/wp-admin" element={<PageTransition><AdminTrollPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><AdminTrollPage /></PageTransition>} />

          {/* PAGES LEGALES */}
          <Route path="/mentions-legales" element={<PageTransition><LegalPage /></PageTransition>} />

          {/* CATCH-ALL 404 */}
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
    <ThemeProvider> 
      <Router>
        <div className="min-h-screen relative text-text bg-background overflow-hidden selection:bg-violet-500/30 transition-colors duration-300">
          
          <SEOHead />
          
          {/* UI Helpers chargés en lazy pour ne pas alourdir le thread principal au démarrage */}
          <Suspense fallback={null}>
            <AnalyticsTracker />
            <Terminal />
            <MouseTrail />
          </Suspense>

          <Header setShowProfile={setShowProfile} setActiveSection={setActiveSection} activeSection={activeSection} />
          
          <AnimatedRoutes
            isLoaded={isLoaded}
            setShowProfile={setShowProfile}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />

          <Footer />
          
          <Suspense fallback={null}>
            {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
          </Suspense>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;