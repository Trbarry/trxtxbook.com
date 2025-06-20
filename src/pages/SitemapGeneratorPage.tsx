import React, { useEffect } from 'react';
import { SitemapGenerator } from '../components/SitemapGenerator';
import { SEOHead } from '../components/SEOHead';

export const SitemapGeneratorPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead 
        title="Générateur de Sitemap - Outils SEO | Tristan Barry"
        description="Générateur automatique de sitemap.xml pour optimiser le référencement et l'indexation du site."
        keywords="sitemap, SEO, référencement, indexation, outils webmaster"
        url="https://trxtxbook.com/admin/sitemap-generator"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">Générateur de Sitemap</h1>
          <SitemapGenerator />
        </div>
      </div>
    </>
  );
};