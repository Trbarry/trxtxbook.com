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
          <p>
  I'm French and currently switching careers to move into cybersecurity. In September, I’ll start a formal work-study program in IT and networking, but honestly, my journey started long before that. I used to work as a field technician in fiber optics — pulling cables, doing installations, repeating the same tasks every day. After a while, I felt stuck. I wasn’t learning anything new, and I couldn’t see any real future in what I was doing. That’s what pushed me to change.<br /><br />

  I decided to move into cybersecurity, and since then, I’ve been fully committed. For the past nine months, I’ve trained on my own, almost every day, for about 6 to 7 hours. I finished all the learning paths on TryHackMe, passed the eJPT certification, and more recently the CPTS from Hack The Box. This wasn’t just about collecting certs — it was about learning for real, building technical skills, and proving to myself that I could grow in this field through hard work.<br /><br />

  I’m what you might call a “tryharder”. When something motivates me, I give it 300%. I write down everything I learn, structure all my notes, and I go deep. I work in a custom Exegol setup, I use Obsidian every day, and I write my reports with SysReptor — even when I’m just training. I don’t skip steps, and I don’t copy-paste walkthroughs. I want to understand everything I do, not just repeat what works once.<br /><br />

  I wrote this article because I wanted to share. When I was preparing for the CPTS, I read the blog by <a href="https://www.brunorochamoura.com/posts/cpts-tips/" target="_blank" className="text-violet-400 hover:underline"><strong>Bruno Rocha Moura</strong></a>, and it helped me a lot. His tips gave me a structure and helped me stay focused. So in the same spirit, I’m writing this to give back. If you’re wondering whether CPTS is worth it, or if you’re already studying and need some direction, I hope this helps you in some way.<br /><br />

  For me, sharing is part of the game. In this field, we all grow by helping each other — through write-ups, forums, blogs, even small Discord chats. I believe that if this post helps even one person feel more confident, or better prepared, then it was worth writing.
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
         <p>
  I passed the <strong>eJPT</strong> in <strong>February 2025</strong>, right in the middle of the <strong>CPTS learning path</strong>. I had just started digging into the HTB modules when I saw a <strong>promo for the exam</strong>. So I said to myself, “Let’s give it a try — even if I fail, I’ll learn something.” I had already done all the <strong>TryHackMe learning paths</strong>, including the <strong>Junior Penetration Tester track</strong>, so I had some ground to stand on. <br /><br />

  I was honestly <strong>stressed</strong>. First cert, first timed exam, and I didn’t think I was ready at all. But it went way better than expected — I finished it in <strong>6 hours out of the 48</strong>. That boosted my confidence a lot. If you’ve done the learning paths on THM, you can definitely take the eJPT. It’s a great cert to <strong>validate your fundamentals</strong> in networking and basic pentesting. <br /><br />

  But right after that, when I got deeper into the CPTS modules… I saw the <strong>gap</strong>. The CPTS felt way more <strong>advanced</strong>, way more <strong>realistic</strong>. I realized the eJPT had confirmed I was <strong>no longer a beginner</strong> — but I still had a long way to go to be solid. That’s where CPTS made sense. <br /><br />

  I picked CPTS instead of jumping straight into <strong>OSCP</strong> because I want to <strong>train properly</strong> — not just rush into something. Plus, let’s be honest: the OSCP is <strong>expensive</strong>, and I’ve seen a lot of feedback saying the course material isn’t that great. The <strong>HTB content</strong>, on the other hand, is <strong>super high quality</strong>. The modules are <strong>dense, structured, and practical</strong>. And the CPTS cert is <strong>affordable</strong>, which matters when you're self-funding your learning like I am. <br /><br />

  I see the CPTS as a <strong>serious technical milestone</strong> before going for OSCP later, mostly for <strong>HR visibility</strong>. But right now, CPTS was the <strong>smart, realistic choice</strong> for where I was. Great content, <strong>real-world challenges</strong>, and an exam that forces you to <strong>think like a pentester</strong> — not just follow steps. <br /><br />

  If you're in that same spot — somewhere between <strong>“beginner” and “ready for real engagements”</strong> — the CPTS is a great way to <strong>level up without burning out or breaking the bank</strong>.
