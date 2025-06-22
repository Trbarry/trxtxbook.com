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

          
        </div>
      </div>
 
      

      {/* SEO Meta Information - Only visible in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="bg-[#2a2a2f] p-4 rounded-lg border border-violet-900/20 mb-8">
          <h3 className="text-sm font-semibold text-violet-400 mb-2">SEO Meta Tags (for reference - dev only)</h3>
          <div className="text-xs text-gray-400 space-y-1">
           
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
            'Tooling, Environment & Note-Taking',
            'Exam Week',
            'The 190-Page Report',
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
        <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  {/* Parcours pro */}
  <div className="flex items-center gap-3 mb-2">
    <BookOpen className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">A Fresh Start</h4>
  </div>
  <p className="text-gray-300 text-lg">
    <strong>I'm a French guy, currently switching careers to move into cybersecurity.</strong>  
    In September, I’ll start a formal work-study program in IT and networking, but honestly, my journey started long before that.
  </p>

  {/* Métier précédent et déclic */}
  <div className="bg-violet-900/20 rounded-lg p-4 space-y-3">
    <div className="flex items-center gap-2">
      <Monitor className="w-6 h-6 text-violet-400" />
      <span className="text-violet-300 font-semibold">Fiber Optics Field Technician</span>
    </div>
    <p className="text-gray-300">
      Pulling cables, doing installations, repeating the same tasks every day. After a while, I felt stuck: no learning, no future.  
      <span className="block font-semibold text-violet-400 mt-2">That’s what pushed me to change.</span>
    </p>
  </div>

  {/* Parcours d'autoformation */}
  <div className="flex items-center gap-2 mb-2">
    <Brain className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Self-Training Journey</span>
  </div>
  <p className="text-gray-300">
    For the past nine months, I've trained on my own almost every day (6-7h daily):  
  </p>
  <ul className="list-disc ml-8 text-gray-300 space-y-1">
    <li>Completed all learning paths on <strong>TryHackMe</strong></li>
    <li>Passed the <strong>eJPT</strong> certification</li>
    <li>Recently cleared the <strong>CPTS (Hack The Box)</strong></li>
  </ul>
  <p className="text-gray-300">
    This wasn’t about collecting certs — it was about <strong>real learning</strong>, building skills, and proving to myself I could grow through hard work.
  </p>

  {/* Esprit tryhard, outils et méthodo */}
  <div className="flex items-center gap-2 mb-2">
    <FileText className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Tryhard Mindset & Tools</span>
  </div>
  <p className="text-gray-300">
    I’m what you might call a <strong>“tryharder”</strong>. When something motivates me, I give it 300%.  
    I write down everything I learn, structure my notes, and go deep:
  </p>
  <ul className="list-disc ml-8 text-gray-300 space-y-1">
    <li>Custom <strong>Exegol</strong> setup</li>
    <li>Daily use of <strong>Obsidian</strong></li>
    <li>Reporting with <strong>SysReptor</strong> — even for training</li>
    <li>No skipping steps, no copy-paste walkthroughs</li>
    <li>Goal: Understand, not just repeat</li>
  </ul>

  {/* Pourquoi cet article */}
  <div className="bg-violet-900/20 rounded-lg p-4 space-y-2">
    <div className="flex items-center gap-2">
      <Users className="w-6 h-6 text-violet-400" />
      <span className="text-violet-300 font-semibold text-lg">Why I wrote this article</span>
    </div>
    <p className="text-gray-300">
      When preparing for the CPTS, the blog by  
      <a
        href="https://www.brunorochamoura.com/posts/cpts-tips/"
        target="_blank"
        className="text-violet-400 hover:underline font-semibold ml-1"
      >
        Bruno Rocha Moura
      </a>  
      helped me a lot. His tips gave me a structure and kept me focused.<br />
      In the same spirit, I’m writing this to give back.  
      <strong>If you’re wondering whether CPTS is worth it, or you need direction, I hope this helps you.</strong>
    </p>
  </div>

  {/* Valeur du partage */}
  <p className="text-gray-400 text-base italic mt-2">
    <span className="text-violet-400 font-semibold">My mindset:</span>  
    In cybersecurity , we grow by helping each other — via write-ups, forums, blogs, even Discord chats.  
    If this post helps even one person feel more confident or prepared, it was worth writing.
  </p>
