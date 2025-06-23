import React from 'react';
import { Award, Calendar, Target, BookOpen, Brain, Shield, Terminal, Users, Lightbulb, CheckCircle2, Clock, FileText, Zap, Monitor, Network, Lock, Code, ArrowRight, TrendingUp, Cpu, Database,ListChecks } from 'lucide-react';

export const CPTSJourneyArticleFrench: React.FC = () => {
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
            'Introduction & Accroche',
            'Stratégie d’Apprentissage Détaillée',
            'Outils, Environnement & Prise de Notes',
            'La Semaine d’Examen',
            'Le Rapport de 190 Pages',
            'Cheat-Sheet : Conseils & Astuces',
            'Retour d’Expérience & Prochaines Étapes',
            'Ressources Complémentaires & Remerciements',
            'Conclusion & Motivation'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-400 hover:text-violet-400 transition-colors">
              <ArrowRight className="w-3 h-3" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Introduction & Accroche */}
<section className="mb-16">
  <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
    <div className="flex items-center gap-3 mb-8">
      <Target className="w-8 h-8 text-violet-400" />
      <h2 className="text-3xl font-bold">Introduction & Accroche</h2>
    </div>

    <div className="space-y-8">

      {/* À propos de moi */}
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6" />
          À propos de moi
        </h3>
        <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  {/* Parcours pro */}
  <div className="flex items-center gap-3 mb-2">
    <BookOpen className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">Nouveau départ</h4>
  </div>
  <p className="text-gray-300 text-lg">
    <strong>Je suis français, actuellement en reconversion pour me lancer dans la cybersécurité.</strong>
    En septembre, je commence officiellement une alternance en informatique et réseaux, mais pour être honnête, mon parcours a commencé bien avant ça.
  </p>

  {/* Métier précédent et déclic */}
  <div className="bg-violet-900/20 rounded-lg p-4 space-y-3">
    <div className="flex items-center gap-2">
      <Monitor className="w-6 h-6 text-violet-400" />
      <span className="text-violet-300 font-semibold">Technicien fibre optique</span>
    </div>
    <p className="text-gray-300">
      Tirer des câbles, installer, répéter les mêmes gestes chaque jour… À force, j’ai eu l’impression de tourner en rond : aucun apprentissage, aucun avenir.
      <span className="block font-semibold text-violet-400 mt-2">C’est ça qui m’a poussé à changer de voie.</span>
    </p>
  </div>

  {/* Parcours d'autoformation */}
  <div className="flex items-center gap-2 mb-2">
    <Brain className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Parcours autodidacte</span>
  </div>
  <p className="text-gray-300">
    Depuis neuf mois, je me forme en autodidacte presque chaque jour (6 à 7h/jour) :
  </p>
  <ul className="list-disc ml-8 text-gray-300 space-y-1">
    <li>J’ai validé tous les parcours sur <strong>TryHackMe</strong></li>
    <li>J’ai obtenu la certification <strong>eJPT</strong></li>
    <li>Et dernièrement, j’ai réussi la <strong>CPTS (Hack The Box)</strong></li>
  </ul>
  <p className="text-gray-300">
    Pour moi, le but n’a jamais été de “collectionner” les certifs — mais d’<strong>apprendre pour de vrai</strong>, développer mes compétences et me prouver que le travail paie vraiment.
  </p>

  {/* Esprit tryhard, outils et méthodo */}
  <div className="flex items-center gap-2 mb-2">
    <FileText className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Esprit tryhard & outils</span>
  </div>
  <p className="text-gray-300">
    Je suis un vrai “tryharder” : quand un sujet me motive, je me donne à fond.  
    Je note tout, je structure, j’approfondis :
  </p>
  <ul className="list-disc ml-8 text-gray-300 space-y-1">
    <li>Setup <strong>Exegol</strong> personnalisé</li>
    <li><strong>Obsidian</strong> au quotidien</li>
    <li>Reporting avec <strong>SysReptor</strong> — même à l’entraînement</li>
    <li>Jamais de raccourcis, jamais de copier-coller de write-up</li>
    <li>Objectif : comprendre, pas juste reproduire</li>
  </ul>

  {/* Pourquoi cet article */}
  <div className="bg-violet-900/20 rounded-lg p-4 space-y-2">
    <div className="flex items-center gap-2">
      <Users className="w-6 h-6 text-violet-400" />
      <span className="text-violet-300 font-semibold text-lg">Pourquoi cet article</span>
    </div>
    <p className="text-gray-300">
      Quand je préparais la CPTS, le blog de
      <a
        href="https://www.brunorochamoura.com/posts/cpts-tips/"
        target="_blank"
        className="text-violet-400 hover:underline font-semibold ml-1"
      >
        Bruno Rocha Moura
      </a>
      m’a vraiment aidé. Ses conseils m’ont donné une vraie structure, ça m’a permis de garder le cap.<br />
      Dans le même état d’esprit, j’écris cet article pour “rendre la pareille”.
      <strong>Si tu te demandes si la CPTS vaut le coup, ou si tu ne sais pas comment aborder la prépa, j’espère que ça te donnera des repères.</strong>
    </p>
  </div>

  {/* Valeur du partage */}
  <p className="text-gray-400 text-base italic mt-2">
    <span className="text-violet-400 font-semibold">Mon état d’esprit :</span>
    En cybersécurité, on progresse surtout parce qu’on s’entraide — via les write-ups, les forums, les blogs, ou même Discord.
    Si ce post aide ne serait-ce qu’une personne à se sentir plus prête ou plus sereine, alors il aura servi à quelque chose.
  </p>
</div>


      </div>

      {/* Pourquoi la CPTS après l’eJPT ? */}
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Pourquoi la CPTS après l’eJPT ?
        </h3>
        <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  {/* Passage eJPT */}
  <div className="flex items-center gap-3 mb-2">
    <Award className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">eJPT : Le premier palier</h4>
  </div>
  <p className="text-gray-300 text-lg">
    J’ai validé la <strong>eJPT</strong> en <strong>février 2025</strong>, en plein milieu de mon apprentissage du <strong>parcours CPTS</strong>.<br />
    Je venais à peine de commencer à creuser les modules HTB quand j’ai vu une <strong>promo sur l’exam</strong>.<br />
    Je me suis dit : « Autant tenter — même si j’échoue, j’aurai appris quelque chose. »<br />
    J’avais déjà terminé tous les <strong>learning paths TryHackMe</strong>, y compris la filière <strong>Junior Penetration Tester</strong>, donc j’avais un minimum de bases.
  </p>

  {/* Stress et réussite */}
  <div className="flex items-center gap-2 mb-2">
    <Target className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Se lancer malgré le stress</span>
  </div>
  <p className="text-gray-300">
    Pour être honnête, j’étais <strong>super stressé</strong>. Première certif, premier exam chronométré, et franchement je me sentais pas prêt.<br />
    Mais au final, ça s’est bien mieux passé que prévu : j’ai fini en <strong>6h sur les 48</strong>.<br />
    Clairement, ça m’a donné un vrai coup de boost niveau confiance.
  </p>
  <div className="bg-violet-900/20 rounded-lg p-4 space-y-2">
    <p className="text-violet-300 font-semibold">
      <Brain className="w-5 h-5 inline-block mb-1 mr-1 text-violet-400" />
      Si tu as déjà fait les parcours sur THM, tu peux clairement tenter la eJPT.
    </p>
    <p className="text-gray-300">
      C’est une super certif pour <strong>valider tes bases</strong> en réseau et pentest.
    </p>
  </div>

  {/* Passage au CPTS, constat du gap */}
  <div className="flex items-center gap-2 mb-2">
    <ArrowRight className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">De l’eJPT à la CPTS</span>
  </div>
  <p className="text-gray-300">
    Mais juste après, en attaquant sérieusement les modules CPTS…  
    J’ai vraiment vu le <strong>gap</strong>. La CPTS est tout de suite <strong>plus avancée</strong>, beaucoup plus <strong>réaliste</strong>.<br />
    La eJPT m’a confirmé que je n’étais <strong>plus vraiment débutant</strong> — mais il me restait pas mal de chemin pour être solide.<br />
    C’est là que la CPTS a pris tout son sens.
  </p>

  {/* Choix stratégique CPTS vs OSCP */}
  <div className="flex items-center gap-2 mb-2">
    <Shield className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Pourquoi commencer par la CPTS ?</span>
  </div>
  <p className="text-gray-300">
    J’ai choisi la CPTS plutôt que d’aller direct sur l’<strong>OSCP</strong> parce que je veux <strong>me former proprement</strong> — pas juste rusher pour le papier.<br />
    Et soyons francs : l’OSCP, c’est <strong>très cher</strong>, et j’ai vu beaucoup de retours sur la qualité assez discutable du contenu.<br />
    Alors que <strong>HTB</strong>, c’est <strong>ultra quali</strong> : modules <strong>denses, structurés, pratiques</strong>.<br />
    Et la CPTS reste <strong>accessible financièrement</strong>, ce qui compte quand tu finances tout toi-même.
  </p>

  {/* Conclusion et conseil pour les lecteurs */}
  <div className="bg-violet-900/20 rounded-lg p-4 space-y-2">
    <p className="text-violet-300 font-semibold flex items-center gap-2">
      <Shield className="w-5 h-5 text-violet-400" />
      <span>CPTS : le choix malin</span>
    </p>
    <p className="text-gray-300">
      Pour moi, la CPTS c’est un <strong>véritable palier technique</strong> avant de viser l’OSCP (qui reste surtout utile pour <strong>le CV et les RH</strong>).<br />
      Mais à ce moment-là, la CPTS était le <strong>choix logique et réaliste</strong> vu mon niveau.<br />
      Contenu de qualité, <strong>défis réalistes</strong>, et un exam qui t’oblige à <strong>réfléchir comme un pentester</strong> — pas juste à suivre une recette.
    </p>
  </div>
  <p className="text-gray-400 text-base italic mt-2">
    <span className="text-violet-400 font-semibold">Mon conseil :</span>
    Si tu es entre <strong>“débutant” et “prêt pour des missions réelles”</strong>, la CPTS est parfaite pour <strong>monter en compétences sans te cramer ni exploser ton budget</strong>.
  </p>
