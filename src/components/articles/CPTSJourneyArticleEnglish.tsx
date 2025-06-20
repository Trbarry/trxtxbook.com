import React from 'react';
import { Award, Calendar, Target, BookOpen, Brain, Shield, Terminal, Users, Lightbulb, CheckCircle2, Clock, FileText, Zap, Coffee, Monitor, Network, Lock, Code, ArrowRight, TrendingUp, Cpu, Database, ExternalLink, AlertTriangle } from 'lucide-react';

export const CPTSJourneyArticleEnglish: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* CPTS Illustration Image */}
      <div className="relative mb-12">
        <div className="relative h-[300px] md:h-[400px] overflow-hidden rounded-lg border border-violet-900/20">
          <img
            src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/cptsimage.png"
            alt="CPTS Journey - Certified Penetration Testing Specialist"
            className="w-full h-full object-contain bg-[#1a1a1f]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">
                My CPTS Journey: 5 Months of Intensive Learning
              </h2>
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                From eJPT to CPTS - A complete transformation in professional pentesting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Meta Information - For reference only */}
      <div className="bg-[#2a2a2f] p-4 rounded-lg border border-violet-900/20 mb-8">
        <h3 className="text-sm font-semibold text-violet-400 mb-2">SEO Meta Tags (for reference)</h3>
        <div className="text-xs text-gray-400 space-y-1">
          <p><strong>Title:</strong> CPTS: My Journey into Professional Pentesting – From eJPT to HTB Certification</p>
          <p><strong>Description:</strong> A full 5-month journey to the CPTS certification by Hack The Box – From eJPT to 190-page report. Study roadmap, tools, challenges, and lessons learned.</p>
          <p><strong>Canonical:</strong> https://trxtxbook.com/articles/cpts-journey</p>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20 mb-12">
        <h2 className="text-xl font-bold text-violet-400 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Table of Contents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            'Introduction & Who This Is For',
            'Background: From eJPT to CPTS',
            'Study Strategy Breakdown',
            'Five-Month Roadmap & Final Sprint',
            'Tooling, Environment & Note-Taking',
            'Exam Week',
            'The 190-Page Report',
            'Biggest Challenges & How I Overcame Them',
            'CPTS Tips & Tricks Cheat-Sheet',
            'Lessons Learned',
            'Post-Exam Reflection & Next Steps',
            'Further Study & Acknowledgements',
            'Useful Resources & Bonus Files',
            'Conclusion & Encouragement'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-400 hover:text-violet-400 transition-colors">
              <ArrowRight className="w-3 h-3" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 1: Introduction & Who This Is For */}
      <section id="introduction--who-this-is-for" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">1. Introduction & Who This Is For</h2>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <div className="bg-[#2a2a2f] p-6 rounded-lg mb-6">
              <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              <p className="text-gray-400 text-sm">
                This section will contain the introduction and target audience for the CPTS journey article.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Background: From eJPT to CPTS */}
      <section id="background-from-ejpt-to-cpts" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">2. Background: From eJPT to CPTS</h2>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <div className="bg-[#2a2a2f] p-6 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-violet-400" />
                <p className="text-violet-400 font-semibold">Inspired by Bruno Rocha Moura's article:</p>
              </div>
              <a 
                href="https://www.brunorochamoura.com/posts/cpts-tips" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-300 hover:text-violet-200 transition-colors underline"
              >
                Read here
              </a>
            </div>

            <div className="bg-[#2a2a2f] p-6 rounded-lg mb-6">
              <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              <p className="text-gray-400 text-sm">
                This section will cover the background and motivation for pursuing CPTS after eJPT.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Study Strategy Breakdown */}
      <section id="study-strategy-breakdown" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">3. Study Strategy Breakdown</h2>
          </div>
          
          <div className="space-y-8">
            {/* Subsection: Tackling the 28 CPTS Modules */}
            <div id="tackling-the-28-cpts-modules">
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Cpu className="w-6 h-6" />
                Tackling the 28 CPTS Modules
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
                <p className="text-gray-400 text-sm">
                  This subsection will detail the approach to studying the 28 CPTS modules.
                </p>
              </div>
            </div>

            {/* Subsection: HTB Boxes & IppSec's List */}
            <div id="htb-boxes--ippsecs-list">
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Monitor className="w-6 h-6" />
                HTB Boxes & IppSec's List
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
                <p className="text-gray-400 text-sm">
                  This subsection will cover the HTB machines practice and IppSec's recommended list.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final conclusion */}
      <div className="bg-gradient-to-r from-violet-500/10 to-violet-600/10 border border-violet-500/20 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Award className="w-8 h-8 text-violet-400" />
          <h2 className="text-2xl font-bold text-violet-400">Journey Complete</h2>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
          From junior pentester to CPTS certified professional - this journey has been transformative. 
          The road was challenging, but every hour invested was worth it for the skills and confidence gained.
        </p>
      </div>
    </div>
  );
};