</div>

      </div>

      {/* Why CPTS After eJPT */}
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Why CPTS After eJPT?
        </h3>
        <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  {/* Passage eJPT */}
  <div className="flex items-center gap-3 mb-2">
    <Award className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">eJPT: The First Step</h4>
  </div>
  <p className="text-gray-300 text-lg">
    I passed the <strong>eJPT</strong> in <strong>February 2025</strong>, right in the middle of the <strong>CPTS learning path</strong>.  
    I had just started digging into the HTB modules when I saw a <strong>promo for the exam</strong>.  
    So I said to myself, “Let’s give it a try — even if I fail, I’ll learn something.”  
    I had already done all the <strong>TryHackMe learning paths</strong>, including the <strong>Junior Penetration Tester track</strong>, so I had some ground to stand on.
  </p>

  {/* Stress et réussite */}
  <div className="flex items-center gap-2 mb-2">
    <Target className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Facing the Challenge</span>
  </div>
  <p className="text-gray-300">
    I was honestly <strong>stressed</strong>. First cert, first timed exam, and I didn’t think I was ready at all.  
    But it went way better than expected — I finished it in <strong>6 hours out of the 48</strong>.  
    That boosted my confidence a lot.
  </p>
  <div className="bg-violet-900/20 rounded-lg p-4 space-y-2">
    <p className="text-violet-300 font-semibold">
      <Brain className="w-5 h-5 inline-block mb-1 mr-1 text-violet-400" />
      If you’ve done the learning paths on THM, you can definitely take the eJPT.
    </p>
    <p className="text-gray-300">
      It’s a great cert to <strong>validate your fundamentals</strong> in networking and basic pentesting.
    </p>
  </div>

  {/* Passage au CPTS, constat du gap */}
  <div className="flex items-center gap-2 mb-2">
    <ArrowRight className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">From eJPT to CPTS</span>
  </div>
  <p className="text-gray-300">
    But right after that, when I got deeper into the CPTS modules…  
    I saw the <strong>gap</strong>. The CPTS felt way more <strong>advanced</strong>, way more <strong>realistic</strong>.<br />
    I realized the eJPT had confirmed I was <strong>no longer a beginner</strong> — but I still had a long way to go to be solid.  
    That’s where CPTS made sense.
  </p>

  {/* Choix stratégique CPTS vs OSCP */}
  <div className="flex items-center gap-2 mb-2">
    <Shield className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Why CPTS First?</span>
  </div>
  <p className="text-gray-300">
    I picked CPTS instead of jumping straight into <strong>OSCP</strong> because I want to <strong>train properly</strong> — not just rush into something.  
    Plus, let’s be honest: the OSCP is <strong>expensive</strong>, and I’ve seen a lot of feedback saying the course material isn’t that great.  
    The <strong>HTB content</strong>, on the other hand, is <strong>super high quality</strong>.  
    The modules are <strong>dense, structured, and practical</strong>.  
    And the CPTS cert is <strong>affordable</strong>, which matters when you're self-funding your learning like I am.
  </p>

  {/* Conclusion et conseil pour les lecteurs */}
  <div className="bg-violet-900/20 rounded-lg p-4 space-y-2">
    <p className="text-violet-300 font-semibold flex items-center gap-2">
      <Shield className="w-5 h-5 text-violet-400" />
      <span>CPTS: The Smart Choice</span>
    </p>
    <p className="text-gray-300">
      I see the CPTS as a <strong>serious technical milestone</strong> before going for OSCP later, mostly for <strong>HR visibility</strong>.<br />
      But right now, CPTS was the <strong>smart, realistic choice</strong> for where I was.  
      Great content, <strong>real-world challenges</strong>, and an exam that forces you to <strong>think like a pentester</strong> — not just follow steps.
    </p>
  </div>
  <p className="text-gray-400 text-base italic mt-2">
    <span className="text-violet-400 font-semibold">Advice:</span>
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
        <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  {/* Parcours global sur le path */}
  <div className="flex items-center gap-3 mb-2">
    <BookOpen className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">The Penetration Tester Learning Path</h4>
  </div>
  <p className="text-gray-300 text-lg">
    I spent about <strong>3 to 4 months</strong> working through the entire <strong>Penetration Tester learning path</strong> on Hack The Box.
    I didn’t try to rush it — I treated each module like a mini-course, often going back over topics until I fully understood them.  
    The path is <strong>incredibly rich</strong>, both in technical depth and real-world relevance.  
    <span className="block mt-1">Anyone with motivation — even starting from scratch — can finish this path and be ready for the CPTS.  
    You just need to be <strong>consistent</strong>, and willing to take your time when it gets tough.</span>
  </p>

  {/* Apprentissage progressif, logique de structuration */}
  <div className="flex items-center gap-2 mb-2">
    <Brain className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Learning Structure</span>
  </div>
  <p className="text-gray-300">
    At first glance, the 28 modules might feel overwhelming, especially if you're new to structured cybersecurity learning.  
    But what I appreciated is the <strong>progressive layering</strong>. The first modules set the foundations, each one adds more complexity and realism.  
    <span className="block mt-1">If you follow through, your mindset will shift — you stop thinking like a student and start thinking like a pentester.</span>
  </p>

  {/* Stratégie d'apprentissage, rythme & méthode */}
  <div className="flex items-center gap-2 mb-2">
    <Monitor className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">My Method</span>
  </div>
  <p className="text-gray-300">
    I didn’t set fixed goals like “one module per day” — some modules took 2-3 hours, others like <strong>Attacking Enterprise Networks</strong> or <strong>Password Attacks</strong> took up to <strong>5 full days</strong>.
    I worked in long, focused sessions (usually 5 to 7 hours per day), with structured note-taking in <strong>Obsidian</strong>.
    After each module, I picked a related <strong>HTB box</strong> to reinforce the concepts.
    <span className="block mt-1">Connecting theory and practice is where the learning really sticks.</span>
  </p>

  {/* Exemple : module > box > notes */}
  <div className="flex items-center gap-2 mb-2">
    <ListChecks className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">From Module to Practice</span>
  </div>
  <p className="text-gray-300">
    For example, after <strong>Linux Privilege Escalation</strong>, I tackled two medium-difficulty boxes with known privesc vectors.
    I used my notes as a checklist — it showed me exactly where I was solid, and where I had gaps.
  </p>
  <div className="bg-violet-900/20 rounded-lg p-4">
    <FileText className="w-5 h-5 text-violet-400 inline-block mr-1 mb-1" />
    <span className="text-gray-300">
      <strong>Your personal notes are more valuable than the module PDFs.</strong>  
      Write everything down as if you were creating your own training material.
    </span>
  </div>

  {/* Modules marquants */}
  <div className="flex items-center gap-2 mb-2">
    <CheckCircle2 className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Standout Modules</span>
  </div>
  <div className="bg-violet-900/20 rounded-lg p-4">
    <ul className="list-disc ml-6 text-gray-300 space-y-1">
      <li><strong>Attacking Enterprise Networks</strong>: A <span className="font-semibold">mini CPTS exam</span>. Long, detailed, and mimics the real format. It was a turning point — the ultimate test of readiness.  
        It teaches chaining: enumeration, privesc, pivoting, lateral movement, reporting.</li>
      <li><strong>Penetration Testing Process</strong>: Might seem basic, but it gives you the <span className="font-semibold">mindset and workflow</span> for the entire path.</li>
      <li><strong>Active Directory Enumeration & Attacks</strong>: The most <span className="font-semibold">complete and clear</span> module. Helped me build checklists and get real with AD exploitation — tools, logic, and real-life applicability.</li>
      <li><strong>Documentation and Reporting</strong>: Often overlooked, but <span className="font-semibold">critical for the exam</span>. Use it to structure your own report in <strong>SysReptor</strong>.</li>
      <li><strong>Command Injection</strong> & <strong>SQLi</strong>: Good balance of theory and practice — clear payloads, bypasses, and a lot of practice in boxes.</li>
    </ul>
  </div>

  {/* Modules moins marquants */}
  <div className="flex items-center gap-2 mb-2">
    <Cpu className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Weaker Modules</span>
  </div>
  <div className="bg-violet-900/20 rounded-lg p-4">
    <ul className="list-disc ml-6 text-gray-300 space-y-1">
      <li><strong>Password Attacks</strong>: Important but too passive. A lot of waiting — not very educational past a certain point.</li>
      <li><strong>Shells & Payloads</strong>: Felt <span className="font-semibold">out of place</span>, concepts scattered, better covered elsewhere.</li>
      <li><strong>Linux Privilege Escalation</strong>: Good examples but lacked a clear <span className="font-semibold">methodology</span>. I expanded it with CTF and PEASS/g0tmi1k resources.</li>
      <li><strong>Vulnerability Assessment</strong>: A bit dry — covers basics but not deep, nothing wrong but not exciting.</li>
    </ul>
  </div>

  {/* Avis sur la valeur et le prix du cursus */}
  <div className="flex items-center gap-2 mb-2">
    <Network className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Pricing & Value</span>
  </div>
  <p className="text-gray-300">
    Even the weaker modules are <strong>still solid</strong>. HTB doesn’t cut corners, and pricing is extremely fair.
    I went with the <strong>HTB Silver subscription</strong> — <strong>€410/year</strong> for <strong>all 28 modules</strong>, labs, updates, and a <strong>voucher for the CPTS exam</strong>.  
    When you compare it to other certs (looking at you, OSCP), it’s honestly a steal.
  </p>

  {/* Conseil final */}
  <div className="bg-violet-900/20 rounded-lg p-4">
    <span className="text-violet-400 font-semibold"><CheckCircle2 className="w-5 h-5 inline-block mb-1 mr-1" />Advice:</span>
    <span className="text-gray-300">  
      Take your time. <strong>Work module by module, box by box</strong>.  
      Document everything, don’t move on until it clicks.  
      The content is designed to turn you into a practitioner, not just someone who memorizes flags.  
      If you do it right, you’ll be surprised how far you’ve come.
    </span>
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

      {/* Final Preparation & Exam Sprint */}
  <section className="mb-16">
    <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="w-8 h-8 text-violet-400" />
        <h2 className="text-3xl font-bold">Final Preparation & Exam Sprint</h2>
      </div>
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Final 10-Day Sprint
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p>
        At <strong>Day -10</strong>, I had already completed the entire <strong>learning path</strong>, the <strong>HTB boxes</strong>, and the full <strong>IppSec playlist</strong>.
        So, I decided to take a proper break — about <strong>3 to 4 full days</strong> off.
      </p>

      <p>
        I really believe that <strong>resting is just as important as grinding</strong>. Your brain needs time to digest and organize everything you've learned.
      </p>

      <p>
        Once I came back fresh, I spent the remaining time going through <strong>all my notes</strong> and making them cleaner and more organized inside <strong>Obsidian</strong>. 
        I structured everything properly, by phase of the pentest, and made sure I could retrieve any technique or command quickly if needed.
      </p>

      <p>
        That was my only focus during those 10 days. No more labs, no boxes, no distractions. Just refinement, calm, and preparation.
      </p>
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
            <p>
            First of all, let me say it loud and clear: <strong>Exegol is French. COCORICO 🇫🇷</strong><br />
            And Kali? You’re <em>mauvais</em>, like Jack in OSS 117. 🕶️ That’s right — I said it.
          </p>
          <p>
            All jokes aside, switching from Kali to Exegol was one of the best choices I made in my CPTS prep. 
            <strong>Exegol is a container-based offensive security environment</strong> built on top of Docker, with everything you need already installed, configured, and tested. It’s stable, lightweight, and super fast to deploy. You want a fresh environment in 2 seconds? Boom — done.
          </p>
          <p>
            I used Exegol as my <strong>main offensive toolkit</strong> throughout the entire learning path and exam. It never failed me, and I’ll never go back to Kali or Parrot again. My setup was simple but powerful: 
            <strong>Arch Linux + Exegol</strong>. That combo gave me performance, control, and consistency.
          </p>

          <div>
            <p className="font-semibold text-violet-400">🔧 Key tools inside Exegol that helped me crush the CPTS:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>Ligolo-ng</strong> – For tunneling and pivoting inside internal networks. Essential for lateral movement.</li>
              <li><strong>NetExec</strong> – Perfect for credential spraying, SMB enumeration, and assessing exposed shares.</li>
              <li><strong>FFuf</strong> – Incredibly useful for quick and precise web fuzzing during enumeration and exploitation.</li>
              <li><strong>Burp Suite</strong> – My go-to for web attacks, CSRF bypass, cookie inspection, and XSS proof of concept.</li>
              <li><strong>BloodyAD</strong> – Helped a ton with AD enumeration, much simpler than setting up BloodHound in most cases.</li>
              <li><strong>Impacket Tools</strong> – Tools like `secretsdump.py`, `smbexec.py`, and `wmiexec.py` are absolute must-haves for Windows exploitation.</li>
              <li><strong>smbserver.py</strong> – Quick and easy way to serve payloads or retrieve loot during the exam.</li>
              <li><strong>Nmap</strong> – Of course. Fast, reliable, and all the scripts are ready to go out of the box.</li>
            </ul>
          </div>

          <p>
            What makes Exegol truly shine is how much <strong>time and headaches it saves</strong>. You don’t need to install or troubleshoot anything. Everything is preconfigured, organized, and designed for offensive ops. When you're deep into a 10-day exam grind, <strong>that matters more than anything</strong>.
          </p>

          <div>
            <p className="font-semibold text-violet-400">✨ Why I’ll never go back:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Launches in seconds with Docker, without polluting your host system.</li>
              <li>Zero crash, zero weird package issues — unlike Kali after every `apt upgrade`.</li>
              <li>Perfect structure for notetaking, screenshots, payload hosting, and log retention.</li>
              <li>Felt like I was using a professional toolkit, not a hobbyist’s distro.</li>
            </ul>
          </div>

          <p>
  And did I mention again? <strong>It’s French 🇫🇷</strong>. And it rocks.  
  If you're curious about how to set it up, why I switched, and how it helped me save hours during the CPTS exam, 
  I’ve written a full article about it:  
  <a 
    href="https://trxtxbook.com/articles/exegol-docker" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-violet-400 underline hover:text-violet-300"
  >
    Exegol: The Ultimate CPTS Toolkit
  </a>.  
  Feel free to check it out for a deep dive into my workflow and why I’ll never go back to Kali again.