</div>

      </div>

      

      {/* Modules de la CPTS */}
<div>
  <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
    <Cpu className="w-6 h-6" />
    Aborder les 28 MODULES de la CPTS
  </h3>
  
  <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
    {/* Vue d'ensemble du parcours */}
    <div className="flex items-center gap-3 mb-2">
      <BookOpen className="w-6 h-6 text-violet-400" />
      <h4 className="text-xl font-semibold text-violet-300">Le parcours : 3 à 4 mois de montée en compétences</h4>
    </div>
    <p className="text-gray-300 text-lg">
      J’ai passé environ <strong>3 à 4 mois</strong> sur l’ensemble du <strong>learning path Penetration Tester</strong> de Hack The Box.
      Je n’ai pas cherché à aller vite — j’ai abordé chaque module comme un mini-cours, parfois en revenant plusieurs fois sur un sujet jusqu’à bien le comprendre.
      Ce cursus est <strong>incroyablement riche</strong>, aussi bien sur l’aspect technique que dans sa pertinence réelle.
      Avec de la motivation, même en partant de zéro, tu peux boucler ce parcours et être prêt pour la CPTS.
      <span className="block font-semibold text-violet-400">La clé : régularité et patience.</span>
    </p>

    {/* Progressivité du learning path */}
    <div className="flex items-center gap-2 mb-2">
      <Brain className="w-6 h-6 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">Une structure progressive</span>
    </div>
    <p className="text-gray-300">
      Au début, les 28 modules peuvent faire peur, surtout si tu n’as jamais suivi de formation structurée en cybersécurité.
      Mais le cheminement est <strong>progressif</strong> : les premiers modules posent les bases, et chaque étape ajoute en complexité et en réalisme.
      Plus tu avances, plus ton état d’esprit évolue : tu ne penses plus comme un étudiant, mais comme un pentester.
    </p>

    {/* Méthode d'apprentissage & organisation */}
    <div className="flex items-center gap-2 mb-2">
      <Monitor className="w-6 h-6 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">Méthode & organisation</span>
    </div>
    <p className="text-gray-300">
      Je ne me fixais pas d’objectif du type “un module par jour” — certains modules me prenaient 2-3h, d’autres comme <strong>Attacking Enterprise Networks</strong> ou <strong>Password Attacks</strong> jusqu’à <strong>5 jours</strong>.
      Je bossais par longues sessions (5 à 7h par jour), avec des notes structurées dans <strong>Obsidian</strong>.
      Après chaque module, je choisissais une <strong>box HTB</strong> liée pour ancrer les notions.
      <span className="block mt-1">C’est vraiment en liant théorie et pratique qu’on apprend pour de vrai.</span>
    </p>

    {/* L'importance des notes personnelles */}
    <div className="flex items-center gap-2 mb-2">
      <ListChecks className="w-6 h-6 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">Exemple : les notes comme checklist</span>
    </div>
    <p className="text-gray-300">
      Après le module <strong>Linux Privilege Escalation</strong>, j’ai attaqué deux box medium avec des privesc connues, en utilisant mes notes comme checklist.
      Ça m’a permis de voir précisément ce que je maîtrisais — et ce qu’il me manquait encore.
    </p>
    <div className="bg-violet-900/20 rounded-lg p-4">
      <FileText className="w-5 h-5 text-violet-400 inline-block mr-1 mb-1" />
      <span className="text-gray-300">
        <strong> Tes notes personnelles valent plus que les PDF des modules.</strong>  
        Note tout comme si tu créais ta propre formation.
      </span>
    </div>

    {/* Les modules marquants */}
    <div className="flex items-center gap-2 mb-2">
      <CheckCircle2 className="w-6 h-6 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">Modules marquants</span>
    </div>
    <div className="bg-violet-900/20 rounded-lg p-4">
      <ul className="list-disc ml-6 text-gray-300 space-y-1">
        <li><strong>Attacking Enterprise Networks</strong> : Un <span className="font-semibold">mini-exam CPTS</span>. Long, ultra détaillé, très proche du format réel. Aucun walkthrough, zéro indice : c’est le test ultime. On enchaîne énumération, privesc, pivot, mouvement latéral, reporting.</li>
        <li><strong>Penetration Testing Process</strong> : Donne le <span className="font-semibold">mindset et la méthodologie</span> pour tout le cursus. Idéal pour comprendre le “pourquoi” avant le “comment”.</li>
        <li><strong>Active Directory Enumeration & Attacks</strong> : Le module le plus <span className="font-semibold">complet et clair</span>. Permet de bâtir de vraies checklists et de passer à l’action sur AD — outils, mais aussi logique.</li>
        <li><strong>Documentation and Reporting</strong> : <span className="font-semibold">Crucial pour l’exam</span>. Format, ton, attentes sur le rapport. C’est ce module qui m’a permis de structurer mon rapport CPTS sous <strong>SysReptor</strong>.</li>
        <li><strong>Command Injection</strong> & <strong>SQLi</strong> : Super équilibre entre théorie et pratique : payloads, contournements, beaucoup d’entraînement sur des box.</li>
      </ul>
    </div>

    {/* Modules moins marquants */}
    <div className="flex items-center gap-2 mb-2">
      <Cpu className="w-6 h-6 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">Modules moins marquants</span>
    </div>
    <div className="bg-violet-900/20 rounded-lg p-4">
      <ul className="list-disc ml-6 text-gray-300 space-y-1">
        <li><strong>Password Attacks</strong> : Important mais trop passif — beaucoup d’attente, assez peu formateur au final.</li>
        <li><strong>Shells & Payloads</strong> : <span className="font-semibold">Mal intégré</span>. Notions dispersées, mieux traité ailleurs.</li>
        <li><strong>Linux Privilege Escalation</strong> : Bons exemples mais manque de <span className="font-semibold">méthodologie</span>. Je l’ai complété avec des ressources CTF, PEASS et g0tmi1k.</li>
        <li><strong>Vulnerability Assessment</strong> : Un peu sec — pose les bases mais pas très poussé. Pas mauvais, juste pas passionnant.</li>
      </ul>
    </div>

    {/* Rapport qualité/prix du cursus */}
    <div className="flex items-center gap-2 mb-2">
      <Network className="w-6 h-6 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">Tarif & rapport qualité/prix</span>
    </div>
    <p className="text-gray-300">
      Même les modules un peu moins marquants restent <strong>solides</strong>. HTB ne bâcle rien et le tarif est vraiment honnête.
      J’ai choisi l’<strong>abonnement Silver HTB</strong> : <strong>410 €/an</strong> pour <strong>les 28 modules</strong>, labs, updates et <strong>voucher pour l’exam CPTS</strong>.
      À côté d’autres certifs (coucou l’OSCP), c’est vraiment donné.
    </p>

    {/* Conseil final */}
    <div className="bg-violet-900/20 rounded-lg p-4">
      <span className="text-violet-400 font-semibold"><CheckCircle2 className="w-5 h-5 inline-block mb-1 mr-1" />Conseil :</span>
      <span className="text-gray-300">
        Prends ton temps. <strong>Avance module par module, box par box</strong>.
        Documente tout, et ne passe à la suite que quand tu as vraiment compris.
        Le contenu est fait pour te transformer en vrai praticien, pas en “chasseur de flag”.
        Si tu joues le jeu, à la fin tu seras bluffé par ta progression.
      </span>
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
             <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  {/* Routine de travail et organisation générale */}
  <div className="flex items-center gap-3 mb-2">
    <Calendar className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">My Study Routine</h4>
  </div>
  <p className="text-gray-300 text-lg">
    I didn’t follow a strict schedule during the CPTS path — I just aimed to work around <strong>6 to 7 hours a day</strong>, <strong>five days a week</strong>, always taking short breaks every couple of hours to stay focused.
    I knew from experience that <strong>rest matters just as much as active study</strong> — especially in cybersecurity, where understanding is more important than memorization.
  </p>

  {/* Méthodologie d’apprentissage */}
  <div className="flex items-center gap-2 mb-2">
    <Monitor className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Learning Process</span>
  </div>
  <p className="text-gray-300">
    My routine was pretty straightforward: <strong>start a module</strong>, <strong>finish it completely</strong>, and take <strong>structured notes</strong> as I went.
    Whenever possible, I would <strong>chain it with one or two related HTB boxes</strong>.  
    This practical follow-up was crucial — the hands-on challenges helped <strong>anchor what I had just learned</strong>.
  </p>

  {/* Révision quotidienne */}
  <div className="flex items-center gap-2 mb-2">
    <FileText className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Daily Review</span>
  </div>
  <p className="text-gray-300">
    Each morning, I’d <strong>review the previous day’s notes</strong> to keep everything fresh and reinforce long-term memory.
    It wasn’t always easy to stay on track — motivation goes up and down — but I kept telling myself that <strong>discipline had to win over comfort</strong>.
    Over time, it paid off. The progress wasn’t always visible day by day, but looking back, it added up fast.
  </p>

  {/* Hygiène de vie et bien-être */}
  <div className="flex items-center gap-2 mb-2">
    <Brain className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Physical & Mental Health</span>
  </div>
  <p className="text-gray-300">
    Outside of studying, I made sure to <strong>take care of my mental and physical health</strong>.
    I trained <strong>four times a week</strong>, around <strong>2 to 3 hours per session</strong>, and went on <strong>regular walks with my family and my dog</strong>.
    Staying active and clearing my head helped me avoid burnout and come back sharper the next day.
    <span className="block mt-1 font-semibold text-violet-400">Moving your body is just as important as moving your brain.</span>
  </p>

  {/* Motivation, musique, ambiance */}
  <div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2">
    <Zap className="w-6 h-6 text-violet-400" />
    <span className="text-gray-300">
      And let’s be real — <strong>a good Spotify playlist</strong> makes the grind a lot more enjoyable.
      When I was in the zone, music helped me stay focused and turn long hours into productive ones.
    </span>
  </div>
