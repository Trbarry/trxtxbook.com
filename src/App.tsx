import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { safeLazy as lazy } from './lib/safeLazy';

// ✅ Contextes et SEO
import { ThemeProvider } from './context/ThemeContext';
import { SEOHead } from './components/SEOHead';

// ✅ Layout Components (Statiques)
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';

// ✅ Hero reste statique pour maximiser le LCP (Largest Contentful Paint)
import { Hero } from './components/Hero';

// --- LAZY LOADING DES SECTIONS DE L'ACCUEIL (Below the fold) ---
const Stats = lazy(() => import('./components/Stats').then(m => ({ default: m.Stats })));
const Formation = lazy(() => import('./components/Formation').then(m => ({ default: m.Formation })));
const Projects = lazy(() => import('./components/Projects').then(m => ({ default: m.Projects })));
const Writeups = lazy(() => import('./components/Writeups').then(m => ({ default: m.Writeups })));
const Articles = lazy(() => import('./components/Articles').then(m => ({ default: m.Articles })));
const Contact = lazy(() => import('./components/Contact').then(m => ({ default: m.Contact })));
const CareerTimeline = lazy(() => import('./components/CareerTimeline').then(m => ({ default: m.CareerTimeline })));

// --- LAZY LOADING DES UI HELPERS ---
const ProfileModal = lazy(() => import('./components/ProfileModal').then(m => ({ default: m.ProfileModal })));
const ScrollMenu = lazy(() => import('./components/ScrollMenu').then(m => ({ default: m.ScrollMenu })));
const MouseTrail = lazy(() => import('./components/MouseTrail').then(m => ({ default: m.MouseTrail })));
const AnalyticsTracker = lazy(() => import('./components/AnalyticsTracker').then(m => ({ default: m.AnalyticsTracker })));
const Terminal = lazy(() => import('./components/Terminal').then(m => ({ default: m.Terminal })));

