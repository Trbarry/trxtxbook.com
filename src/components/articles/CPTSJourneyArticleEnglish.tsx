import React from 'react';
import { Award, Calendar, Target, BookOpen, Brain, Shield, Terminal, Users, Lightbulb, CheckCircle2, Clock, FileText, Zap, Monitor, Network, Lock, Code, ArrowRight, TrendingUp, Cpu, Database } from 'lucide-react';

export const CPTSJourneyArticleEnglish: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* CPTS Hero Section */}
      <div className="relative mb-16">
        <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-xl border border-violet-900/30 bg-gradient-to-b from-[#0f0f14] via-[#181821] to-[#1a1a1f] p-6 md:p-10">
          <img
            src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/cptsimage.png"
            alt="CPTS Journey Artwork"
            className="w-full h-auto mx-auto object-contain md:max-h-[400px] transition-transform duration-500 hover:scale-[1.03]"
          />

          <div className="text-center mt-6">
            <h2 className="text-3xl md:text-4xl font-bold text-violet-300 mb-2">
              My CPTS Journey: 5 Months of Intensive Learning
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              From eJPT to CPTS — A complete transformation in practical pentesting and internal network hacking.
            </p>
          </div>
        </div>
      </div>

      

      {/* SEO Meta Information - Only visible in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="bg-[#2a2a2f] p-4 rounded-lg border border-violet-900/20 mb-8">
          <h3 className="text-sm font-semibold text-violet-400 mb-2">SEO Meta Tags (for reference - dev only)</h3>
          <div className="text-xs text-gray-400 space-y-1">
            <p><strong>Title:</strong> CPTS: My Journey into Professional Pentesting – From eJPT to HTB Certification</p>
            <p><strong>Description:</strong> A full 5-month journey to the CPTS certification by Hack The Box – From eJPT to 190-page report. Study roadmap, tools, challenges, and lessons learned.</p>
            <p><strong>Canonical:</strong> https://trxtxbook.com/articles/cpts-journey</p>
          </div>
        </div>
      )}

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

      {/* Introduction & Hook */}
<section className="mb-16">
  <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
    <div className="flex items-center gap-3 mb-8">
      <Target className="w-8 h-8 text-violet-400" />
      <h2 className="text-3xl font-bold">Introduction & Hook</h2>
    </div>

    <div className="space-y-8">

      {/* About Me */}
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6" />
          About Me
        </h3>
        <div className="bg-[#2a2a2f] p-6 rounded-lg">
          <p className="text-gray-300 leading-relaxed">
  I'm currently transitioning into cybersecurity through a professional retraining path. In September, I’ll begin a formal work-study program focused on IT and networking, but my journey started long before that. I used to work as a field technician in fiber optics — pulling cables, climbing ladders, doing repetitive installations. Over time, I began to feel a deep disconnect: I wasn’t learning, I wasn’t evolving, and I didn’t see long-term meaning in what I was doing. That realization was the turning point. <br /><br />
  I made the choice to pivot into a field that truly resonates with me: cybersecurity. And from that moment on, I’ve been going all-in. For the past nine months, I’ve trained rigorously on my own — studying 6 to 7 hours a day, nearly every day. I completed all the learning paths on TryHackMe, passed the eJPT certification, and most recently earned the CPTS from Hack The Box. This wasn’t just about collecting badges. It was about building real, practical skills and proving to myself that I could reach a professional standard through hard work and dedication. <br /><br />
  I consider myself a “tryharder” — when something ignites my passion, I give it 300%. I’m obsessive about documenting everything I learn, not just to track progress, but because writing it down helps me understand it deeply. My workflow revolves around a custom Exegol offensive environment, with Obsidian for knowledge management and SysReptor for real-time reporting. I believe learning should be active, structured, and brutally honest. I don’t skip steps. I don’t cut corners. <br /><br />
  This article isn’t just about showcasing a personal success. I’m writing it to give back — plain and simple. When I was preparing for the CPTS, one of the most valuable resources I came across was the blog and methodology shared by Bruno Rocha Moura. His insights helped me structure my preparation, stay focused, and understand what truly mattered. In the same spirit, I hope this write-up can help someone else: whether you're hesitating to take the exam, wondering how to prepare, or simply looking for a roadmap from someone who's walked the path. <br /><br />
  Sharing knowledge is at the core of this field. We all stand on the shoulders of others — from write-ups, Discord chats, community forums, and blog posts — and I believe we have a duty to contribute in return. If this article helps even one person find clarity, confidence, or direction, then it has served its purpose.
</p>

        </div>
      </div>

      {/* Why CPTS After eJPT */}
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Why CPTS After eJPT?
        </h3>
        <div className="bg-[#2a2a2f] p-6 rounded-lg">
          <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
        </div>
      </div>

      {/* My Starting Level */}
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          My Starting Level
        </h3>
        <div className="bg-[#2a2a2f] p-6 rounded-lg">
          <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
        </div>
      </div>

      {/* CPTS Modules */}
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


      {/* Study Strategy Breakdown */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Study Strategy Breakdown</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                CPTS Learning Path Structure
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

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

      {/* Five-Month Roadmap & Final Sprint */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Five-Month Roadmap & Final Sprint</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Time Allocation Month by Month
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

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

      {/* Tooling, Environment & Note-Taking */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Tooling, Environment & Note-Taking</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Exegol: My Offensive Environment
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

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

      {/* Exam Week */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Exam Week</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Exam Format & Scope
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

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

      {/* The 190-Page Report */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">The 190-Page Report</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Real-Time Reporting Strategy
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Code className="w-6 h-6" />
                Walkthroughs vs. Findings
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

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

      {/* Biggest Challenges & How I Overcame Them */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Lock className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Biggest Challenges & How I Overcame Them</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Network className="w-6 h-6" />
                Internal Network Pivoting
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

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

      {/* Tips & Tricks Cheat-Sheet */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Tips & Tricks Cheat-Sheet</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Enumeration First, Always
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Watch for Rabbit Holes
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

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

      {/* Post-Exam Reflection & Next Steps */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <CheckCircle2 className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Post-Exam Reflection & Next Steps</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Comparing CPTS to OSCP
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

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

      {/* Further Study & Acknowledgements */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Database className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Further Study & Acknowledgements</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Books, Labs, Communities
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
              </div>
            </div>

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

      {/* Conclusion & Encouragement */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Conclusion & Encouragement</h2>
          </div>
          
          <div className="space-y-8">
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