</div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Monitor className="w-6 h-6" />
                HTB Boxes, Modules & IppSec's Track
              </h3>
             <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  {/* Associer modules et boxes */}
  <div className="flex items-center gap-3 mb-2">
    <Terminal className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">From Modules to Practice</h4>
  </div>
  <p className="text-gray-300 text-lg">
    During the <strong>CPTS learning path</strong>, I made it a habit to complete <strong>1–2 HTB boxes per module</strong>, directly related to the topic I had just studied.
    For example, after finishing <em>Web Exploitation</em>, I’d go try an XSS or file upload challenge (retired, easy/medium).
    This hands-on practice helped anchor new concepts immediately.
  </p>

  {/* Live boxes : montée en niveau */}
  <div className="flex items-center gap-2 mb-2">
    <Users className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Leveling Up with Live Boxes</span>
  </div>
  <p className="text-gray-300">
    Once I completed the path, I moved on to <strong>live boxes on Hack The Box</strong>.  
    Not always tied to modules — just for fun and the challenge.  
    These boxes helped me work on:
  </p>
  <ul className="list-disc ml-8 text-gray-300 space-y-1">
    <li><strong>Internal pivoting</strong> (shoutout to Ligolo-ng)</li>
    <li><strong>Post-exploitation logic</strong> and lateral movement</li>
    <li><strong>Handling AV and EDR</strong> obstacles in a realistic environment</li>
  </ul>
  <p className="text-gray-300">
    I eventually reached the <strong>Pro Hacker rank</strong> — not without struggle. Some hard boxes kicked my ass, and yes, I needed help.  
    That’s okay. What matters is what you learn from the process.
  </p>

  {/* Playlist IppSec */}
  <div className="flex items-center gap-2 mb-2">
    <BookOpen className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">The IppSec CPTS Playlist</span>
  </div>
  <div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2">
    <ArrowRight className="w-5 h-5 text-violet-400" />
    <span className="text-gray-300">
      I tackled the  
      <a href="https://www.youtube.com/watch?v=H9FcE_FMZio&list=PLidcsTyj9JXItWpbRtTg6aDEj10_F17x5"
        target="_blank"
        className="text-violet-400 hover:underline font-semibold ml-1"
      >
        unofficial IppSec CPTS prep playlist
      </a>
      . These boxes are <strong>brilliantly curated</strong>. Some have vulnerabilities nearly identical to the CPTS.  
      More importantly, they force you to:
    </span>
  </div>
  <ul className="list-disc ml-8 text-gray-300 space-y-1">
    <li><strong>Chain multiple steps</strong> without guidance</li>
    <li><strong>Structure your workflow</strong> like in a real pentest</li>
    <li><strong>Manage pivots and post-exploitation scenarios</strong> on your own</li>
  </ul>
  <p className="text-gray-300">
    These boxes really <strong>boosted my confidence</strong>.  
    After finishing the playlist, I said to myself: <em>"Okay, now I’m really ready for the 10-day exam."</em>
  </p>

  {/* Préparation alternative : ProLabs, hard/insane */}
  <div className="flex items-center gap-2 mb-2">
    <TrendingUp className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Alternative Prep Methods</span>
  </div>
  <div className="bg-violet-900/20 rounded-lg p-4">
    <p className="text-gray-300 mb-2">
      💬 I know some people also use <strong>ProLabs</strong> or even tackle <strong>hard/insane boxes</strong> to prep, but personally, I didn’t feel the need.
      In my opinion, if you:
    </p>
    <ul className="list-disc ml-8 text-gray-300 space-y-1">
      <li>complete the CPTS path <strong>seriously</strong>,</li>
      <li>pair modules with relevant boxes <strong>consistently</strong>,</li>
      <li>follow the IppSec playlist <strong>at the right time</strong>,</li>
    </ul>
    <p className="text-gray-300 mt-2">
      …then you already have <strong>everything you need</strong>.  
      No need to overdo it. The CPTS learning path alone is already <strong>rich and complete</strong>.
    </p>
  </div>

  {/* Conseil timing playlist */}
  <div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2">
    <Clock className="w-5 h-5 text-violet-400" />
    <span className="text-gray-300">
      <strong>Personal advice:</strong>
      Don’t wait too long after finishing the learning path to start the IppSec boxes — you might forget key details.
      But don’t start them too early either.  
      Make sure you’ve built a strong foundation from the modules before jumping in. <strong>Trust the process</strong>.
    </span>
  </div>
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
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  {/* Préparation finale, break avant examen */}
  <div className="flex items-center gap-3 mb-2">
    <Clock className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">Day -10: Strategic Break</h4>
  </div>
  <p className="text-gray-300 text-lg">
    At <strong>Day -10</strong>, I had already completed the entire <strong>learning path</strong>, the <strong>HTB boxes</strong>, and the full <strong>IppSec playlist</strong>.<br/>
    So, I decided to take a proper break — about <strong>3 to 4 full days</strong> off.
  </p>

  {/* Importance du repos */}
  <div className="flex items-center gap-2 mb-2">
    <Brain className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Rest is Essential</span>
  </div>
  <div className="bg-violet-900/20 rounded-lg p-4">
    <span className="text-gray-300">
      I really believe that <strong>resting is just as important as grinding</strong>.
      Your brain needs time to digest and organize everything you've learned.
    </span>
  </div>

  {/* Organisation, structuration finale */}
  <div className="flex items-center gap-2 mb-2">
    <FileText className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Note Organization & Review</span>
  </div>
  <p className="text-gray-300">
    Once I came back fresh, I spent the remaining time going through <strong>all my notes</strong> and making them cleaner and more organized inside <strong>Obsidian</strong>.
    I structured everything properly, by phase of the pentest, and made sure I could retrieve any technique or command quickly if needed.
  </p>

  {/* Dernière ligne droite */}
  <div className="flex items-center gap-2 mb-2">
    <CheckCircle2 className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Final Prep Mode</span>
  </div>
  <p className="text-gray-300">
    That was my only focus during those 10 days.  
    No more labs, no boxes, no distractions.  
    Just refinement, calm, and preparation.
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
          {/* --- Bloc Exegol --- */}
