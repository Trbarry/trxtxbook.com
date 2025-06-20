import React from 'react';
import { Award, Calendar, Target, BookOpen, Brain, Shield, Terminal, Users, Lightbulb, CheckCircle2, Clock, FileText, Zap, Coffee, Monitor, Network, Lock, Code, ArrowRight, TrendingUp, Cpu, Database, ExternalLink, AlertTriangle } from 'lucide-react';

export const CPTSJourneyArticleEnglish: React.FC = () => {
  return (
    <div className="space-y-16">
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

      {/* Section 4: Five-Month Roadmap & Final Sprint */}
      <section id="five-month-roadmap--final-sprint" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">4. Five-Month Roadmap & Final Sprint</h2>
          </div>
          
          <div className="space-y-8">
            {/* Subsection: Month-by-Month Breakdown */}
            <div id="month-by-month-breakdown">
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Month-by-Month Breakdown
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
                <p className="text-gray-400 text-sm">
                  This subsection will provide a detailed month-by-month study plan.
                </p>
              </div>
            </div>

            {/* Subsection: The Final 10 Days */}
            <div id="the-final-10-days">
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                The Final 10 Days
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
                <p className="text-gray-400 text-sm">
                  This subsection will detail the final sprint preparation strategy.
                </p>
              </div>
            </div>

            {/* Subsection: My Sysadmin Rituals */}
            <div id="my-sysadmin-rituals">
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Coffee className="w-6 h-6" />
                My Sysadmin Rituals
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
                <p className="text-gray-400 text-sm">
                  This subsection will cover daily routines and habits that helped maintain productivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Tooling, Environment & Note-Taking */}
      <section id="tooling-environment--note-taking" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">5. Tooling, Environment & Note-Taking</h2>
          </div>
          
          <div className="space-y-8">
            {/* Subsection: Using Obsidian Effectively */}
            <div id="using-obsidian-effectively">
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Using Obsidian Effectively
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
                <p className="text-gray-400 text-sm">
                  This subsection will detail the Obsidian setup and note-taking methodology.
                </p>
              </div>
            </div>

            {/* Subsection: Using SysReptor Without Losing Your Mind */}
            <div id="using-sysreptor-without-losing-your-mind">
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Using SysReptor Without Losing Your Mind
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
                <p className="text-gray-400 text-sm">
                  This subsection will provide tips and tricks for using SysReptor effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Exam Week */}
      <section id="exam-week" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">6. Exam Week</h2>
          </div>
          
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
            <p className="text-gray-400 text-sm">
              This section will cover the 10-day exam experience in detail.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: The 190-Page Report */}
      <section id="the-190-page-report" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">7. The 190-Page Report</h2>
          </div>
          
          <div className="space-y-8">
            {/* Subsection: Structure and Flow */}
            <div id="structure-and-flow">
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Code className="w-6 h-6" />
                Structure and Flow
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
                <p className="text-gray-400 text-sm">
                  This subsection will detail the report structure and writing methodology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Biggest Challenges & How I Overcame Them */}
      <section id="biggest-challenges--how-i-overcame-them" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Lock className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">8. Biggest Challenges & How I Overcame Them</h2>
          </div>
          
          <div className="space-y-8">
            {/* Subsection: Technical Walls I Hit */}
            <div id="technical-walls-i-hit">
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Cpu className="w-6 h-6" />
                Technical Walls I Hit
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
                <p className="text-gray-400 text-sm">
                  This subsection will cover technical challenges encountered during the journey.
                </p>
              </div>
            </div>

            {/* Subsection: Mental Walls I Hit */}
            <div id="mental-walls-i-hit">
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Mental Walls I Hit
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
                <p className="text-gray-400 text-sm">
                  This subsection will address mental challenges and burnout prevention strategies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: CPTS Tips & Tricks Cheat-Sheet */}
      <section id="cpts-tips--tricks-cheat-sheet" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">9. CPTS Tips & Tricks Cheat-Sheet</h2>
          </div>
          
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
            <p className="text-gray-400 text-sm">
              This section will provide a comprehensive cheat-sheet of tips and tricks for CPTS success.
            </p>
          </div>
        </div>
      </section>

      {/* Section 10: Lessons Learned */}
      <section id="lessons-learned" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <CheckCircle2 className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">10. Lessons Learned</h2>
          </div>
          
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
            <p className="text-gray-400 text-sm">
              This section will summarize key lessons learned throughout the CPTS journey.
            </p>
          </div>
        </div>
      </section>

      {/* Section 11: Post-Exam Reflection & Next Steps */}
      <section id="post-exam-reflection--next-steps" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Network className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">11. Post-Exam Reflection & Next Steps</h2>
          </div>
          
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
            <p className="text-gray-400 text-sm">
              This section will cover post-certification reflections and future learning plans.
            </p>
          </div>
        </div>
      </section>

      {/* Section 12: Further Study & Acknowledgements */}
      <section id="further-study--acknowledgements" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Database className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">12. Further Study & Acknowledgements</h2>
          </div>
          
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
            <p className="text-gray-400 text-sm">
              This section will include recommendations for further study and acknowledgements.
            </p>
          </div>
        </div>
      </section>

      {/* Section 13: Useful Resources & Bonus Files */}
      <section id="useful-resources--bonus-files" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">13. Useful Resources & Bonus Files</h2>
          </div>
          
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
            <p className="text-gray-400 text-sm">
              This section will provide links to useful resources and bonus materials.
            </p>
          </div>
        </div>
      </section>

      {/* Section 14: Conclusion & Encouragement */}
      <section id="conclusion--encouragement" className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">14. Conclusion & Encouragement</h2>
          </div>
          
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-violet-400 font-semibold mb-2">📝 Content to be added manually</p>
            <p className="text-gray-400 text-sm">
              This section will provide final thoughts and encouragement for aspiring CPTS candidates.
            </p>
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