// --- LAZY LOADING DES PAGES SECONDAIRES ---
const WriteupsList = lazy(() => import('./components/WriteupsList').then(m => ({ default: m.WriteupsList })));
const ProjectsList = lazy(() => import('./components/ProjectsList').then(m => ({ default: m.ProjectsList })));
const CertificationsList = lazy(() => import('./pages/CertificationsList').then(m => ({ default: m.CertificationsList })));
const WikiPage = lazy(() => import('./pages/WikiPage').then(m => ({ default: m.WikiPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(m => ({ default: m.LegalPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Articles et Détails
const WriteupPage = lazy(() => import('./pages/WriteupPage').then(m => ({ default: m.WriteupPage })));
const ArticlesListPage = lazy(() => import('./pages/ArticlesListPage').then(m => ({ default: m.ArticlesListPage })));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage').then(m => ({ default: m.ArticleDetailPage })));
const DogWriteupPage = lazy(() => import('./pages/DogWriteupPage').then(m => ({ default: m.DogWriteupPage })));
const CPTSJourneyArticlePage = lazy(() => import('./pages/CPTSJourneyArticlePage').then(m => ({ default: m.CPTSJourneyArticlePage })));
const ProjectPage = lazy(() => import('./pages/ProjectPage').then(m => ({ default: m.ProjectPage })));
const HomeLabProjectPage = lazy(() => import('./pages/HomeLabProjectPage'));
const ADProjectPage = lazy(() => import('./pages/ADProjectPage').then(m => ({ default: m.ADProjectPage })));
const ExegolProjectPage = lazy(() => import('./pages/ExegolProjectPage').then(m => ({ default: m.ExegolProjectPage })));
const LinuxMintProjectPage = lazy(() => import('./pages/LinuxMintProjectPage').then(m => ({ default: m.LinuxMintProjectPage })));
const SteamDeckProjectPage = lazy(() => import('./pages/SteamDeckProjectPage').then(m => ({ default: m.SteamDeckProjectPage })));
const SMBProjectPage = lazy(() => import('./pages/SMBProjectPage').then(m => ({ default: m.SMBProjectPage })));

// Admin & Outils
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const SitemapGeneratorPage = lazy(() => import('./pages/SitemapGeneratorPage').then(m => ({ default: m.SitemapGeneratorPage })));
const AdminTrollPage = lazy(() => import('./pages/AdminTrollPage').then(m => ({ default: m.AdminTrollPage })));

// Fallback léger pour les chargements de sections
const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
  </div>
);

// ✅ INTERFACE PROPS POUR ANIMATED ROUTES
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
                
                {/* ✅ Chargement progressif des sections pour ne pas bloquer le Hero */}
                <Suspense fallback={<SectionLoader />}>
                  <div id="stats"><Stats /></div>
                  <div id="formation"><Formation /></div>
                  <CareerTimeline />
                  <div id="projects"><Projects /></div>
                  <div id="writeups"><Writeups /></div>
                  <div id="articles"><Articles /></div>
                  <div id="contact"><Contact /></div>
                </Suspense>
              </PageTransition>
            </>
          } />

          {/* LISTES ET PAGES SECONDAIRES */}
          <Route path="/writeups" element={<PageTransition><WriteupsList /></PageTransition>} />
          <Route path="/projects" element={<PageTransition><ProjectsList /></PageTransition>} />
          <Route path="/projects/homelab-infrastructure" element={<PageTransition><HomeLabProjectPage /></PageTransition>} />
          <Route path="/projects/ad-network" element={<PageTransition><ADProjectPage /></PageTransition>} />
          <Route path="/projects/exegol" element={<PageTransition><ExegolProjectPage /></PageTransition>} />
          <Route path="/projects/linux-mint" element={<PageTransition><LinuxMintProjectPage /></PageTransition>} />
          <Route path="/projects/steam-deck-kali" element={<PageTransition><SteamDeckProjectPage /></PageTransition>} />
          <Route path="/projects/smb-server" element={<PageTransition><SMBProjectPage /></PageTransition>} />
          <Route path="/projects/:slug" element={<PageTransition><ProjectPage /></PageTransition>} />
          <Route path="/certifications" element={<PageTransition><CertificationsList /></PageTransition>} />
          <Route path="/wiki" element={<PageTransition><WikiPage /></PageTransition>} />
          <Route path="/wiki/:slug" element={<PageTransition><WikiPage /></PageTransition>} />

          {/* DETAILS ET ARTICLES */}
          <Route path="/writeups/:slug" element={<PageTransition><WriteupPage /></PageTransition>} />
          <Route path="/writeups/dog" element={<PageTransition><DogWriteupPage /></PageTransition>} />
          <Route path="/articles" element={<PageTransition><ArticlesListPage /></PageTransition>} />
          <Route path="/articles/cpts-journey" element={<PageTransition><CPTSJourneyArticlePage /></PageTransition>} />
          <Route path="/articles/:slug" element={<PageTransition><ArticleDetailPage /></PageTransition>} />
          
          {/* ADMIN & TOOLS */}
          <Route path="/admin/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
          <Route path="/admin/sitemap-generator" element={<PageTransition><SitemapGeneratorPage /></PageTransition>} />

          {/* ROUTES TROLL */}
          <Route path="/admin" element={<PageTransition><AdminTrollPage /></PageTransition>} />
          <Route path="/wp-admin" element={<PageTransition><AdminTrollPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><AdminTrollPage /></PageTransition>} />
          <Route path="/admin_login" element={<PageTransition><AdminTrollPage /></PageTransition>} />
          <Route path="/.env" element={<PageTransition><AdminTrollPage /></PageTransition>} />
          <Route path="/config.php" element={<PageTransition><AdminTrollPage /></PageTransition>} />

          {/* LEGAL */}
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

          {/* Fond stylisé — depth effect */}
          <div className="fixed inset-0 pointer-events-none z-0 depth-bg" aria-hidden="true" />

          <SEOHead />
          
          {/* ✅ UI Helpers en Suspense pour optimiser le thread principal */}
          <Suspense fallback={null}>
            <AnalyticsTracker />
            <Terminal />
            <MouseTrail />
          </Suspense>

          <Header setShowProfile={setShowProfile} setActiveSection={setActiveSection} activeSection={activeSection} />
          
          {/* ✅ Balise sémantique <main> pour l'accessibilité */}
          <main id="main-content">
            <AnimatedRoutes
              isLoaded={isLoaded}
              setShowProfile={setShowProfile}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </main>

          <Footer />
          
          {/* ✅ Modal en lazy loading */}
          <Suspense fallback={null}>
            {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
          </Suspense>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
