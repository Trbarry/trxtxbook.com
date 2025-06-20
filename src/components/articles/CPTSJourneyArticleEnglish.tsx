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

      {/* 🟣 H1 - Main Title */}
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent mb-6">
          My Certified Penetration Testing Specialist (CPTS) Experience
        </h1>
      </header>

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
            'Introduction & Hook',
            'Background: From eJPT to CPTS',
            'Study Strategy Breakdown',
            'Five-Month Roadmap & Final Sprint',
            'Tooling, Environment & Note-Taking',
            'Exam Week',
            'The 190-Page Report',
            'Biggest Challenges & How I Overcame Them',
            'Tips & Tricks Cheat-Sheet',
            'Post-Exam Reflection & Next Steps',
            'Further Study & Acknowledgements',
            'Conclusion & Encouragement'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-400 hover:text-violet-400 transition-colors">
              <ArrowRight className="w-3 h-3" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 🟪 H2 - Introduction & Hook */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Introduction & Hook</h2>
          </div>
          
          {/* 🟦 H3 - Tackling the 28 CPTS MODULES */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Cpu className="w-6 h-6" />
                Tackling the 28 CPTS MODULES
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Background: From eJPT to CPTS */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Background: From eJPT to CPTS</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Why CPTS After eJPT? */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Why CPTS After eJPT?
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - My Starting Level */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                My Starting Level
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Study Strategy Breakdown */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Study Strategy Breakdown</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - CPTS Learning Path Structure */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                CPTS Learning Path Structure
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - HTB Boxes, Modules & IppSec's Track */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Monitor className="w-6 h-6" />
                HTB Boxes, Modules & IppSec's Track
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Five-Month Roadmap & Final Sprint */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Five-Month Roadmap & Final Sprint</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Time Allocation Month by Month */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Time Allocation Month by Month
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - Final 10-Day Sprint */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Final 10-Day Sprint
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Tooling, Environment & Note-Taking */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Tooling, Environment & Note-Taking</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Exegol: My Offensive Environment */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Exegol: My Offensive Environment
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - SysReptor & Obsidian for Notes & Reporting */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                SysReptor & Obsidian for Notes & Reporting
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Exam Week */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Exam Week</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Exam Format & Scope */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Exam Format & Scope
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - Daily Breakdown */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Daily Breakdown
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - The 190-Page Report */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">The 190-Page Report</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Real-Time Reporting Strategy */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Real-Time Reporting Strategy
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - Walkthroughs vs. Findings */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Code className="w-6 h-6" />
                Walkthroughs vs. Findings
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - What I Included & Why */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                What I Included & Why
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Biggest Challenges & How I Overcame Them */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Lock className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Biggest Challenges & How I Overcame Them</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Internal Network Pivoting */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Network className="w-6 h-6" />
                Internal Network Pivoting
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - Web Exploitation Stumbling Blocks */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Code className="w-6 h-6" />
                Web Exploitation Stumbling Blocks
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Tips & Tricks Cheat-Sheet */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Tips & Tricks Cheat-Sheet</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Enumeration First, Always */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Enumeration First, Always
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - Watch for Rabbit Holes */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Watch for Rabbit Holes
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - Time & Mental Energy Management */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Time & Mental Energy Management
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Post-Exam Reflection & Next Steps */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <CheckCircle2 className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Post-Exam Reflection & Next Steps</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Comparing CPTS to OSCP */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Comparing CPTS to OSCP
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - My Plan for OSCP, BSCP & Beyond */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                My Plan for OSCP, BSCP & Beyond
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Further Study & Acknowledgements */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Database className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Further Study & Acknowledgements</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Books, Labs, Communities */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Books, Labs, Communities
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            {/* 🟦 H3 - People That Helped Me Grow */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                People That Helped Me Grow
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Conclusion & Encouragement */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Conclusion & Encouragement</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - You Can Do It Too */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6" />
                You Can Do It Too
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
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