<div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  {/* Exegol, le choix de l'environnement */}
  <div className="flex items-center gap-3 mb-2">
    <Cpu className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">Exegol: The Ultimate Offensive Toolkit 🇫🇷</h4>
  </div>
  <p className="text-gray-300">
    First of all, let me say it loud and clear: <strong>Exegol is French. COCORICO 🇫🇷</strong><br  />
<div className="flex justify-center my-6">
    <img
      src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/oss117meme.webp"
      alt="Jack OSS 117 mauvais meme"
      className="rounded-2xl shadow-xl max-w-md"
    />
  </div>
    
    And Kali? You’re <em>mauvais</em>, like Jack in OSS 117. 🕶️ That’s right — I said it.
  </p>
  <p className="text-gray-300">
    All jokes aside, switching from Kali to Exegol was one of the best choices I made in my CPTS prep.
    <strong>Exegol is a container-based offensive security environment</strong> built on Docker, with everything you need pre-installed and tested.  
    Stable, lightweight, super fast to deploy — a fresh environment in 2 seconds? Boom — done.
  </p>
  <p className="text-gray-300">
    I used Exegol as my <strong>main offensive toolkit</strong> through the entire learning path and exam.  
    My setup: <strong>Arch Linux + Exegol</strong>. Performance, control, and consistency.
  </p>

  {/* Outils clés dans Exegol */}
  <div className="bg-violet-900/20 rounded-lg p-4">
    <Terminal className="w-5 h-5 text-violet-400 inline-block mb-1 mr-2" />
    <span className="font-semibold text-violet-400">Key tools inside Exegol:</span>
    <ul className="list-disc ml-6 text-gray-300 mt-2 space-y-1">
      <li><strong>Ligolo-ng</strong> — For tunneling and pivoting inside internal networks. Essential for lateral movement.</li>
      <li><strong>NetExec</strong> — Perfect for credential spraying, SMB enumeration, and assessing exposed shares.</li>
      <li><strong>FFuf</strong> — Fast, precise web fuzzing for enumeration and exploitation.</li>
      <li><strong>Burp Suite</strong> — Web attacks, CSRF bypass, cookie inspection, XSS PoC.</li>
      <li><strong>BloodyAD</strong> — Simple, efficient AD enumeration (easier than BloodHound in many cases).</li>
      <li><strong>Impacket Tools</strong> — <code>secretsdump.py</code>, <code>smbexec.py</code>, <code>wmiexec.py</code> are must-haves for Windows.</li>
      <li><strong>smbserver.py</strong> — To serve payloads or retrieve loot during the exam.</li>
      <li><strong>Nmap</strong> — Fast, reliable, all scripts ready out of the box.</li>
    </ul>
  </div>

  {/* Pourquoi Exegol est incontournable */}
  <p className="text-gray-300">
    What makes Exegol shine: <strong>it saves time and headaches</strong>.  
    No installation, no troubleshooting. Everything’s preconfigured, organized, and ready for offensive ops.  
    <span className="font-semibold text-violet-400">When you're deep into a 10-day exam grind, that matters more than anything.</span>
  </p>

  {/* Atouts majeurs Exegol */}
  <div className="bg-violet-900/20 rounded-lg p-4">
    <span className="font-semibold text-violet-400">✨ Why I’ll never go back:</span>
    <ul className="list-disc ml-6 text-gray-300 mt-2 space-y-1">
      <li>Launches in seconds with Docker, without polluting your host system.</li>
      <li>Zero crash, zero weird package issues — unlike Kali after every <code>apt upgrade</code>.</li>
      <li>Perfect structure for notetaking, screenshots, payload hosting, and log retention.</li>
      <li>Feels like a professional toolkit, not a hobbyist’s distro.</li>
    </ul>
  </div>

  <p className="text-gray-300">
    And did I mention? <strong>It’s French 🇫🇷</strong>.  
    If you're curious about setup, workflow and why I’ll never go back to Kali, check my article:<br />
    <a
      href="https://trxtxbook.com/articles/exegol-docker"
      target="_blank"
      rel="noopener noreferrer"
      className="text-violet-400 underline hover:text-violet-300"
    >
      Exegol: The Ultimate CPTS Toolkit
    </a>
    .
  </p>
</div>

