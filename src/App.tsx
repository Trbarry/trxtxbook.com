import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// SEO Component
import { SEOHead } from './components/SEOHead';

// Layout Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';

// Core Components
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Formation } from './components/Formation';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import { Writeups } from './components/Writeups';
import { WriteupsList } from './components/WriteupsList';
import { WriteupPage } from './pages/WriteupPage';
import { ProjectsList } from './components/ProjectsList';
import { CertificationsList } from './pages/CertificationsList';

// UI Components
import { ProfileModal } from './components/ProfileModal';
import { ScrollMenu } from './components/ScrollMenu';
import { ScrollReveal } from './components/ScrollReveal';
import { MouseTrail } from './components/MouseTrail';
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { Terminal } from './components/Terminal'; // <--- Le Terminal est bien là

// Article Pages
import { ArticlePage } from './pages/ArticlePage';
import { ADArticlePage } from './pages/ADArticlePage';
import { SteamDeckArticlePage } from './pages/SteamDeckArticlePage';
import { DogWriteupPage } from './pages/DogWriteupPage';
import { ExegolArticlePage } from './pages/ExegolArticlePage';
import { LinuxMintArticlePage } from './pages/LinuxMintArticlePage';
import { CPTSJourneyArticlePage } from './pages/CPTSJourneyArticlePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SitemapGeneratorPage } from './pages/SitemapGeneratorPage';

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
        <Route path="/writeups/dog" element={<PageTransition><DogWriteupPage /></PageTransition>} />
        
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