</p>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            SysReptor & Obsidian for Notes & Reporting
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p>
    Documenting a penetration test isn’t just about writing a report; it’s about making your knowledge actionable, transferable, and reusable. That’s why I used <strong>two distinct tools</strong> that complement each other perfectly:
  </p>

  <h4 className="text-xl font-semibold text-violet-300">Obsidian: My Personal Knowledge Hub</h4>
  <p>
    <strong>Obsidian</strong> was my central tool for managing knowledge during the CPTS journey. I used it as my second brain, making sure every command, every CVE, and every exploitation technique was properly documented, explained, and categorized.
  </p>

  <p>Here’s a simplified version of my Obsidian tree structure:</p>
<details className="group bg-[#2a2a2f] rounded-lg p-4 text-white open:ring-1 open:ring-violet-600 transition-all">
  <summary className="cursor-pointer text-violet-400 font-semibold text-lg mb-2">
    📂 Click to view full Obsidian tree structure
  </summary>
  <pre className="bg-black text-white text-sm rounded p-4 mt-4 overflow-x-auto whitespace-pre-wrap">
{`📁 CPTS
  ├── 1- Information Gathering
│   ├── 1- Service Enumeration
│   │   ├── Services
│   │   │   ├── DNS (53)
│   │   │   │   ├── Attack DNS.md
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Record Types
│   │   │   ├── FTP (21)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enumeration.md
│   │   │   ├── IMAP (143, 993)
│   │   │   │   └── Commands
│   │   │   ├── IPMI (623)
│   │   │   │   ├── Authentication
│   │   │   │   └── Default Credentials
│   │   │   ├── IPMI (623).md
│   │   │   ├── Kerberos (88)
│   │   │   │   └── Kerberos.md
│   │   │   ├── LDAP (389,3268).md
│   │   │   ├── MSSQL (1433, 1434, 2433)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   ├── Enum.md
│   │   │   │   ├── T-SQL Commands
│   │   │   │   └── Windows Exploitation.md
│   │   │   ├── MySQL (3306)
│   │   │   │   ├── Basic SQL Queries
│   │   │   │   └── Dangerous Settings
│   │   │   ├── NFS (2049)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enum.md
│   │   │   ├── Oracle TNS (1521)
│   │   │   │   ├── Enum.md
│   │   │   │   ├── SQLplus Commands
│   │   │   │   └── Troubleshooting
│   │   │   ├── POP3 (110, 995)
│   │   │   │   ├── Commands
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enum.md
│   │   │   ├── R-Services (512, 513, 514)
│   │   │   │   ├── Enum.md
│   │   │   │   └── Service Breakdown
│   │   │   ├── RDP (3389)
│   │   │   │   └── Enumeration.md
│   │   │   ├── RPC.md
│   │   │   ├── Rsync (873)
│   │   │   │   └── Enumeration.md
│   │   │   ├── SMB (139, 445)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   ├── Enumeration.md
│   │   │   │   ├── RPCClient
│   │   │   │   ├── Spidering
│   │   │   │   └── Windows Specific
│   │   │   ├── SMTP (25, 465, 587)
│   │   │   │   ├── Common Commands
│   │   │   │   └── enumeration.md
│   │   │   ├── SNMP (161, 162, 10161, 10162)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enumeration.md
│   │   │   ├── SSH (22)
│   │   │   │   ├── Authentication
│   │   │   │   └── Dangerous Settings
│   │   │   ├── TFTP (69)
│   │   │   │   └── enumeration.md
│   │   │   ├── Telnet (23).md
│   │   │   └── WinRM (5985, 5986)
│   │   │       └── enumeration.md
│   │   └── Tools
│   │       ├── Nmap
│   │       │   ├── Firewall and IDS
│   │       │   └── Host Discovery
│   │       ├── WMIexec
│   │       │   └── Wmiexec.md
│   │       ├── creds
│   │       │   └── Credential Tools.md
│   │       └── tcpdump
│   │           └── Tcpdump.md
│   ├── Active Directory Enumeration
│   │   ├── ACL Enumeration
│   │   │   └── Acl ├⌐num├⌐ration.md
│   │   ├── Credential AD enumeration
│   │   │   ├── Credential AD Linux.md
│   │   │   └── Credential AD windows.md
│   │   ├── Enumerating Security Controls
│   │   │   └── Enumerating security control.md
│   │   ├── Hosts Enumeration
│   │   │   └── Initial Domain Enumeration.md
│   │   ├── LLMNR_NBT-NS Poisoning
│   │   │   ├── From Linux.md
│   │   │   └── From Windows.md
│   │   ├── Living Off The Lands.md
│   │   ├── Password Policy Enumeration
│   │   │   └── Enumerating & Retrieving Password Policies.md
│   │   ├── Password Spraying
│   │   │   ├── Linux.md
│   │   │   └── Windows.md
│   │   ├── Resume Skill Assesment HTB.md
│   │   ├── SMB Enumeration
│   │   │   └── Smb ├ënum├⌐ration.md
│   │   ├── Tools
│   │   │   ├── BloodHound
│   │   │   │   ├── Analysis
│   │   │   │   └── Utilisation.md
│   │   │   └── PowerView
│   │   │       └── Powerview.md
│   │   └── User Enumeration
│   │       ├── With Access
│   │       │   └── With Access.md
│   │       └── Without Access
│   │           └── User Enumeration Without access.md
│   ├── Application Enumeration
│   │   ├── Attacking Applications Connecting to Services.md
│   │   ├── ColdFusion
│   │   │   └── Cold Fusion.md
│   │   ├── Drupal
│   │   │   └── Drupal.md
│   │   ├── GitLab
│   │   │   └── Gitlab.md
│   │   ├── IIS Tilde Enumeration
│   │   │   └── IiS tilde ├ënum├⌐ration.md
│   │   ├── Jenkins
│   │   │   └── Jenkins.md
│   │   ├── Joomla
│   │   │   └── Joomla.md
│   │   ├── Other Notable App.md
│   │   ├── PRTG Network Monitor
│   │   │   └── Prtg network monitor.md
│   │   ├── Shellshock CGI.md
│   │   ├── Splunk
│   │   ├── ThinkClient App tier2 and tier3.md
│   │   ├── Tomcat
│   │   │   ├── Tomcat CGi.md
│   │   │   └── Tomcat.md
│   │   ├── Wordpress
│   │   │   └── WordPress.md
│   │   └── osTicket
│   │       └── Osticket.md
│   ├── Enumeration Basic Linux Systeme.md
│   ├── Enumeration Basic Windows Systeme.md
│   └── Web Enumeration
│       ├── Active
│       │   ├── Directory & Page Fuzzing
│       │   │   ├── Directory And Page Fuzzing avec Dirsearch.md
│       │   │   └── Directory and page fuzzing FFUF.md
│       │   ├── Parameter & Value Fuzzing
│       │   │   └── Param├⌐trer and value fuzzing.md
│       │   ├── Subdomain & Virtual Host Fuzzing
│       │   │   └── Subdomain and virtual host enum.md
│       │   └── Web Server Enumeration
│       │       └── Web server enumeration.md
│       ├── Passive
│       │   ├── Google Dorking
│       │   │   └── Google dorking.md
│       │   └── Passive Infrastructure Identification
│       │       ├── Passive Subdomain Enumeration
│       │       └── Passive infra enumeration.md
│       └── Tools
│           └── EyeWitness
│               └── EyeWitness.md
├── 2- Exploitation
│   ├── Credential Exploitation.md
│   ├── Pre-Exploitation
│   │   ├── Shells
│   │   │   ├── Bind Shells.md
│   │   │   ├── Payloads.md
│   │   │   ├── Reverse Shell.md
│   │   │   ├── Webshells.md
│   │   │   └── Windows Shells.md
│   │   └── Tools
│   │       ├── Metasploit Components.md
│   │       ├── Metasploit Session.md
│   │       ├── Metasploit Venom.md
│   │       └── Searchsploit
│   │           └── Searchsploot.md
│   ├── Service Exploitation
│   │   └── Web Exploitation
│   │       ├── CGI Shellshock Attack
│   │       │   └── CGI shellshock attack.md
│   │       ├── CSRF.md
│   │       ├── Command Injection
│   │       │   ├── Cheatsheets complet.md
│   │       │   └── Skill Assessment R├⌐sumer.md
│   │       ├── Cross-Site Scripting (XSS)
│   │       │   ├── Discovery
│   │       │   ├── Phishing
│   │       │   ├── Session Hijacking
│   │       │   └── ≡ƒöÑ XSS to Local File Read (XSS2LFR) via JavaScript in PDF Generator.md
│   │       ├── File Uploads
│   │       │   └── Basic.md
│   │       ├── HTTP Verb Tampering.md
│   │       ├── IDOR.md
│   │       ├── Local File Inclusion (LFI)
│   │       │   ├── File Disclosure
│   │       │   ├── Filter Bypass
│   │       │   ├── LFI to RCE
│   │       │   └── PHP decoding webpage.md
│   │       ├── SQLi
│   │       │   ├── SQL Injection NoSQL Injection.md
│   │       │   ├── SQLMAP.md
│   │       │   └── Union Sqli.md
│   │       ├── Skill Assessment Web Attacks (xxe,idor,xml,httpverb).md
│   │       └── XXE
│   │           ├── Blind
│   │           ├── File Disclosure
│   │           ├── RCE
│   │           ├── XXE GLOBAL.md
│   │           └── Xxe.md
│   └── Tools
│       └── Credential Generating.md
├── 3- Lateral Movement
│   ├── Linux Lateral Movement
│   │   └── Kerberos Pass the Ticket
│   │       ├── Ccache Files
│   │       │   └── Ccache Filles.md
│   │       ├── Kerberos Pass the Tiket.md
│   │       ├── KeyTab Files
│   │       │   └── Keytabs File.md
│   │       ├── Linikatz
│   │       │   └── Linikatz.md
│   │       └── Mimikatz.md
│   ├── Pivoting
│   │   ├── Advanced Tunneling
│   │   │   ├── DNS Tunneling (Dnscat2).md
│   │   │   └── SOCKS_ICMP Tunneling.md
│   │   ├── Double Pivoting
│   │   │   └── RDP et SOCKS Tunneling avec SocksOverRDP.md
│   │   ├── Dynamic and Local Port Forwarding
│   │   │   ├── Dynamic Port Forwarding (SOCKS, SSH).md
│   │   │   └── Remote_Reverse Port Forwarding avec SSH.md
│   │   ├── Meterpreter_&_Socat
│   │   │   ├── Meterpreter Pivoting_port_forwarding.md
│   │   │   └── Socat Reverse & Bind Shell.md
│   │   ├── Pivoting Methods
│   │   │   ├── Chisel ( SOCKS5 Tunneling).md
│   │   │   ├── Netsh (Windows Port Forwarding).md
│   │   │   ├── Plink, Sshuttle (SSH Pivoting).md
│   │   │   └── Rpivot (Web Server Pivoting).md
│   │   ├── Pivoting.md
│   │   ├── Tableau  Recapitulatif des M├⌐thodes de Pivoting.md
│   │   └── Tools
│   │       ├── Draw.io.md
│   │       ├── Meterpreter
│   │       │   └── Meterpreter pivoting.md
│   │       ├── Netsh
│   │       │   └── Netsh.md
│   │       ├── Plink
│   │       │   └── Plink.md
│   │       ├── RPIVOT
│   │       │   └── RPIVOT.md
│   │       └── Sshuttle
│   ├── Windows Lateral Movement
│   │   ├── ACL DCSYNC ATTACK.md
│   │   ├── ADCS ESC 1 A 13 BIG DOSSIER
│   │   │   ├── ESC1.md
│   │   │   ├── ESC2.md
│   │   │   └── ESC3.md
│   │   ├── Active Directory Lateral Movement
│   │   │   ├── ACL Exploitation_Lateral_Abuse.md
│   │   │   ├── Double Hob Kerberos Problem.md
│   │   │   ├── RDP
│   │   │   │   └── Priviliged Access_rdp_winrm_linux_windows_mssql.md
│   │   │   └── Vul Recente_print-nightmare_potipotam_NoPac.md
│   │   ├── Domain Trust Forest
│   │   │   ├── Attacking Domain Trust Linux.md
│   │   │   ├── Attacking Domain Trust windows.md
│   │   │   ├── Attacking Domain Trusts - Cross-Forest Trust Abuse - from Linux.md
│   │   │   ├── Attacking Domain Trusts-Cross-Forest Trust Abuse - from Windows.md
│   │   │   └── Domain Trust.md
│   │   ├── Kerberos Pass the Ticket
│   │   │   ├── Kerberoasting Pass The ticket from windows.md
│   │   │   ├── Kerberos Pass the Ticket From Linux.md
│   │   │   └── Ticket Request
│   │   ├── Misconfiguration AD exploit.md
│   │   ├── NTLM Pass the Hash
│   │   ├── PowerView.ps1 AD.md
│   │   ├── SeBackUpPrivilege Abuse.md
│   │   └── ≡ƒº¿ ESC4 ΓÇô Exploitation via WriteOwner.md
│   └── dfsdsfdsf.md
├── 4- Post-Exploitation
│   ├── Linux Post Exploitation
│   │   ├── File Transfer
│   │   │   ├── Linux Technique.md
│   │   │   ├── Living Of The Lands.md
│   │   │   ├── Technique Supplementaire.md
│   │   │   ├── Transfer Files with Codes.md
│   │   │   └── Windows Technique.md
│   │   └── Privilege Escalation
│   │       ├── 1 - Information Gathering.md
│   │       ├── 2 - Environment-based Privilege Escalation.md
│   │       ├── 3 - Permissions-based Privilege Escalation.md
│   │       ├── 4 - Service-based Privilege Escalation.md
│   │       ├── 5 - Linux Internals-based Privilege Escalation.md
│   │       ├── 6 - Recent 0-Days.md
│   │       └── Technique de PrivEsc.md
│   ├── Password Attacks
│   │   ├── Cracking Files.md
│   │   ├── Linux Password Attacks.md
│   │   ├── PassTheHash.md
│   │   ├── Remote Password Attacks.md
│   │   └── Windows Local Password Attacks.md
│   └── Windows Post Exploitation
│       ├── Info
│       │   ├── Access Control List (ACL)
│       │   ├── Accounts
│       │   ├── Built-in AD Groups
│       │   ├── Execution Policy
│       │   ├── NTFS
│       │   ├── PowerShell
│       │   ├── Registry
│       │   └── Services
│       ├── Kernel Exploits
│       └── Privilege Escalation
│           ├── AD Certificates Services.md
│           ├── Kerberbroasting
│           │   ├── Kerberoasting.md
│           │   └── Targeted Kerberoasting.md
│           ├── Legacy Operating Systems
│           │   ├── Windows 7
│           │   └── Windows Server 2008
│           ├── Password Attacks
│           │   ├── Hydra.md
│           │   ├── JohnTheRipper.md
│           │   ├── Linux Credential Hunting.md
│           │   ├── Linux Passwd, Shadow & Opasswd.md
│           │   ├── WD Active Directory & NTDS.dit.md
│           │   ├── WD Attacking LSASS.md
│           │   ├── WD Credential Hunting.md
│           │   └── WD Windows Attacking SAM and LSA.md
│           ├── Privilege escalation
│           │   ├── 1 - Lay of the Lands.md
│           │   ├── 2 - Windows User Privileges.md
│           │   ├── 3 - Windows Group Privileges.md
│           │   ├── 4 - Attacking the OS.md
│           │   ├── 5 - Credential Hunting.md
│           │   ├── 6 - Restricted Environments.md
│           │   ├── 7 - Additional Technique.md
│           │   ├── 8 - End of life System.md
│           │   └── Sans titre 8.md
│           ├── Privileged Groups
│           │   ├── Backup Operators
│           │   ├── DnsAdmins
│           │   └── Print Operators
│           └── User Privileges
│               ├── Abusing Privilege AD.md
│               ├── SeDebugPrivilege
│               └── SeImpersonate & SeAssignPrimaryToken
`}
  </pre>