{/* --- Bloc Obsidian & SysReptor --- */}
<div className="mt-10">
  <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
    <FileText className="w-6 h-6" />
    SysReptor & Obsidian for Notes & Reporting
  </h3>
  <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
    {/* Obsidian */}
    <div>
      <h4 className="text-xl font-semibold text-violet-300 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-violet-400" /> Obsidian: My Personal Knowledge Hub
      </h4>
      <p className="text-gray-300">
        <strong>Obsidian</strong> was my central tool for managing knowledge during the CPTS journey.
        Every command, every CVE, every technique was properly documented, explained, and categorized.
      </p>
      <p className="text-gray-300">Here’s a simplified version of my Obsidian tree structure:</p>
      <details className="group bg-[#2a2a2f] rounded-lg p-4 text-white open:ring-1 open:ring-violet-600 transition-all">
        <summary className="cursor-pointer text-violet-400 font-semibold text-lg mb-2">
           Click to view full Obsidian tree structure
        </summary>
        <pre className="bg-black text-white text-sm rounded p-4 mt-4 overflow-x-auto whitespace-pre-wrap">
{` CPTS
  ├── 1- Information Gathering
│   ├── 1- Service Enumeration
│   │   ├── Services
│   │   │   ├── DNS (53)
│   │   │   │   ├── Attack DNS.md
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Record Types
│   │   │   ├── FTP (21)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enumeration.md
│   │   │   ├── IMAP (143, 993)
│   │   │   │   └── Commands
│   │   │   ├── IPMI (623)
│   │   │   │   ├── Authentication
│   │   │   │   └── Default Credentials
│   │   │   ├── IPMI (623).md
│   │   │   ├── Kerberos (88)
│   │   │   │   └── Kerberos.md
│   │   │   ├── LDAP (389,3268).md
│   │   │   ├── MSSQL (1433, 1434, 2433)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   ├── Enum.md
│   │   │   │   ├── T-SQL Commands
│   │   │   │   └── Windows Exploitation.md
│   │   │   ├── MySQL (3306)
│   │   │   │   ├── Basic SQL Queries
│   │   │   │   └── Dangerous Settings
│   │   │   ├── NFS (2049)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enum.md
│   │   │   ├── Oracle TNS (1521)
│   │   │   │   ├── Enum.md
│   │   │   │   ├── SQLplus Commands
│   │   │   │   └── Troubleshooting
│   │   │   ├── POP3 (110, 995)
│   │   │   │   ├── Commands
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enum.md
│   │   │   ├── R-Services (512, 513, 514)
│   │   │   │   ├── Enum.md
│   │   │   │   └── Service Breakdown
│   │   │   ├── RDP (3389)
│   │   │   │   └── Enumeration.md
│   │   │   ├── RPC.md
│   │   │   ├── Rsync (873)
│   │   │   │   └── Enumeration.md
│   │   │   ├── SMB (139, 445)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   ├── Enumeration.md
│   │   │   │   ├── RPCClient
│   │   │   │   ├── Spidering
│   │   │   │   └── Windows Specific
│   │   │   ├── SMTP (25, 465, 587)
│   │   │   │   ├── Common Commands
│   │   │   │   └── enumeration.md
│   │   │   ├── SNMP (161, 162, 10161, 10162)
│   │   │   │   ├── Dangerous Settings
│   │   │   │   └── Enumeration.md
│   │   │   ├── SSH (22)
│   │   │   │   ├── Authentication
│   │   │   │   └── Dangerous Settings
│   │   │   ├── TFTP (69)
│   │   │   │   └── enumeration.md
│   │   │   ├── Telnet (23).md
│   │   │   └── WinRM (5985, 5986)
│   │   │       └── enumeration.md
│   │   └── Tools
│   │       ├── Nmap
│   │       │   ├── Firewall and IDS
│   │       │   └── Host Discovery
│   │       ├── WMIexec
│   │       │   └── Wmiexec.md
│   │       ├── creds
│   │       │   └── Credential Tools.md
│   │       └── tcpdump
│   │           └── Tcpdump.md
│   ├── Active Directory Enumeration
│   │   ├── ACL Enumeration
│   │   │   └── Acl ├⌐num├⌐ration.md
│   │   ├── Credential AD enumeration
│   │   │   ├── Credential AD Linux.md
│   │   │   └── Credential AD windows.md
│   │   ├── Enumerating Security Controls
│   │   │   └── Enumerating security control.md
│   │   ├── Hosts Enumeration
│   │   │   └── Initial Domain Enumeration.md
│   │   ├── LLMNR_NBT-NS Poisoning
│   │   │   ├── From Linux.md
│   │   │   └── From Windows.md
│   │   ├── Living Off The Lands.md
│   │   ├── Password Policy Enumeration
│   │   │   └── Enumerating & Retrieving Password Policies.md
│   │   ├── Password Spraying
│   │   │   ├── Linux.md
│   │   │   └── Windows.md
│   │   ├── Resume Skill Assesment HTB.md
│   │   ├── SMB Enumeration
│   │   │   └── Smb ├ënum├⌐ration.md
│   │   ├── Tools
│   │   │   ├── BloodHound
│   │   │   │   ├── Analysis
│   │   │   │   └── Utilisation.md
│   │   │   └── PowerView
│   │   │       └── Powerview.md
│   │   └── User Enumeration
│   │       ├── With Access
│   │       │   └── With Access.md
│   │       └── Without Access
│   │           └── User Enumeration Without access.md
│   ├── Application Enumeration
│   │   ├── Attacking Applications Connecting to Services.md
│   │   ├── ColdFusion
│   │   │   └── Cold Fusion.md
│   │   ├── Drupal
│   │   │   └── Drupal.md
│   │   ├── GitLab
│   │   │   └── Gitlab.md
│   │   ├── IIS Tilde Enumeration
│   │   │   └── IiS tilde ├ënum├⌐ration.md
│   │   ├── Jenkins
│   │   │   └── Jenkins.md
│   │   ├── Joomla
│   │   │   └── Joomla.md
│   │   ├── Other Notable App.md
│   │   ├── PRTG Network Monitor
│   │   │   └── Prtg network monitor.md
│   │   ├── Shellshock CGI.md
│   │   ├── Splunk
│   │   ├── ThinkClient App tier2 and tier3.md
│   │   ├── Tomcat
│   │   │   ├── Tomcat CGi.md
│   │   │   └── Tomcat.md
│   │   ├── Wordpress
│   │   │   └── WordPress.md
│   │   └── osTicket
│   │       └── Osticket.md
│   ├── Enumeration Basic Linux Systeme.md
│   ├── Enumeration Basic Windows Systeme.md
│   └── Web Enumeration
│       ├── Active
│       │   ├── Directory & Page Fuzzing
│       │   │   ├── Directory And Page Fuzzing avec Dirsearch.md
│       │   │   └── Directory and page fuzzing FFUF.md
│       │   ├── Parameter & Value Fuzzing
│       │   │   └── Param├⌐trer and value fuzzing.md
│       │   ├── Subdomain & Virtual Host Fuzzing
│       │   │   └── Subdomain and virtual host enum.md
│       │   └── Web Server Enumeration
│       │       └── Web server enumeration.md
│       ├── Passive
│       │   ├── Google Dorking
│       │   │   └── Google dorking.md
│       │   └── Passive Infrastructure Identification
│       │       ├── Passive Subdomain Enumeration
│       │       └── Passive infra enumeration.md
│       └── Tools
│           └── EyeWitness
│               └── EyeWitness.md
├── 2- Exploitation
│   ├── Credential Exploitation.md
│   ├── Pre-Exploitation
│   │   ├── Shells
│   │   │   ├── Bind Shells.md
│   │   │   ├── Payloads.md
│   │   │   ├── Reverse Shell.md
│   │   │   ├── Webshells.md
│   │   │   └── Windows Shells.md
│   │   └── Tools
│   │       ├── Metasploit Components.md
│   │       ├── Metasploit Session.md
│   │       ├── Metasploit Venom.md
│   │       └── Searchsploit
│   │           └── Searchsploot.md
│   ├── Service Exploitation
│   │   └── Web Exploitation
│   │       ├── CGI Shellshock Attack
│   │       │   └── CGI shellshock attack.md
│   │       ├── CSRF.md
│   │       ├── Command Injection
│   │       │   ├── Cheatsheets complet.md
│   │       │   └── Skill Assessment R├⌐sumer.md
│   │       ├── Cross-Site Scripting (XSS)
│   │       │   ├── Discovery
│   │       │   ├── Phishing
│   │       │   ├── Session Hijacking
│   │       │   └── ≡ƒöÑ XSS to Local File Read (XSS2LFR) via JavaScript in PDF Generator.md
│   │       ├── File Uploads
│   │       │   └── Basic.md
│   │       ├── HTTP Verb Tampering.md
│   │       ├── IDOR.md
│   │       ├── Local File Inclusion (LFI)
│   │       │   ├── File Disclosure
│   │       │   ├── Filter Bypass
│   │       │   ├── LFI to RCE
│   │       │   └── PHP decoding webpage.md
│   │       ├── SQLi
│   │       │   ├── SQL Injection NoSQL Injection.md
│   │       │   ├── SQLMAP.md
│   │       │   └── Union Sqli.md
│   │       ├── Skill Assessment Web Attacks (xxe,idor,xml,httpverb).md
│   │       └── XXE
│   │           ├── Blind
│   │           ├── File Disclosure
│   │           ├── RCE
│   │           ├── XXE GLOBAL.md
│   │           └── Xxe.md
│   └── Tools
│       └── Credential Generating.md
├── 3- Lateral Movement
│   ├── Linux Lateral Movement
│   │   └── Kerberos Pass the Ticket
│   │       ├── Ccache Files
│   │       │   └── Ccache Filles.md
│   │       ├── Kerberos Pass the Tiket.md
│   │       ├── KeyTab Files
│   │       │   └── Keytabs File.md
│   │       ├── Linikatz
│   │       │   └── Linikatz.md
│   │       └── Mimikatz.md
│   ├── Pivoting
│   │   ├── Advanced Tunneling
│   │   │   ├── DNS Tunneling (Dnscat2).md
│   │   │   └── SOCKS_ICMP Tunneling.md
│   │   ├── Double Pivoting
│   │   │   └── RDP et SOCKS Tunneling avec SocksOverRDP.md
│   │   ├── Dynamic and Local Port Forwarding
│   │   │   ├── Dynamic Port Forwarding (SOCKS, SSH).md
│   │   │   └── Remote_Reverse Port Forwarding avec SSH.md
│   │   ├── Meterpreter_&_Socat
│   │   │   ├── Meterpreter Pivoting_port_forwarding.md
│   │   │   └── Socat Reverse & Bind Shell.md
│   │   ├── Pivoting Methods
│   │   │   ├── Chisel ( SOCKS5 Tunneling).md
│   │   │   ├── Netsh (Windows Port Forwarding).md
│   │   │   ├── Plink, Sshuttle (SSH Pivoting).md
│   │   │   └── Rpivot (Web Server Pivoting).md
│   │   ├── Pivoting.md
│   │   ├── Tableau  Recapitulatif des M├⌐thodes de Pivoting.md
│   │   └── Tools
│   │       ├── Draw.io.md
│   │       ├── Meterpreter
│   │       │   └── Meterpreter pivoting.md
│   │       ├── Netsh
│   │       │   └── Netsh.md
│   │       ├── Plink
│   │       │   └── Plink.md
│   │       ├── RPIVOT
│   │       │   └── RPIVOT.md
│   │       └── Sshuttle
│   ├── Windows Lateral Movement
│   │   ├── ACL DCSYNC ATTACK.md
│   │   ├── ADCS ESC 1 A 13 BIG DOSSIER
│   │   │   ├── ESC1.md
│   │   │   ├── ESC2.md
│   │   │   └── ESC3.md
│   │   ├── Active Directory Lateral Movement
│   │   │   ├── ACL Exploitation_Lateral_Abuse.md
│   │   │   ├── Double Hob Kerberos Problem.md
│   │   │   ├── RDP
│   │   │   │   └── Priviliged Access_rdp_winrm_linux_windows_mssql.md
│   │   │   └── Vul Recente_print-nightmare_potipotam_NoPac.md
│   │   ├── Domain Trust Forest
│   │   │   ├── Attacking Domain Trust Linux.md
│   │   │   ├── Attacking Domain Trust windows.md
│   │   │   ├── Attacking Domain Trusts - Cross-Forest Trust Abuse - from Linux.md
│   │   │   ├── Attacking Domain Trusts-Cross-Forest Trust Abuse - from Windows.md
│   │   │   └── Domain Trust.md
│   │   ├── Kerberos Pass the Ticket
│   │   │   ├── Kerberoasting Pass The ticket from windows.md
│   │   │   ├── Kerberos Pass the Ticket From Linux.md
│   │   │   └── Ticket Request
│   │   ├── Misconfiguration AD exploit.md
│   │   ├── NTLM Pass the Hash
│   │   ├── PowerView.ps1 AD.md
│   │   ├── SeBackUpPrivilege Abuse.md
│   │   └── ≡ƒº¿ ESC4 ΓÇô Exploitation via WriteOwner.md
│   └── dfsdsfdsf.md
├── 4- Post-Exploitation
│   ├── Linux Post Exploitation
│   │   ├── File Transfer
│   │   │   ├── Linux Technique.md
│   │   │   ├── Living Of The Lands.md
│   │   │   ├── Technique Supplementaire.md
│   │   │   ├── Transfer Files with Codes.md
│   │   │   └── Windows Technique.md
│   │   └── Privilege Escalation
│   │       ├── 1 - Information Gathering.md
│   │       ├── 2 - Environment-based Privilege Escalation.md
│   │       ├── 3 - Permissions-based Privilege Escalation.md
│   │       ├── 4 - Service-based Privilege Escalation.md
│   │       ├── 5 - Linux Internals-based Privilege Escalation.md
│   │       ├── 6 - Recent 0-Days.md
│   │       └── Technique de PrivEsc.md
│   ├── Password Attacks
│   │   ├── Cracking Files.md
│   │   ├── Linux Password Attacks.md
│   │   ├── PassTheHash.md
│   │   ├── Remote Password Attacks.md
│   │   └── Windows Local Password Attacks.md
│   └── Windows Post Exploitation
│       ├── Info
│       │   ├── Access Control List (ACL)
│       │   ├── Accounts
│       │   ├── Built-in AD Groups
│       │   ├── Execution Policy
│       │   ├── NTFS
│       │   ├── PowerShell
│       │   ├── Registry
│       │   └── Services
│       ├── Kernel Exploits
│       └── Privilege Escalation
│           ├── AD Certificates Services.md
│           ├── Kerberbroasting
│           │   ├── Kerberoasting.md
│           │   └── Targeted Kerberoasting.md
│           ├── Legacy Operating Systems
│           │   ├── Windows 7
│           │   └── Windows Server 2008
│           ├── Password Attacks
│           │   ├── Hydra.md
│           │   ├── JohnTheRipper.md
│           │   ├── Linux Credential Hunting.md
│           │   ├── Linux Passwd, Shadow & Opasswd.md
│           │   ├── WD Active Directory & NTDS.dit.md
│           │   ├── WD Attacking LSASS.md
│           │   ├── WD Credential Hunting.md
│           │   └── WD Windows Attacking SAM and LSA.md
│           ├── Privilege escalation
│           │   ├── 1 - Lay of the Lands.md
│           │   ├── 2 - Windows User Privileges.md
│           │   ├── 3 - Windows Group Privileges.md
│           │   ├── 4 - Attacking the OS.md
│           │   ├── 5 - Credential Hunting.md
│           │   ├── 6 - Restricted Environments.md
│           │   ├── 7 - Additional Technique.md
│           │   ├── 8 - End of life System.md
│           │   └── Sans titre 8.md
│           ├── Privileged Groups
│           │   ├── Backup Operators
│           │   ├── DnsAdmins
│           │   └── Print Operators
│           └── User Privileges
│               ├── Abusing Privilege AD.md
│               ├── SeDebugPrivilege
│               └── SeImpersonate & SeAssignPrimaryToken
`}
        </pre>
      </details>
      <p className="text-gray-300">
        <span className="font-semibold text-violet-400">My advice:</span> <br />
        Create your own structured note-taking system.  
        It improves retention and gives you something to reference during the exam.  
        <span className="block">Organizing your thoughts while learning pays off under pressure.</span>
      </p>
    </div>

    {/* SysReptor */}
    <div>
      <h4 className="text-xl font-semibold text-violet-300 flex items-center gap-2 mt-8">
        <Network className="w-5 h-5 text-violet-400" /> SysReptor: The Final Weapon for Reporting
      </h4>
      <p className="text-gray-300">
        For the actual report submission, I used <strong>SysReptor</strong>.  
        It’s HTB’s own reporting platform, making the process smooth and professional.
      </p>
      <p className="text-gray-300">
        What I liked most was the <strong>structured reporting workflow</strong>:  
        each vulnerability is a dedicated “Finding” entry, with severity, impact, reproduction steps, screenshots, and mitigation.  
        It helped maintain consistency and clarity throughout my <strong>190-page report</strong>.
      </p>
      <p className="text-gray-300">Here’s what my typical SysReptor structure looked like:</p>
      <ul className="list-disc ml-6 text-gray-300 text-sm space-y-1">
        <li><strong>Walkthrough:</strong> Chronological attack steps, covering each phase</li>
        <li><strong>Findings:</strong> Each vulnerability in detail (IDOR, SSRF, SQLi...)</li>
        <li><strong>Flags:</strong> Flag IDs and how they were captured</li>
        <li><strong>Recommendations:</strong> Clear, professional advice per issue</li>
      </ul>
      <p className="text-gray-300">
        I filled SysReptor in real-time during the exam using the <strong>“trigger-based method”</strong>: every time I discovered something important or completed a step, I immediately documented it. No time wasted at the end.
      </p>
      <div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2 mt-4">
        <CheckCircle2 className="w-5 h-5 text-violet-400" />
        <span className="text-gray-300">
          <strong>Final tip:</strong> Obsidian is for you, SysReptor is for HTB.<br />
          Keep both clean, concise, and well-structured.
        </span>
      </div>
    </div>
  </div>
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
         <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  {/* Aperçu de l’examen CPTS */}
  <div className="flex items-center gap-3 mb-2">
    <Shield className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">CPTS Exam: The Closest Thing to a Real Pentest</h4>
  </div>
  <p className="text-gray-300 text-lg">
    The CPTS exam simulates a <strong>real-world offensive engagement</strong> against a fictional company.
    While I can’t share too much detail due to HTB’s terms and conditions, I can confidently say:  
    <strong>This is the closest thing to a real pentest you’ll get in a certification exam.</strong>
  </p>

  {/* Scénario et mission */}
  <div className="flex items-center gap-2 mb-2">
    <Terminal className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">The Engagement Scenario</span>
  </div>
  <p className="text-gray-300">
    From the beginning, you’re provided with a clear scope via a letter of engagement — just like in a professional red team operation.
    The initial entry point is a public-facing web application.  
    Your mission? <strong>Fully compromise two separate Active Directory domains</strong> (yes, two!) and gain access to at least <strong>12 out of 14 flags</strong> across the infrastructure.
  </p>

  {/* Réalisme et taille du réseau */}
  <div className="flex items-center gap-2 mb-2">
    <Network className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">A Realistic, Segmented Network</span>
  </div>
  <p className="text-gray-300">
    The network is <strong>vast and realistic</strong> — Windows & Linux hosts, segmentation, pivoting requirements.
    Double pivoting is mandatory; tools like <strong>Ligolo-ng</strong> become essential.
  </p>

  {/* Vulnérabilités et complexité */}
  <div className="flex items-center gap-2 mb-2">
    <ListChecks className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Vulnerabilities & Method</span>
  </div>
  <p className="text-gray-300">
    Vulnerabilities aren’t exotic or advanced: everything is covered in the CPTS Learning Path.
    But the <strong>scale and density</strong> can mislead you.  
    There aren’t real "rabbit holes" like in HTB Hard/Insane boxes, but the environment is so big you can lose hours if you’re not pragmatic.
  </p>

  {/* Gestion du temps et mentalité */}
  <div className="flex items-center gap-2 mb-2">
    <Clock className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Pacing & Mindset</span>
  </div>
  <p className="text-gray-300">
    The exam lasts <strong>10 full days</strong>. I worked an average of <strong>7 hours per day</strong>.
    Expect roadblocks — sometimes I was stuck for a day or more.  
    When that happened, I stepped back, re-enumerated, and thought critically.  
    You’re simulating the mindset of a hacker. <strong>Creativity and adaptability</strong> are as important as technical skill.
  </p>

  {/* Conseils de réussite */}
  <div className="flex items-center gap-2 mb-2">
    <Brain className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">How to Succeed</span>
  </div>
  <div className="bg-violet-900/20 rounded-lg p-4">
    <span className="text-gray-300">
      The Learning Path prepares you <strong>perfectly</strong> — but don’t rely on automation or tunnel vision.
      <br />
      <span className="font-semibold text-violet-400">Think like an attacker. Move laterally. Stay focused. Be methodical.</span>
    </span>
  </div>

  {/* Rapport et reporting */}
  <div className="flex items-center gap-2 mb-2">
    <FileText className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Reporting</span>
  </div>
  <p className="text-gray-300">
    For the report, I used <strong>SysReptor</strong> and exported everything as a polished PDF.  
    I strongly recommend this method — it’s clean, professional, and fits HTB’s expectations.
    Optionally, you can include annexes with technical evidence like a <strong>full DC dump or password policy audit (e.g., DPAT analysis)</strong> if relevant.
  </p>
