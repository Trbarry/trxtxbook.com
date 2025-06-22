import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// SEO Component
import { SEOHead } from './components/SEOHead';

// Layout Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

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
import { CyberCharacter } from './components/CyberCharacter';
import { MouseTrail } from './components/MouseTrail';
import { AnalyticsTracker } from './components/AnalyticsTracker';

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

function App() {
  // State
  const showCyberCharacter = false;
  const [activeSection, setActiveSection] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Effects
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0f] text-gray-100 cyber-theme">
        {/* SEO Head - Global */}
        <SEOHead />
        
        {/* Analytics Tracker */}
        <AnalyticsTracker />

        {/* Navigation */}
        <Header 
          setShowProfile={setShowProfile}
          setActiveSection={setActiveSection}
          activeSection={activeSection}
        />

        {/* Interactive Elements */}
        <CyberCharacter />
        <MouseTrail />

        {/* Routes */}
        <Routes>
          {/* Home Page */}
          <Route path="/" element={
            <>
              <ScrollMenu activeSection={activeSection} setActiveSection={setActiveSection} />
              <div id="home">
                <Hero isLoaded={isLoaded} setShowProfile={setShowProfile} />
              </div>
              <ScrollReveal>
                <div id="stats">
                  <Stats />
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <div id="formation">
                  <Formation />
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <div id="projects">
                  <Projects />
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <div id="writeups">
                  <Writeups />
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <div id="contact">
                  <Contact />
                </div>
              </ScrollReveal>
            </>
          } />

          {/* Content Pages */}
          <Route path="/writeups" element={<WriteupsList />} />
          <Route path="/writeups/:slug" element={<WriteupPage />} />
          <Route path="/writeups/dog" element={<DogWriteupPage />} />
          <Route path="/projects" element={<ProjectsList />} />
          <Route path="/certifications" element={<CertificationsList />} />

          {/* Article Pages */}
          <Route path="/articles/smb-server" element={<ArticlePage />} />
          <Route path="/articles/ad-network" element={<ADArticlePage />} />
          <Route path="/articles/steam-deck-kali" element={<SteamDeckArticlePage />} />
          <Route path="/articles/exegol-docker" element={<ExegolArticlePage />} />
          <Route path="/articles/linux-mint-revival" element={<LinuxMintArticlePage />} />
          <Route path="/articles/cpts-journey" element={<CPTSJourneyArticlePage />} />

          {/* Admin Pages */}
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/sitemap-generator" element={<SitemapGeneratorPage />} />
        </Routes>

        {/* Footer */}
        <Footer />

        {/* Modals */}
        {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      </div>
    </Router>
  );
}

export default App;