</details>
  <p>
    I strongly advise anyone preparing for the CPTS to <strong>create their own structured note-taking system</strong> like this. Not only does it improve retention, but it also gives you something to reference during the exam. Organizing your thoughts while learning pays off during pressure.
  </p>

  <h4 className="text-xl font-semibold text-violet-300">SysReptor: The Final Weapon for Reporting</h4>
  <p>
    For the actual report submission, I used <strong>SysReptor</strong>. It’s HTB’s own reporting platform and makes the entire process smooth and professional.
  </p>

  <p>
    What I liked most about it was the <strong>structured reporting workflow</strong>. Each vulnerability gets a dedicated “Finding” entry, with a severity level, impact, reproduction steps, screenshots, and mitigation. It helped me maintain consistency and clarity throughout my <strong>190-page report</strong>.
  </p>

  <p>Here’s what my typical SysReptor structure looked like:</p>

  <ul className="list-disc pl-6 text-sm">
    <li><strong>Walkthrough:</strong> Chronological attack steps, covering each phase</li>
    <li><strong>Findings:</strong> Each vulnerability in detail (IDOR, SSRF, SQLi...)</li>
    <li><strong>Flags:</strong> Flag IDs and how they were captured</li>
    <li><strong>Recommendations:</strong> Clear, professional advice per issue</li>
  </ul>

  <p>
    I filled SysReptor in real-time during the exam using the <strong>“trigger-based method”</strong>: every time I discovered something important or completed a step, I immediately documented it. No time wasted at the end.
  </p>

  <p>
    <strong>Final tip:</strong> Obsidian is for you, SysReptor is for HTB. Keep both clean, concise, and well-structured.
  </p>
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
            <p>
    The CPTS exam simulates a <strong>real-world offensive engagement</strong> against a fictional company. While I can’t share too much detail due to HTB’s terms and conditions, I can confidently say: <strong>this is the closest thing to a real pentest you’ll get in a certification exam</strong>.
  </p>

  <p>
    From the beginning, you’re provided with a clear scope via a letter of engagement — just like in a professional red team operation. The initial entry point is a public-facing web application, and from there, your job is to compromise the internal network and escalate access.
  </p>

  <p>
    Your mission? <strong>Fully compromise two separate Active Directory domains</strong> (yes, two!) and gain access to at least <strong>12 out of 14 flags</strong> spread across the infrastructure.
  </p>

  <p>
    The network is <strong>vast and realistic</strong>. Internal segmentation, Windows and Linux hosts, and pivoting requirements will force you to approach it with method and patience. Double pivoting is mandatory — and tools like <strong>Ligolo-ng</strong> will become your best friend.
  </p>

  <p>
    The vulnerabilities themselves are not exotic or advanced: every single one of them was covered during the CPTS Learning Path. But don’t be fooled — the <strong>scale and density of the infrastructure</strong> can easily mislead you. There aren’t any real "rabbit holes" like you’d find in HTB Hard/Insane boxes, but the size of the environment means you can waste hours exploring dead ends if you don't stay pragmatic.
  </p>

  <p>
    The exam spans <strong>10 full days</strong>. Personally, I worked an average of <strong>7 hours per day</strong>. Expect multiple roadblocks — sometimes I was stuck for a day or more. When that happened, I had to take a step back, re-enumerate, and think critically. You’re not just solving puzzles; you’re simulating the mindset of a hacker. Creativity and adaptability are just as important as technical skill.
  </p>

  <p>
    The Learning Path prepares you <strong>perfectly</strong> for this — but don’t rely on automation or tunnel vision. Think like an attacker. Move laterally. Stay focused. Be methodical.
  </p>

  <p>
    For the report, I used <strong>SysReptor</strong> and exported everything as a polished PDF. I strongly recommend this method — it’s clean, professional, and fits HTB’s expectations. Optionally, you can also include annexes with technical evidence like <strong>a full DC dump or password policy audit (e.g., DPAT analysis)</strong> if relevant.
  </p>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Daily Breakdown
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
           <p>
                I went into the exam <strong>well-prepared</strong>, with a strong methodology and solid habits… or so I thought. On <strong>Day 1</strong>, I had promised myself to document everything into SysReptor <strong>every evening</strong>. <br/>
                ❌ <strong>Big mistake.</strong>
              </p>

              <p>
                What really works is the <strong>real-time trigger-based approach</strong> — every time you discover something (a port, a user, a foothold, a flag…), take a few seconds to document it <em>immediately</em>. I’ll explain this in more detail in the reporting strategy section, but take this as your first big lesson.
              </p>

              <p>
                💡 And yes, I used <strong>ChatGPT</strong> to help me speed up parts of the writing (especially impact/mitigation sections), but I always <strong>reviewed and rewrote everything</strong> to make sure it matched my style and findings.
              </p>

              <p>
                In terms of progress, the first days were fast — I gained solid access early and moved forward smoothly until I hit <strong>flag 9</strong>. From there, things got tougher. What helped was stepping back, <strong>re-enumerating</strong>, and reanalyzing everything. That’s how I unlocked the path to the next steps. 
              </p>

              <p>
                The same happened with <strong>flag 12</strong>. There’s no shame in going backward to move forward. The content is dense, and it’s mentally stressful to have only 9 flags by <strong>Day </strong>. But don’t panic — stay calm, think smart, and keep moving.
              </p>

              <p>
                And  again: <strong>WRITE YOUR REPORT IN REAL-TIME</strong>.
              </p>
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
            <p>
        During my CPTS exam, I initially planned to write the report every evening. <strong>Big mistake.</strong>  
        With the mental fatigue and the need to keep momentum, it quickly became unsustainable.  
        That’s when I decided to apply a <strong>real-time reporting workflow</strong>, and it made a massive difference.
      </p>

      <p>
        I followed a <strong>trigger-based strategy</strong>: as soon as I discovered something relevant (new service, credentials, shell, etc.),  
        I immediately documented it in <strong>SysReptor</strong> and took supporting notes in <strong>Obsidian</strong>.  
        This method kept everything fresh, and I never had to backtrack through a mountain of logs.
      </p>

      <p>
        For example, when I compromised a user in the <code>domain</code> and gained access to a shared folder,  
        I directly opened SysReptor, created a <strong>Finding</strong>, linked the vulnerable service (SMB), inserted the steps (enum → creds → access),  
        and dropped the screenshot. No “I’ll do it later.” I moved on with a clean state of mind.
      </p>

      <p>
        Every note I took in Obsidian was also linked to my timeline. I used tags like <code>#flag9</code>, <code>#pivot</code>, or <code>#user-compromise</code>  
        to keep track of my progress, and I used the graph view to reconnect ideas when I was stuck.
      </p>

      <p>
        This approach helped me <strong>overcome blockages</strong> like Flag 9 or Flag 12. When stuck, I would revisit previous notes,  
        spot something I had ignored, and unlock the path. Without this system, I would have been lost in the complexity of the internal network.
      </p>

      <p>
        Lastly, <strong>don’t hesitate to use ChatGPT</strong> as your sidekick—but always verify its output.  
        I used it mainly to rephrase technical steps for clarity and to write neutral language for the report.
      </p>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Code className="w-6 h-6" />
            Walkthroughs vs. Findings
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p>
        Let’s clarify this once and for all: the <strong>walkthrough</strong> is not just your internal exploitation.
        It’s a complete step-by-step guide that should allow your reviewer to reproduce the entire attack path —
        starting from the initial web interface all the way down to full domain compromise.
      </p>

      <p>
        Think of it as a <strong>technical replay of your operation</strong>, written as plainly and directly as possible.
        No justifications, no theories — just actions, ordered logically. It should follow the scope of your <em>Rules of Engagement</em>
        and stop at full compromise.
      </p>

      <p>
        ⚠️ Some might misinterpret the exam statement and think the walkthrough should only cover internal AD exploitation.
        That’s wrong. You <strong>must include everything</strong> from the initial attack surface (usually web) to the very end,
        including lateral movement, privilege escalation, trust exploitation, and any external pivoting.
      </p>

      <p>
        Use screenshots when something is visual (like BurpSuite manipulations, web interactions, or proof of RCE),
        and code/text blocks (<code>' '</code>) for terminal commands. But again, this section should only explain <strong>what</strong> you did,
        not <strong>why</strong> you did it.
      </p>

      <div className="bg-[#2a2a2f] p-6 rounded-lg border border-violet-700/30">
        <h3 className="text-violet-400 text-xl font-semibold mb-3">✅ Example of Walkthrough Content</h3>
        <ul className="list-disc list-inside text-white space-y-2">
          <li>Identified login page at <code>/admin</code> → performed login bruteforce → found valid creds.</li>
          <li>Logged in, found LFI via log injection → escalated to RCE.</li>
          <li>Gained reverse shell as <code>www-data</code> → enumerated users → pivoted to internal host.</li>
          <li>Compromised AD user via token abuse → escalated to Domain Admin.</li>
        </ul>
      </div>

      <p>
        Now for the <strong>Findings</strong>: this is where your infosec brain shines.
        Each finding is an opportunity to demonstrate your understanding of vulnerabilities, their root causes,
        impacts, and remediation strategies.
      </p>

      <p>
        I personally wrote <strong>23 findings</strong>. Sometimes, a single vulnerability led to multiple findings
        because it affected various layers — for instance, a weak password policy exploited after a web vulnerability
        deserved its own detailed breakdown.
      </p>

      <p>
        Each finding should include:
      </p>

      <ul className="list-disc list-inside text-white space-y-2">
        <li><strong>Title:</strong> short and impactful (e.g., "Insecure Password Storage on Internal Application").</li>
        <li><strong>Summary:</strong> what’s affected, how, and why it matters.</li>
        <li><strong>Technical Details:</strong> supporting screenshots, payloads, steps, and tool output.</li>
        <li><strong>Risk Analysis:</strong> CVSS-style reasoning or your own assessment.</li>
        <li><strong>Remediation:</strong> clear, actionable suggestions.</li>
      </ul>

      <p>
        These two sections — walkthrough and findings — are fundamentally different.
        One is factual and linear, the other analytical and structured. Don’t mix them.
        Respect their intent and purpose, and your report will be powerful, clear, and professional.
      </p>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            What I Included & Why
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
             <p>
    In this section, I want to emphasize a crucial mindset: <strong>this isn’t just a report—it’s a certification exam</strong>. You’re not just demonstrating your technical skills; you’re showing your ability to <strong>document a pentest at the highest standard of professionalism</strong>.
  </p>

  <h4 className="text-lg font-semibold text-violet-400"> Show Everything (but only what matters)</h4>
  <p>
    Your goal is <strong>maximum relevance, maximum detail</strong>, but <strong>zero noise</strong>.
    <br />
    Every single finding I included was written with extreme precision. No filler. No vague screenshots. No unnecessary command outputs.
    <br />
    I reviewed every section <strong>multiple times</strong> to ensure:
  </p>
  <ul className="list-disc pl-6">
    <li>It contributed meaningfully to the report</li>
    <li>It could be understood by the reader <strong>without additional explanation</strong></li>
    <li>It helped paint a clear picture of the attack narrative</li>
  </ul>
  <p><em>Ask yourself constantly: would this help the Blue Team understand what happened? If not, remove it.</em></p>

  <h4 className="text-lg font-semibold text-violet-400">🔐 Sanitize EVERYTHING</h4>
  <p>
    <strong>This is a security report. Never forget that.</strong><br />
    Even though this is a lab, I treated it like a real-world client engagement. That means:
  </p>
  <ul className="list-disc pl-6">
    <li>Hashes: 🔒 <strong>sanitized</strong></li>
    <li>Internal usernames: 🔒 <strong>sanitized</strong></li>
    <li>Internal IPs and domains: 🔒 <strong>sanitized</strong></li>
    <li>Passwords: 🔒 <strong>sanitized or masked</strong></li>
    <li>Screenshots: 🔒 <strong>blurred or redacted</strong></li>
  </ul>
  <p>
    ⚠️ A leaked report shouldn’t help an attacker reproduce the compromise. You’re proving you understand the <strong>responsibility</strong> that comes with reporting.
  </p>

  <h4 className="text-lg font-semibold text-violet-400"> Clear Walkthrough, Linked to Findings</h4>
  <p>
    I structured my walkthrough as a <strong>step-by-step narrative</strong>, from the very first scan of the external surface to full internal Active Directory compromise.
    <br />
    At every relevant point, I included a direct link to the related <strong>Finding</strong> so that the reader could jump between:
  </p>
  <ul className="list-disc pl-6">
    <li><strong>What I did</strong> (walkthrough)</li>
    <li><strong>Why it matters</strong> (finding)</li>
  </ul>
  <p>This structure made the document <strong>easier to navigate</strong> for both technical and non-technical readers.</p>

  <h4 className="text-lg font-semibold text-violet-400"> Pivoting & Visibility</h4>
  <p>
    Internal pivoting is <strong>one of the most difficult parts</strong> of this exam. So I documented every pivot (Ligolo-ng, tunnels, routes) clearly, using:
  </p>
  <ul className="list-disc pl-6">
    <li>Diagrams when needed</li>
    <li>Short code blocks for interface config</li>
    <li>Tables to track access level progression</li>
  </ul>
  <p>The goal is to let <strong>anyone skilled reproduce your attack path</strong> without asking questions.</p>

  <h4 className="text-lg font-semibold text-violet-400"> Extra: Password Audit (DPAT)</h4>
  <p>
    If you manage to dump the entire DC, run a <strong>DPAT-style password audit</strong>.<br />
    I included my sanitized results in a separate ZIP along with the PDF report. It's a great way to show:
  </p>
  <ul className="list-disc pl-6">
    <li>Post-exploitation analysis</li>
    <li>Weak password policies</li>
    <li>Risk assessment based on real-world credentials</li>
  </ul>

  <h4 className="text-lg font-semibold text-violet-400"> Tailoring to the Audience</h4>
  <p>
    I carefully adapted the tone and structure depending on the section:
  </p>
  <ul className="list-disc pl-6">
    <li><strong>Walkthrough / Findings</strong>: highly technical, precise</li>
    <li><strong>Assessment Overview & Recommendations</strong>: accessible, high-level impact focus</li>
  </ul>
  <p>This demonstrates you know how to communicate with <strong>both technical and non-technical stakeholders</strong>.</p>

  <h4 className="text-lg font-semibold text-violet-400"> Final Words</h4>
  <p>
    This isn’t about flexing. This is about delivering a <strong>reproducible</strong>, <strong>professional</strong>, and <strong>secure</strong> penetration test report.
    <br />
    So be rigorous. Be clear. Be respectful of the responsibility that comes with this type of knowledge.
  </p>
  <p><strong>And once again: Sanitize everything. Always.</strong></p>
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
            <p className="text-gray-300 text-lg">
      <strong>Enumeration is the backbone of the CPTS exam.</strong> The scope is intentionally broad, and the real danger is missing an attack surface because you cut corners early on.
    </p>

    <ul className="list-disc ml-6 space-y-2 text-gray-300">
      <li>
        <strong>Enumerate everything</strong> at the start: subnets, hosts, services, shares, and web endpoints—even if they seem useless.
      </li>
      <li>
        <strong>Start wide, then narrow down:</strong> Ignore nothing at first. Over time, eliminate areas that don’t lead anywhere (for example, web apps that aren’t vulnerable or don’t expose anything interesting).
      </li>
      <li>
        <strong>Nmap is your best friend:</strong> Always run wide scans, then targeted scans as you discover new subnets or pivot points. Example: <span className="font-mono text-green-300">nmap -p- -A 10.10.0.0/16</span>
      </li>
      <li>
        <strong>If you get stuck for more than a day,</strong> step back and re-enumerate. You probably missed something simple.
      </li>
      <li>
        <strong>Take notes as you go:</strong> Document every host, open port, and interesting service—even the dead ends.
      </li>
      <li>
        <strong>The exam rewards “stay simple”:</strong> Don’t overcomplicate—most paths are direct if you enumerate thoroughly and keep your head cool.
      </li>
    </ul>

    <p className="text-gray-400 text-base italic mt-4">
      My approach: go wide, skim aggressively, and focus only where you get traction. If you hit a wall, always re-enumerate. Enumeration is 80% of the work—don’t underestimate it.
    </p>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Watch for Rabbit Holes
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-gray-300 text-lg">
      <strong>Don’t get lost chasing ghosts.</strong> One of the most dangerous traps in the CPTS exam (and real pentests) is to spend hours—or days—following the wrong lead.
    </p>

    <ul className="list-disc ml-6 space-y-2 text-gray-300">
      <li>
        <strong>Be methodical:</strong> If something looks weird but you’re not finding traction after a reasonable time (<span className="text-violet-400 font-semibold">~1–2 hours</span>), put it aside and continue elsewhere.
      </li>
      <li>
        <strong>Track your time:</strong> Literally note how long you spend on each “lead” or exploit path. If you cross the 1-hour mark with no progress, switch context.
      </li>
      <li>
        <strong>Don't force it:</strong> Not every open port or page is vulnerable. On the CPTS, there are no “hard” rabbit holes like on some HTB insane boxes—but the network is big, and you can easily waste time on dead ends.
      </li>
      <li>
        <strong>Keep a “maybe later” list:</strong> Document weird findings in your notes and move on. Come back only if you run out of other leads.
      </li>
      <li>
        <strong>Ask yourself:</strong> “Is this still aligned with the main goal (flag, DA, DC) or am I going down a side path?”
      </li>
    </ul>

    <p className="text-gray-400 text-base italic mt-4">
      Example: <br />
      I once lost half a day trying to exploit a weird error message on a web service that turned out to be a red herring. If you don’t make progress, step back, take a break, and reconsider. 
      <br /><br />
      <span className="text-violet-400 font-semibold">Rule:</span> When in doubt, return to enumeration.
    </p>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Time & Mental Energy Management
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-gray-300 text-lg">
      <strong>Managing your time and mental energy is just as important as technical skill during the CPTS exam.</strong>
      <br />
      With 10 days and a huge network, you need a plan to avoid burnout and keep your mind sharp.
    </p>

    <ul className="list-disc ml-6 space-y-2 text-gray-300">
      <li>
        <strong>Set a daily routine:</strong> Block out fixed sessions for pentesting and for breaks. For example, I aimed for <span className="text-violet-400 font-semibold">7 to 10 hours per day</span>, but split between morning and afternoon, with real downtime in between.
      </li>
      <li>
        <strong>Take real breaks:</strong> When you hit a wall or feel tired, step away from the keyboard. Walk, stretch, eat. It helps you reset and find new ideas.
      </li>
      <li>
        <strong>Don’t obsess over blocks:</strong> Getting stuck is part of the game. If you’re spinning your wheels for hours, change activity: write your report, reread your notes, or sleep on it. Sometimes the solution appears after a pause.
      </li>
      <li>
        <strong>Track your progress:</strong> Note your advances (even small wins) each day. Seeing progress helps fight discouragement, especially on long exams.
      </li>
      <li>
        <strong>Prioritize your energy:</strong> Attack the “hard” or creative tasks when you’re freshest—usually mornings. Use evenings for review, report writing, or prepping tomorrow’s targets.
      </li>
      <li>
        <strong>Plan for slumps:</strong> Everyone has off-days. If you have a day with little progress, don’t panic. The network is big, but you only need the right path. Take care of yourself.
      </li>
    </ul>

    <p className="text-gray-400 text-base italic mt-4">
      Example:<br />
      I hit a huge block around Flag 9. After wasting a whole afternoon, I forced myself to stop, go outside, and only come back the next day. Within one hour, the solution appeared, fresh.
      <br /><br />
      <span className="text-violet-400 font-semibold">Remember:</span> The CPTS is a marathon, not a sprint. Your brain is your best tool—treat it well.
    </p>
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
            <p className="text-gray-300 text-lg">
      <strong>Passing the CPTS was a real challenge — both technically and mentally.</strong> The exam forced me to be methodical, rigorous, and to manage my stress over a long period. I came out stronger and much more confident in my pentesting workflow.
    </p>

    <div className="bg-violet-900/20 rounded-lg p-4 space-y-3">
      <p className="text-violet-300 font-semibold">
        <span className="text-xl">💡</span> I haven’t taken the OSCP yet — it’s expensive, and I want to do it when I’ll be job-hunting in cybersecurity.
      </p>
      <ul className="list-disc ml-6 text-gray-300">
        <li>
          <strong>CPTS is more technical and realistic:</strong> The scope is huge, the networks are complex, and you have to think like a real pentester (double pivot, full AD compromise, custom enumeration).
        </li>
        <li>
          <strong>OSCP is famous for a reason:</strong> Even if technically less advanced than the CPTS in 2025, it’s still THE certificate most HR will recognize immediately — especially outside of the HTB community.
        </li>
        <li>
          <strong>The 24h format of the OSCP exam is brutal:</strong> It creates huge stress and leaves little room for errors, whereas the CPTS is more like a real pentest, spread out over 10 days — which teaches you stamina and process management.
        </li>
        <li>
          <strong>Recognition is evolving:</strong> CPTS is getting more attention, especially in Europe and among technical teams. Recruiters are starting to understand its value. But OSCP is still the standard on LinkedIn job offers for now.
        </li>
        <li>
          <strong>Reporting style differs:</strong> CPTS puts a heavy focus on detailed and real-world reporting (SysReptor, findings, walktrough). OSCP is more focused on root/user.txt, with a simpler report at the end.
        </li>
        <li>
          <strong>Personal approach:</strong> For now, my focus is on progressing technically. When I feel ready and need the OSCP line on my CV, I’ll attack it — not before.
        </li>
      </ul>
    </div>

    <p className="text-gray-400 text-base italic mt-2">
      <span className="text-violet-400 font-semibold">My advice:</span> Don’t chase the OSCP just for the name. Build up your skills, get solid on real-world labs, and pick the right moment for you. Both certifications can open doors, but your competence and mindset will always make the difference.
    </p>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            My Plan for OSCP, BSCP & Beyond
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-gray-300 text-lg">
      <strong>For the next steps, my strategy is simple: keep stacking skills, keep progressing — one step at a time.</strong>
    </p>

    <div className="bg-violet-900/20 rounded-lg p-4 space-y-3">
      <ul className="list-disc ml-6 text-gray-300">
        <li>
          <strong>After the CPTS:</strong> The next logical step is the <span className="text-violet-300">BSCP (Burp Suite Certified Practitioner)</span> to prove my web pentesting skills.
        </li>
        <li>
          <strong>Parallel goal:</strong> I also want to pass the <span className="text-blue-300">CCNA</span> to strengthen my networking fundamentals — it's key for both pentest and admin roles.
        </li>
        <li>
          <strong>Still hesitating:</strong> Should I go for the <span className="text-pink-300">CBBH (Certified Bug Bounty Hunter)</span>? Or just push on to the OSCP directly? For now, I stay open — I’ll adapt as I progress.
        </li>
        <li>
          <strong>OSCP is the long-term goal:</strong> I want to wait until I’m ready, and maybe until the end of my studies or the moment I decide to chase a cybersecurity job. Until then, it's full focus on learning, labs, and pro labs if I have the time!
        </li>
        <li>
          <strong>Work-study + Certs:</strong> The challenge is to balance my <span className="text-violet-300">alternance</span> (work-study), my academic path, and technical progression. It’s demanding, but that’s the game.
        </li>
        <li>
          <strong>Keep learning:</strong> As always: stay humble, learn every day, and adapt the plan along the way. There’s no magic roadmap in cybersecurity — just the next step forward.
        </li>
      </ul>
    </div>

    <p className="text-gray-400 text-base italic mt-2">
      <span className="text-violet-400 font-semibold">Current mindset:</span> Skills first, certifications second. The job will come when it needs to — right now, it’s about building real, durable expertise.
    </p>
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
            <p className="text-gray-300 text-lg">
      <strong>Learning never stops in cybersecurity.</strong>  
      I keep pushing my level thanks to hands-on practice and the support I get every day.
    </p>

    <div className="bg-violet-900/20 rounded-lg p-4 space-y-2">
      <h3 className="text-xl font-semibold text-violet-300 mb-2">Labs &amp; Platforms</h3>
      <ul className="list-disc ml-6 text-gray-300">
        <li>TryHackMe — great for structured learning and basics</li>
        <li>Hack The Box — real-world boxes and advanced Active Directory labs</li>
        <li>PortSwigger Web Security Academy — the reference for mastering web vulns</li>
        <li>Root-Me — perfect for CTF challenges and pure exploitation</li>
        <li>Exegol — my daily pentest environment, highly customizable</li>
      </ul>
    </div>

    <div className="bg-violet-900/20 rounded-lg p-4 space-y-2">
      <h3 className="text-xl font-semibold text-violet-300 mb-2">Community &amp; Support</h3>
      <ul className="list-disc ml-6 text-gray-300">
        <li>LinkedIn — for networking, inspiration, and following other pentesters</li>
        <li>My family, my wife, and my dog — honestly, you need support outside the screen too</li>
      </ul>
    </div>

    <p className="text-gray-400 italic">
      If you’re reading this and helped me along the way, thank you — you know who you are.
    </p>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6" />
            People That Helped Me Grow
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-gray-300 text-lg">
      I wouldn’t have reached this point alone. Here are some of the people and creators who inspired and pushed me forward in cybersecurity:
    </p>

    <ul className="list-disc ml-6 text-gray-300">
      <li>
        <strong>Pentesters on LinkedIn:</strong> Every day, I get inspired by people sharing their journey, technical write-ups, and advice. Just seeing others push through motivates me to keep going.
      </li>
      <li>
        <strong>
          <a
            href="https://www.linkedin.com/in/nicolas-gomez-6b850913a/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-300 underline hover:text-violet-400"
          >
            Nicolas Gomez (HacktBack)
          </a>
        </strong>
        : The best French pentester content, always straight to the point, super motivating. If you read this: thanks for your mindset and all the tips!
      </li>
      <li>
        <strong>IppSec:</strong> The <em>GOAT</em> for Hack The Box — I learned the methodology, how to think like a hacker, and how to approach any box step by step.
      </li>
      <li>
        <strong>My pentester friend:</strong> The one who threw me into the cybersecurity rabbit hole. You know who you are. Without your advice and late-night talks, I probably wouldn’t have made the leap.
      </li>
    </ul>

    <p className="text-gray-400 italic">
      If you inspired me, taught me something, or challenged me to do better — even with just a message or a YouTube video — thank you.
    </p>
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
            <p className="text-gray-300 text-lg">
      The real secret to progressing in cybersecurity — or anything, really — is <strong>hard work, patience, and resilience</strong>. Nothing comes instantly. You have to accept there will be days (sometimes many!) when you feel stuck. But if you keep pushing, the breakthroughs always come.
    </p>

    <p className="text-gray-300 text-lg">
      Learning is a lifelong process. There is no finish line — you just keep improving a little bit every day. The more you try, the further you go, even if you don’t always see it right away.
    </p>

    <p className="text-gray-300 text-lg">
      My only advice: <strong>don’t give up</strong>, even when it gets frustrating. Find your curiosity, enjoy the challenge, and don’t be afraid to try (and fail) again and again. <strong>When you like what you do, you can become really good at it.</strong>
    </p>

    <p className="text-gray-300 text-lg">
      Thank you for taking the time to read this (very long!) article. I hope it helped or guided you a little — I really tried to put all my experience into words, even if it’s not always easy to explain everything.
    </p>

    <p className="text-violet-300 font-semibold text-lg">
      You can do it too. Stay patient, keep learning, and ask for help if you need it. Progress is inevitable if you just keep showing up!
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