</p>



        </div>
      </div>

      

      {/* CPTS Modules */}
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <Cpu className="w-6 h-6" />
          Tackling the 28 CPTS MODULES
        </h3>
        <div className="bg-[#2a2a2f] p-6 rounded-lg">
          <p>
      I spent about <strong>3 to 4 months</strong> working through the entire <strong>Penetration Tester learning path</strong> on Hack The Box. I didn’t try to rush it — I treated each module like a mini-course, often going back over topics until I fully understood them. The path is **incredibly rich**, both in technical depth and in real-world relevance. I genuinely believe that anyone with motivation — even someone starting from scratch — can finish this path and be ready for the CPTS. You just need to be **consistent**, and willing to take your time when it gets tough.
    </p>

    <p>
      At first glance, the 28 modules might feel overwhelming, especially if you're new to structured cybersecurity learning. But what I appreciated right away is that the path is built with **progressive layering** in mind. It doesn’t throw you into the deep end. The first modules set the foundations, and each one adds more complexity and realism. And if you follow through, you’ll notice your own mindset changing — you stop thinking like a student and start thinking like a pentester.
    </p>

    <p>
      I didn’t set fixed goals like “one module per day” — that would’ve been a mistake. Some modules took me just 2-3 hours, others like <strong>Attacking Enterprise Networks</strong> or <strong>Password Attacks</strong> took up to **5 full days**. I worked in long, focused sessions (usually 5 to 7 hours per day), with structured note-taking in <strong>Obsidian</strong>. Every time I finished a module, I would pick a related <strong>HTB box</strong> to reinforce the concepts. That connection between theory and practice is where the learning really sticks.
    </p>

    <p>
      For example, after completing <strong>Linux Privilege Escalation</strong>, I immediately tackled two medium-difficulty boxes with known privesc vectors. I used my notes as a checklist. It showed me exactly where I was solid — and where I had gaps. I can't stress this enough: <strong>your personal notes are more valuable than the module PDFs</strong>. Write everything down as if you were creating your own training material.
    </p>

    <p>
      Let me share my thoughts on some of the modules that really stood out:
      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
        <li><strong>Attacking Enterprise Networks</strong>: This is basically a **mini CPTS exam**. It’s long, detailed, and mimics the full exam format. I did it blind the first time — no walkthrough, no hints — and it was a turning point. If you want to measure your readiness, this is the ultimate test. It also teaches you how to chain everything together: enumeration, privilege escalation, pivoting, lateral movement, and reporting.</li>

        <li><strong>Penetration Testing Process</strong>: It might seem basic at first, but this one gives you the **mindset and workflow** you’ll need for the entire path. If you're someone who likes to understand "why" before "how", this module is gold.</li>

        <li><strong>Active Directory Enumeration & Attacks</strong>: One of the most **complete and clear** modules. It helped me build reusable checklists and understand how AD exploitation actually happens in real companies. It goes beyond theory — it makes you comfortable with tools and logic you'll need in the exam (and in real life).</li>

        <li><strong>Documentation and Reporting</strong>: Often overlooked, but **critical for the exam**. You won’t pass CPTS if your report isn’t solid. This module gives you the format, the tone, the expectations. I even used it to structure my own CPTS report in <strong>SysReptor</strong>.</li>

        <li><strong>Command Injection</strong> and <strong>SQLi</strong>: These two were a good balance of theory and application. Clear payloads, defensive mechanisms, bypass techniques — and plenty of chances to apply them in boxes. Solid.</li>
      </ul>
    </p>

    <p>
      On the flip side, here are some modules I found less engaging:
      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
        <li><strong>Password Attacks</strong>: Technically important, but too passive. You spend a lot of time waiting for brute-force attempts, which isn’t very educational past a certain point.</li>

        <li><strong>Shells & Payloads</strong>: This one felt a bit **out of place**. The concepts were scattered, and most of the payload logic is better covered in the post-exploitation modules. It could’ve been tighter.</li>

        <li><strong>Linux Privilege Escalation</strong>: Good examples, but I expected more structure. It lacked a clear **methodology**. I ended up expanding it using my own CTF experience and resources from g0tmi1k and PEASS.</li>

        <li><strong>Vulnerability Assessment</strong>: Honestly, just a bit dry. It covers the basics of Nessus and OpenVAS, but doesn’t offer much depth. It’s not bad, just not exciting.</li>
      </ul>
    </p>

    <p>
      One thing to note: **even the weaker modules are still solid**. HTB really doesn’t cut corners. And the pricing is extremely fair. I went with the <strong>HTB Silver subscription</strong>, which cost me about <strong>€410 for the year</strong>. That gave me access to **all 28 modules**, the labs, the content updates, and a **voucher for the CPTS exam**. When you compare that to other certs (looking at you, OSCP), it’s honestly a steal.
    </p>

    <p>
      My advice? Take your time. <strong>Work module by module, box by box</strong>. Document everything, and don’t move on until it clicks. The content is designed to turn you into a practitioner, not just someone who memorizes flags. And if you do it right, by the end you’ll be surprised how far you’ve come.
    </p>
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
                <p>
      I didn’t follow a strict schedule during the CPTS path — I just aimed to work around <strong>6 to 7 hours a day</strong>, <strong>five days a week</strong>, always taking short breaks every couple of hours to stay focused. I knew from experience that <strong>rest matters just as much as active study</strong> — especially in cybersecurity, where understanding is more important than memorization.<br /><br />

      My routine was pretty straightforward: <strong>start a module</strong>, <strong>finish it completely</strong>, and take <strong>structured notes</strong> as I went. Then, whenever possible, I would <strong>chain it with one or two related HTB boxes</strong>. This practical follow-up was crucial for me — the hands-on challenges helped <strong>anchor what I had just learned</strong>.<br /><br />

      Each morning, I’d <strong>review the previous day’s notes</strong>, to keep everything fresh and reinforce long-term memory. It wasn’t always easy to stay on track — motivation goes up and down — but I kept telling myself that <strong>discipline had to win over comfort</strong>. Over time, it paid off. The progress wasn’t always visible day by day, but looking back, it added up fast.<br /><br />

      Outside of studying, I made sure to <strong>take care of my mental and physical health</strong>. I trained <strong>four times a week</strong>, around <strong>2 to 3 hours per session</strong>, and went on <strong>regular walks with my family and my dog</strong>. Staying active and clearing my head helped me avoid burnout and come back sharper the next day. Honestly, <strong>moving your body is just as important as moving your brain</strong>.<br /><br />

      And let’s be real — <strong>a good Spotify playlist</strong> makes the grind a lot more enjoyable. When I was in the zone, music helped me stay focused and turn long hours into productive ones.
    </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Monitor className="w-6 h-6" />
                HTB Boxes, Modules & IppSec's Track
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p>
        During the <strong>CPTS learning path</strong>, I made it a habit to complete <strong>1–2 HTB boxes per module</strong>, directly related to the topic I had just studied. For example, after finishing the <em>Web Exploitation</em> module, I’d go try an XSS or file upload challenge in the retired or easy/medium category. This helped me anchor new concepts right away by putting them into practice.
      </p>

      <p>
        Once I completed the path, I moved on to doing <strong>live boxes on Hack The Box</strong>. These weren’t always tied to specific modules — I did them for fun and for the challenge. But they turned out to be incredibly valuable. These boxes helped me work on:
      </p>

      <ul className="list-disc list-inside space-y-1 ml-4">
        <li><strong>Internal pivoting</strong> (shoutout to Ligolo-ng),</li>
        <li><strong>Post-exploitation logic</strong> and lateral movement,</li>
        <li><strong>Handling AV and EDR</strong> obstacles in a realistic environment.</li>
      </ul>

      <p>
        I eventually reached the <strong>Pro Hacker rank</strong> — not without struggle. Some hard boxes kicked my ass, and yes, I needed help sometimes. That’s okay. What matters is what you learn from the process.
      </p>

      <p>
        Then I tackled the <strong>unofficial IppSec CPTS prep playlist</strong>:
        <br />
        <a href="https://www.youtube.com/watch?v=H9FcE_FMZio&list=PLidcsTyj9JXItWpbRtTg6aDEj10_F17x5" target="_blank" className="text-violet-400 hover:underline">
          HTB CPTS Prep Boxes – IppSec YouTube
        </a>
      </p>

      <p>
        And let me tell you — these boxes are <strong>brilliantly curated</strong>. Now that I’ve passed the exam, I can confirm: some of them contain <strong>vulnerabilities nearly identical</strong> to the ones found in the CPTS. More importantly, they force you to:
      </p>

      <ul className="list-disc list-inside space-y-1 ml-4">
        <li><strong>Chain multiple steps</strong> without guidance,</li>
        <li><strong>Structure your workflow</strong> like in a real pentest,</li>
        <li><strong>Manage pivots and post-exploitation scenarios</strong> on your own.</li>
      </ul>

      <p>
        These boxes really <strong>boosted my confidence</strong>. After finishing the playlist, I said to myself: <em>"Okay, now I’m really ready for the 10-day exam."</em>
      </p>

      <p>
        💬 I know some people also use <strong>ProLabs</strong> or even tackle <strong>hard/insane boxes</strong> to prep, but personally, I didn’t feel the need. In my opinion, if you:
      </p>

      <ul className="list-disc list-inside space-y-1 ml-4">
        <li>complete the CPTS path <strong>seriously</strong>,</li>
        <li>pair modules with relevant boxes <strong>consistently</strong>,</li>
        <li>follow the IppSec playlist <strong>at the right time</strong>,</li>
      </ul>

      <p>
        …then you already have <strong>everything you need</strong>. No need to overdo it. The CPTS learning path alone is already <strong>rich and complete</strong>.
      </p>

      <p>
        <strong>🕐 Personal advice</strong>: Don’t wait too long after finishing the learning path to start the IppSec boxes — you might forget key details. But don’t start them too early either. Make sure you’ve built a strong foundation from the modules before jumping in. <strong>Trust the process</strong>.
      </p>
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