</div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Daily Breakdown
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  {/* Départ méthodo et première erreur */}
  <div className="flex items-center gap-3 mb-2">
    <FileText className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">Reporting Habits: What Not To Do</h4>
  </div>
  <p className="text-gray-300 text-lg">
    I went into the exam <strong>well-prepared</strong>, with a strong methodology and solid habits… or so I thought.
    On <strong>Day 1</strong>, I promised myself to document everything into SysReptor <strong>every evening</strong>.<br/>
    <span className="text-red-400 font-semibold">❌ Big mistake.</span>
  </p>

  {/* La vraie méthode qui marche */}
  <div className="flex items-center gap-2 mb-2">
    <ListChecks className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">The Real-Time Trigger-Based Method</span>
  </div>
  <div className="bg-violet-900/20 rounded-lg p-4">
    <span className="text-gray-300">
      What really works is the <strong>real-time trigger-based approach</strong> — every time you discover something (a port, a user, a foothold, a flag…), take a few seconds to document it <em>immediately</em>.<br/>
      <span className="block mt-1 font-semibold text-violet-400">WRITE YOUR REPORT IN REAL-TIME.</span>
    </span>
  </div>

  {/* ChatGPT pour accélérer la rédaction */}
  <div className="flex items-center gap-2 mb-2">
    <Zap className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Using ChatGPT (the Right Way)</span>
  </div>
  <p className="text-gray-300">
    💡 Yes, I used <strong>ChatGPT</strong> to help speed up some parts of the writing (especially impact/mitigation sections),  
    but I always <strong>reviewed and rewrote everything</strong> so it matched my style and findings.
  </p>

  {/* Retour d’expérience sur le déroulé des flags */}
  <div className="flex items-center gap-2 mb-2">
    <Brain className="w-6 h-6 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Progress & Mental Game</span>
  </div>
  <p className="text-gray-300">
    In terms of progress, the first days were fast — I gained solid access early and moved forward smoothly until I hit <strong>flag 9</strong>.
    From there, things got tougher. What helped was stepping back, <strong>re-enumerating</strong>, and reanalyzing everything.  
    That’s how I unlocked the next steps.
  </p>
  <p className="text-gray-300">
    The same happened with <strong>flag 12</strong>. There’s no shame in going backward to move forward.  
    The content is dense, and it’s stressful to have only 9 flags by Day X.  
    <span className="font-semibold text-violet-400">Don’t panic — stay calm, think smart, and keep moving.</span>
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
          {/* --- Bloc : Real-Time Reporting Workflow --- */}
