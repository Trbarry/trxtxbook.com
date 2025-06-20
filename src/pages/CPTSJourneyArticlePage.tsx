import React, { useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { CPTSJourneyArticle } from '../components/articles/CPTSJourneyArticle';

export const CPTSJourneyArticlePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead 
        title="CPTS: My Journey into Professional Pentesting – From eJPT to HTB Certification | Tristan Barry"
        description="A full 5-month journey to the CPTS certification by Hack The Box – From eJPT to 190-page report. Study roadmap, tools, challenges, and lessons learned."
        keywords="CPTS, Hack The Box, pentesting, cybersécurité, certification, eJPT, HTB Academy, professional pentesting, study guide"
        url="https://trxtxbook.com/articles/cpts-journey"
        type="article"
        publishedTime="2025-01-20T00:00:00+00:00"
        modifiedTime="2025-01-20T00:00:00+00:00"
      />
      <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
        <CPTSJourneyArticle />
      </div>
    </>
  );
};