<div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  <div className="flex items-center gap-3 mb-2">
    <FileText className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">Real-Time Reporting Workflow</h4>
  </div>
  <p className="text-gray-300">
    During my CPTS exam, I initially planned to write the report every evening. <strong>Big mistake.</strong>  
    With the mental fatigue and the need to keep momentum, it quickly became unsustainable.
    That’s when I decided to apply a <strong>real-time reporting workflow</strong>, and it made a massive difference.
  </p>

  <div className="flex items-center gap-2 mb-2">
    <ListChecks className="w-5 h-5 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Trigger-Based Strategy</span>
  </div>
  <p className="text-gray-300">
    As soon as I discovered something relevant (new service, credentials, shell…),  
    I immediately documented it in <strong>SysReptor</strong> and took supporting notes in <strong>Obsidian</strong>.  
    This kept everything fresh—never had to backtrack through a mountain of logs.
  </p>
  <p className="text-gray-300">
    For example, after compromising a user and gaining access to a shared folder,  
    I opened SysReptor, created a <strong>Finding</strong>, linked the vulnerable service, inserted steps, and dropped the screenshot.  
    No “I’ll do it later.” I moved on with a clean state of mind.
  </p>

  <div className="flex items-center gap-2 mb-2">
    <BookOpen className="w-5 h-5 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Timeline & Tags</span>
  </div>
  <p className="text-gray-300">
    Every note in Obsidian was linked to my timeline.  
    I used tags like <code>#flag9</code>, <code>#pivot</code>, <code>#user-compromise</code> to track progress and used the graph view to reconnect ideas when stuck.
  </p>

  <div className="flex items-center gap-2 mb-2">
    <CheckCircle2 className="w-5 h-5 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Unlocking Blockages</span>
  </div>
  <p className="text-gray-300">
    This approach helped me <strong>overcome blockages</strong> (Flag 9, Flag 12).  
    When stuck, I’d revisit previous notes, spot what I’d missed, and unlock the path.  
    Without this system, I’d have been lost in the internal network complexity.
  </p>

  <div className="flex items-center gap-2 mb-2">
    <Zap className="w-5 h-5 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">AI as a Sidekick</span>
  </div>
  <p className="text-gray-300">
    <strong>Don’t hesitate to use ChatGPT</strong> as your sidekick—but always verify its output.
    I used it mainly to rephrase technical steps for clarity and to write neutral language for the report.
  </p>
</div>

{/* --- Bloc : Walkthroughs vs. Findings --- */}
<div className="mt-10">
  <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
    <Code className="w-6 h-6" />
    Walkthroughs vs. Findings
  </h3>
  <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
    {/* Walkthrough definition */}
    <div className="flex items-center gap-2 mb-2">
      <FileText className="w-5 h-5 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">Walkthrough</span>
    </div>
    <p className="text-gray-300">
      The <strong>walkthrough</strong> is not just your internal exploitation.  
      It’s a complete step-by-step guide that should allow your reviewer to reproduce the entire attack path —  
      from the initial web interface to full domain compromise.
    </p>
    <p className="text-gray-300">
      Think of it as a <strong>technical replay</strong> of your operation, as plain and direct as possible.  
      No justifications, no theory — just actions, ordered logically.  
      It must cover everything: initial attack surface, lateral movement, escalation, trust exploitation, external pivoting.
    </p>
    <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-700/30">
      <h4 className="text-violet-400 text-xl font-semibold mb-3">✅ Example of Walkthrough Content</h4>
      <ul className="list-disc list-inside text-white space-y-2">
        <li>Identified login page at <code>/admin</code> → performed login bruteforce → found valid creds.</li>
        <li>Logged in, found LFI via log injection → escalated to RCE.</li>
        <li>Gained reverse shell as <code>www-data</code> → enumerated users → pivoted to internal host.</li>
        <li>Compromised AD user via token abuse → escalated to Domain Admin.</li>
      </ul>
    </div>
    {/* Findings definition */}
    <div className="flex items-center gap-2 mb-2 mt-6">
      <FileText className="w-5 h-5 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">Findings</span>
    </div>
    <p className="text-gray-300">
      This is where your infosec brain shines.
      Each finding is your chance to demonstrate understanding of vulnerabilities, their root causes, impacts, and remediation.
      Sometimes, a single vulnerability leads to multiple findings (e.g. weak password policy after web vuln).
    </p>
    <ul className="list-disc list-inside text-white space-y-2">
      <li><strong>Title:</strong> short and impactful (e.g., "Insecure Password Storage on Internal Application").</li>
      <li><strong>Summary:</strong> what’s affected, how, and why it matters.</li>
      <li><strong>Technical Details:</strong> screenshots, payloads, steps, tool output.</li>
      <li><strong>Risk Analysis:</strong> CVSS-style reasoning or your own assessment.</li>
      <li><strong>Remediation:</strong> clear, actionable suggestions.</li>
    </ul>
    <p className="text-gray-300">
      These two sections — walkthrough and findings — are fundamentally different.
      Walkthrough is factual and linear, findings are analytical and structured. Don’t mix them.
      Respect their intent and your report will be powerful, clear, and professional.
    </p>
  </div>
</div>

{/* --- Bloc : What I Included & Why --- */}
<div className="mt-10">
  <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
    <Lightbulb className="w-6 h-6" />
    What I Included & Why
  </h3>
  <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
    {/* Mindset */}
    <div className="flex items-center gap-2 mb-2">
      <BookOpen className="w-5 h-5 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">Mindset: Certification, Not Just a Report</span>
    </div>
    <p className="text-gray-300">
      This isn’t just a report—it’s a certification exam.  
      You’re not only demonstrating technical skills, but also your ability to <strong>document a pentest at the highest professional standard</strong>.
    </p>
    {/* Maximum relevance */}
    <h4 className="text-lg font-semibold text-violet-400">Show Everything (but only what matters)</h4>
    <p className="text-gray-300">
      Your goal: <strong>maximum relevance, maximum detail, zero noise</strong>.  
      Every finding was written with extreme precision.  
      I reviewed every section <strong>multiple times</strong> to ensure it contributed meaningfully,  
      could be understood standalone, and painted a clear attack narrative.
      <br /><em>Would this help the Blue Team understand what happened? If not, remove it.</em>
    </p>
    {/* Sanitize */}
    <h4 className="text-lg font-semibold text-violet-400">🔐 Sanitize EVERYTHING</h4>
    <p className="text-gray-300">
      <strong>This is a security report. Never forget that.</strong>  
      Even in a lab, treat it like a real-world client engagement:
    </p>
    <ul className="list-disc pl-6 text-gray-300">
      <li>Hashes: 🔒 <strong>sanitized</strong></li>
      <li>Internal usernames: 🔒 <strong>sanitized</strong></li>
      <li>Internal IPs/domains: 🔒 <strong>sanitized</strong></li>
      <li>Passwords: 🔒 <strong>sanitized or masked</strong></li>
      <li>Screenshots: 🔒 <strong>blurred or redacted</strong></li>
    </ul>
    <p className="text-gray-300">
      ⚠️ A leaked report shouldn’t help an attacker reproduce the compromise. Prove you understand the <strong>responsibility</strong> of reporting.
    </p>
    {/* Walkthrough linked to findings */}
    <h4 className="text-lg font-semibold text-violet-400">Clear Walkthrough, Linked to Findings</h4>
    <p className="text-gray-300">
      My walkthrough was a <strong>step-by-step narrative</strong>, from the first scan to full AD compromise.
      At every relevant point, I included direct links to related <strong>Findings</strong> for easy navigation.
      This structure made the document easier for technical and non-technical readers.
    </p>
    {/* Pivoting */}
    <h4 className="text-lg font-semibold text-violet-400">Pivoting & Visibility</h4>
    <p className="text-gray-300">
      Internal pivoting is <strong>one of the hardest parts</strong>.  
      I documented every pivot (Ligolo-ng, tunnels, routes) clearly, with:
    </p>
    <ul className="list-disc pl-6 text-gray-300">
      <li>Diagrams when needed</li>
      <li>Short code blocks for interface config</li>
      <li>Tables to track access progression</li>
    </ul>
    <p className="text-gray-300">
      The goal: <strong>anyone skilled can reproduce your attack path</strong> without asking questions.
    </p>
    {/* DPAT */}
    <h4 className="text-lg font-semibold text-violet-400">Extra: Password Audit (DPAT)</h4>
    <p className="text-gray-300">
      If you manage to dump the DC, run a <strong>DPAT-style password audit</strong>.  
      I included sanitized results in a ZIP with the PDF report:  
      great to show post-exploitation analysis, weak policies, and real-world risk.
    </p>
    {/* Audience */}
    <h4 className="text-lg font-semibold text-violet-400">Tailoring to the Audience</h4>
    <p className="text-gray-300">
      I adapted tone and structure by section:
    </p>
    <ul className="list-disc pl-6 text-gray-300">
      <li><strong>Walkthrough / Findings</strong>: highly technical, precise</li>
      <li><strong>Assessment Overview & Recommendations</strong>: accessible, impact-focused</li>
    </ul>
    <p className="text-gray-300">
      This shows you can communicate with <strong>both technical and non-technical stakeholders</strong>.
    </p>
    {/* Conclusion */}
    <h4 className="text-lg font-semibold text-violet-400">Final Words</h4>
    <p className="text-gray-300">
      This isn’t about flexing.  
      It’s about delivering a <strong>reproducible</strong>, <strong>professional</strong>, and <strong>secure</strong> pentest report.
      <br />
      Be rigorous, clear, and respectful of the responsibility that comes with this knowledge.
      <br /><strong>And once again: Sanitize everything. Always.</strong>
    </p>
  </div>
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
        <strong>Set a daily routine:</strong> Block out fixed sessions for pentesting and for breaks. For example, I aimed for <span className="text-violet-400 font-semibold">7 to 10 hours per day</span>, but split between morning and afternoon, with real downtime in btween.
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