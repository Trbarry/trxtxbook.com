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
  </div>
</section>


      {/* Décomposition de la stratégie d'apprentissage */}
<section className="mb-16">
  <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
    <div className="flex items-center gap-3 mb-8">
      <Brain className="w-8 h-8 text-violet-400" />
      <h2 className="text-3xl font-bold">Décomposition de ma stratégie d'apprentissage</h2>
    </div>
    
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Structure du parcours CPTS
        </h3>
        <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
{/* Routine de travail et organisation générale */}
<div className="flex items-center gap-3 mb-2">
  <Calendar className="w-6 h-6 text-violet-400" />
  <h4 className="text-xl font-semibold text-violet-300">Ma routine de travail</h4>
</div>
<p className="text-gray-300 text-lg">
  Je n’ai pas suivi de planning strict durant le cursus CPTS : je visais simplement environ <strong>6 à 7 heures par jour</strong>, <strong>cinq jours par semaine</strong>, en prenant toujours des pauses toutes les deux heures pour garder la concentration.
  Avec l’expérience, j’ai compris que <strong>le repos compte autant que le temps de travail</strong> — surtout en cybersécurité, où la compréhension est plus importante que le “par cœur”.
</p>

{/* Méthodologie d’apprentissage */}
<div className="flex items-center gap-2 mb-2">
  <Monitor className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Processus d’apprentissage</span>
</div>
<p className="text-gray-300">
  Ma routine était simple : <strong>je démarrais un module</strong>, <strong>j’allais au bout</strong>, et je prenais <strong>des notes structurées</strong> au fil de l’eau.
  Dès que possible, je <strong>enchaînais avec une ou deux boxes HTB</strong> en lien avec le thème du module.<br/>
  Cette pratique était essentielle : les défis pratiques m’aidaient à <strong>ancrer tout de suite ce que je venais de voir</strong>.
</p>

{/* Révision quotidienne */}
<div className="flex items-center gap-2 mb-2">
  <FileText className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Révision quotidienne</span>
</div>
<p className="text-gray-300">
  Chaque matin, je <strong>relisais mes notes de la veille</strong> pour garder tout en tête et renforcer la mémoire à long terme.
  Ce n’était pas toujours facile de garder la motivation — il y a des hauts et des bas — mais je me répétais que <strong>la discipline devait l’emporter sur le confort</strong>.
  À la longue, ça a payé. Les progrès n’étaient pas toujours visibles au jour le jour, mais avec le recul, l’accumulation est flagrante.
</p>

{/* Hygiène de vie et bien-être */}
<div className="flex items-center gap-2 mb-2">
  <Brain className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Santé physique & mentale</span>
</div>
<p className="text-gray-300">
  En dehors du travail, je veillais à <strong>prendre soin de ma santé mentale et physique</strong>.
  Je m’entraînais <strong>quatre fois par semaine</strong>, <strong>2 à 3 heures par séance</strong>, et je faisais des <strong>balades régulières avec ma famille et mon chien</strong>.
  Rester actif, m’aérer l’esprit, m’a permis d’éviter le burnout et de revenir plus frais chaque jour.
  <span className="block mt-1 font-semibold text-violet-400">Bouger son corps, c’est aussi important que de faire carburer son cerveau.</span>
</p>

{/* Motivation, musique, ambiance */}
<div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2">
  <Zap className="w-6 h-6 text-violet-400" />
  <span className="text-gray-300">
    Soyons honnêtes — <strong>une bonne playlist Spotify</strong> rend le grind bien plus agréable.
    Quand j’étais dans le flow, la musique m’aidait à rester focus et à transformer les longues sessions en heures productives.
  </span>
</div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <Monitor className="w-6 h-6" />
          Boxes HTB, modules & playlist IppSec
        </h3>
        <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
{/* Associer modules et boxes */}
<div className="flex items-center gap-3 mb-2">
  <Terminal className="w-6 h-6 text-violet-400" />
  <h4 className="text-xl font-semibold text-violet-300">De la théorie à la pratique</h4>
</div>
<p className="text-gray-300 text-lg">
  Pendant le <strong>parcours CPTS</strong>, je m’imposais de faire <strong>1 à 2 boxes HTB par module</strong>, toujours en lien direct avec la thématique étudiée.
  Par exemple, après le module <em>Web Exploitation</em>, j’allais chercher un challenge XSS ou file upload (en box easy/medium, souvent retirée).
  Cette pratique concrète m’a permis d’ancrer chaque notion immédiatement.
</p>

{/* Live boxes : montée en niveau */}
<div className="flex items-center gap-2 mb-2">
  <Users className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Monter en niveau avec les live boxes</span>
</div>
<p className="text-gray-300">
  Une fois le cursus fini, je suis passé sur les <strong>live boxes de Hack The Box</strong>.<br/>
  Pas forcément reliées aux modules — juste pour le plaisir et le challenge.<br/>
  Ces boxes m’ont permis de bosser :
</p>
<ul className="list-disc ml-8 text-gray-300 space-y-1">
  <li><strong>Le pivoting interne</strong> (big up à Ligolo-ng)</li>
  <li><strong>La logique post-exploitation</strong> et le déplacement latéral</li>
  <li><strong>La gestion des antivirus et EDR</strong> en environnement réaliste</li>
</ul>
<p className="text-gray-300">
  J’ai fini par atteindre le rang <strong>Pro Hacker</strong> — pas sans galérer. Certaines boxes dures m’ont mis la misère, oui, j’ai eu besoin d’aide.
  C’est normal. Ce qui compte, c’est ce que tu retiens du process.
</p>

{/* Playlist IppSec */}
<div className="flex items-center gap-2 mb-2">
  <BookOpen className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">La playlist IppSec CPTS</span>
</div>
<div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2">
  <ArrowRight className="w-5 h-5 text-violet-400" />
  <span className="text-gray-300">
    J’ai attaqué la  
    <a href="https://www.youtube.com/watch?v=H9FcE_FMZio&list=PLidcsTyj9JXItWpbRtTg6aDEj10_F17x5"
      target="_blank"
      className="text-violet-400 hover:underline font-semibold ml-1"
    >
      playlist CPTS d’IppSec (non officielle)
    </a>
    . Les boxes sont <strong>super bien sélectionnées</strong>. Certaines contiennent des vulnérabilités quasiment identiques à l’examen CPTS.<br/>
    Mais surtout, elles t’obligent à :
  </span>
</div>
<ul className="list-disc ml-8 text-gray-300 space-y-1">
  <li><strong>Enchaîner plusieurs étapes</strong> sans aide</li>
  <li><strong>Structurer ton workflow</strong> comme dans un vrai pentest</li>
  <li><strong>Gérer seul le pivot et la post-exploitation</strong></li>
</ul>
<p className="text-gray-300">
  Ces boxes m’ont vraiment <strong>fait prendre confiance</strong>.<br/>
  Après la playlist, je me suis dit : <em>“Ok, là je me sens prêt pour les 10 jours d’examen.”</em>
</p>

{/* Préparation alternative : ProLabs, hard/insane */}
<div className="flex items-center gap-2 mb-2">
  <TrendingUp className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Méthodes de préparation alternatives</span>
</div>
<div className="bg-violet-900/20 rounded-lg p-4">
  <p className="text-gray-300 mb-2">
    💬 Je sais que certains bossent aussi sur les <strong>ProLabs</strong> ou carrément des boxes hard/insane pour se préparer, mais perso je n’en ai pas ressenti le besoin.
    Pour moi, si tu :
  </p>
  <ul className="list-disc ml-8 text-gray-300 space-y-1">
    <li>fais sérieusement le parcours CPTS,</li>
    <li>associes modules et boxes <strong>de façon régulière</strong>,</li>
    <li>lances la playlist IppSec <strong>au bon moment</strong>,</li>
  </ul>
  <p className="text-gray-300 mt-2">
    …tu as déjà <strong>tout ce qu’il faut</strong>.<br/>
    Pas besoin d’en faire trop. Le learning path CPTS à lui seul est déjà <strong>très complet</strong>.
  </p>
</div>

{/* Conseil timing playlist */}
<div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2">
  <Clock className="w-5 h-5 text-violet-400" />
  <span className="text-gray-300">
    <strong>Conseil perso :</strong>
    N’attends pas trop après avoir fini le cursus avant d’attaquer la playlist IppSec — tu risques d’oublier des points clés.
    Mais ne commence pas trop tôt non plus.<br/>
    Prends le temps d’acquérir les bases avec les modules avant d’y aller. <strong>Fais-toi confiance.</strong>
  </span>
</div>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* Préparation finale & Sprint examen */}
<section className="mb-16">
  <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
    <div className="flex items-center gap-3 mb-8">
      <TrendingUp className="w-8 h-8 text-violet-400" />
      <h2 className="text-3xl font-bold">Préparation finale & Sprint d’examen</h2>
    </div>
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Sprint final : 10 jours
        </h3>
        <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
{/* Préparation finale, break avant examen */}
<div className="flex items-center gap-3 mb-2">
  <Clock className="w-6 h-6 text-violet-400" />
  <h4 className="text-xl font-semibold text-violet-300">Jour -10 : Pause stratégique</h4>
</div>
<p className="text-gray-300 text-lg">
  À <strong>J-10</strong>, j’avais déjà terminé tout le <strong>learning path</strong>, les <strong>boxes HTB</strong> et l’intégralité de la <strong>playlist IppSec</strong>.<br/>
  Donc, j’ai décidé de vraiment lever le pied : <strong>3 à 4 jours complets</strong> de repos total.
</p>

{/* Importance du repos */}
<div className="flex items-center gap-2 mb-2">
  <Brain className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Le repos, c’est crucial</span>
</div>
<div className="bg-violet-900/20 rounded-lg p-4">
  <span className="text-gray-300">
    Je suis convaincu que <strong>se reposer est aussi important que charbonner</strong>.
    Ton cerveau a besoin de temps pour digérer et organiser tout ce que tu as appris.
  </span>
</div>

{/* Organisation, structuration finale */}
<div className="flex items-center gap-2 mb-2">
  <FileText className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Organisation & relecture des notes</span>
</div>
<p className="text-gray-300">
  Une fois reposé, j’ai passé le reste du temps à relire <strong>toutes mes notes</strong> et à les rendre plus propres et structurées dans <strong>Obsidian</strong>.
  J’ai tout organisé par phase du pentest, et je me suis assuré de pouvoir retrouver n’importe quelle technique ou commande rapidement si besoin.
</p>

{/* Dernière ligne droite */}
<div className="flex items-center gap-2 mb-2">
  <CheckCircle2 className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Dernière ligne droite</span>
</div>
<p className="text-gray-300">
  C’était mon unique focus sur ces 10 jours.<br/>
  Plus de labs, plus de boxes, plus de distractions.<br/>
  Juste affiner, rester calme et préparer le mental.
</p>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Outils, environnement & prise de notes */}
<section className="mb-16">
  <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
    <div className="flex items-center gap-3 mb-8">
      <Terminal className="w-8 h-8 text-violet-400" />
      <h2 className="text-3xl font-bold">Outils, environnement & prise de notes</h2>
    </div>
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Exegol : Mon environnement d’attaque
        </h3>
        {/* --- Bloc Exegol --- */}
<div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
{/* Exegol, le choix de l'environnement */}
<div className="flex items-center gap-3 mb-2">
  <Cpu className="w-6 h-6 text-violet-400" />
  <h4 className="text-xl font-semibold text-violet-300">Exegol : le top du toolkit offensif 🇫🇷</h4>
</div>
<p className="text-gray-300">
  Je le dis haut et fort : <strong>Exegol, c’est français. COCORICO 🇫🇷</strong><br  />
<div className="flex justify-center my-6">
  <img
    src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/oss117meme.webp"
    alt="Jack OSS 117 mauvais meme"
    className="rounded-2xl shadow-xl max-w-md"
  />
</div>
  Et Kali ? T’es <em>mauvais</em>, comme Jack dans OSS 117. 🕶️ Voilà, c’est dit.
</p>
<p className="text-gray-300">
  Blague à part, passer de Kali à Exegol a été l’une des meilleures décisions de ma prépa CPTS.
  <strong>Exegol, c’est un environnement offensif basé sur Docker</strong>, tout préinstallé, tout testé.
  Stable, léger, déployé en 2 secondes chrono — tu veux un environnement tout frais ? Boom, c’est prêt.
</p>
<p className="text-gray-300">
  J’ai utilisé Exegol comme <strong>mon principal environnement offensif</strong> tout au long du cursus et de l’examen.
  Mon setup : <strong>Arch Linux + Exegol</strong>. Performance, maîtrise, fiabilité.
</p>

{/* Outils clés dans Exegol */}
<div className="bg-violet-900/20 rounded-lg p-4">
  <Terminal className="w-5 h-5 text-violet-400 inline-block mb-1 mr-2" />
  <span className="font-semibold text-violet-400">Outils phares d’Exegol :</span>
  <ul className="list-disc ml-6 text-gray-300 mt-2 space-y-1">
    <li><strong>Ligolo-ng</strong> : Pour le tunneling et le pivoting sur des réseaux internes. Indispensable en lateral movement.</li>
    <li><strong>NetExec</strong> : Parfait pour le credential spraying, l’énumération SMB et la gestion des partages exposés.</li>
    <li><strong>FFuf</strong> : Fuzz web rapide et précis, pour l’énumération comme l’exploitation.</li>
    <li><strong>Burp Suite</strong> : Attaques web, contournement CSRF, inspection de cookies, PoC XSS.</li>
    <li><strong>BloodyAD</strong> : Enum AD simple, rapide, plus efficace que BloodHound dans plein de cas.</li>
    <li><strong>Impacket Tools</strong> : <code>secretsdump.py</code>, <code>smbexec.py</code>, <code>wmiexec.py</code> — indispensables sur Windows.</li>
    <li><strong>smbserver.py</strong> : Pour servir des payloads ou récupérer du loot pendant l’exam.</li>
    <li><strong>Nmap</strong> : Rapide, fiable, tous les scripts prêts dès le départ.</li>
  </ul>
</div>

  {/* Pourquoi Exegol est incontournable */}
<p className="text-gray-300">
  Ce qui fait la force d’Exegol : <strong>tu gagnes un temps fou</strong>.
  Pas d’install, pas de prise de tête. Tout est déjà configuré, prêt pour l’attaque.
  <span className="font-semibold text-violet-400">Quand t’es au cœur d’un exam CPTS de 10 jours, ça compte plus que tout.</span>
</p>

{/* Atouts majeurs Exegol */}
<div className="bg-violet-900/20 rounded-lg p-4">
  <span className="font-semibold text-violet-400">✨ Pourquoi je ne reviendrai jamais en arrière :</span>
  <ul className="list-disc ml-6 text-gray-300 mt-2 space-y-1">
    <li>Lancement en quelques secondes avec Docker, sans polluer ta machine hôte.</li>
    <li>Zero crash, aucun bug chelou de package — rien à voir avec Kali après chaque <code>apt upgrade</code>.</li>
    <li>Structure parfaite pour prise de notes, screenshots, hébergement de payloads et logs.</li>
    <li>Ça fait pro, pas “distro de hobbyiste”.</li>
  </ul>
</div>

  <p className="text-gray-300">
  Et au cas où tu l’aurais raté : <strong>c’est français 🇫🇷</strong>.<br/>
  Si tu veux voir le détail du setup, du workflow et pourquoi je ne reviendrai jamais sur Kali, lis mon article :<br />
  <a
    href="https://trxtxbook.com/articles/exegol-docker"
    target="_blank"
    rel="noopener noreferrer"
    className="text-violet-400 underline hover:text-violet-300"
  >
    Exegol : Le toolkit ultime pour la CPTS
  </a>
  .
</p>
</div>

{/* --- Bloc Obsidian & SysReptor --- */}
<div className="mt-10">
  <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
    <FileText className="w-6 h-6" />
    SysReptor & Obsidian pour la prise de notes et le reporting
  </h3>
  <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
    {/* Obsidian */}
    <div>
      <h4 className="text-xl font-semibold text-violet-300 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-violet-400" /> Obsidian : mon espace de connaissance personnel
      </h4>
      <p className="text-gray-300">
        <strong>Obsidian</strong> a été mon outil central pour gérer tout mon savoir pendant la préparation de la CPTS.
        Chaque commande, chaque CVE, chaque technique était documentée, expliquée et classée correctement.
      </p>
      <p className="text-gray-300">Voici une version simplifiée de l’arborescence que j’utilise dans Obsidian :</p>
      <details className="group bg-[#2a2a2f] rounded-lg p-4 text-white open:ring-1 open:ring-violet-600 transition-all">
        <summary className="cursor-pointer text-violet-400 font-semibold text-lg mb-2">
           Clique ici pour voir toute la structure d’arborescence Obsidian
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
        <span className="font-semibold text-violet-400">Mon conseil :</span> <br />
        Crée ton propre système de prise de notes structuré.<br />
        Ça améliore la mémorisation et te donne un vrai support de référence le jour de l’examen.<br />
        <span className="block">Organiser ses idées tout au long de l’apprentissage, ça fait la différence sous pression.</span>
      </p>
    </div>


    {/* SysReptor */}
<div>
  <h4 className="text-xl font-semibold text-violet-300 flex items-center gap-2 mt-8">
    <Network className="w-5 h-5 text-violet-400" /> SysReptor : l’arme ultime pour le reporting
  </h4>
  <p className="text-gray-300">
    Pour la remise du rapport final, j’ai utilisé <strong>SysReptor</strong>.<br/>
    C’est la plateforme de reporting développée par HTB, qui rend la rédaction fluide et professionnelle.
  </p>
  <p className="text-gray-300">
    Ce que j’ai le plus apprécié : le <strong>workflow de reporting très structuré</strong>.<br/>
    Chaque vulnérabilité devient une “Finding” dédiée, avec sévérité, impact, étapes de reproduction, captures d’écran et recommandations.<br/>
    Résultat : cohérence et clarté sur l’ensemble de mon <strong>rapport de 190 pages</strong>.
  </p>
  <p className="text-gray-300">Voici à quoi ressemblait la structure type de mon rapport SysReptor :</p>
  <ul className="list-disc ml-6 text-gray-300 text-sm space-y-1">
    <li><strong>Walkthrough :</strong> Étapes chronologiques de l’attaque, phase par phase</li>
    <li><strong>Findings :</strong> Chaque vulnérabilité en détail (IDOR, SSRF, SQLi...)</li>
    <li><strong>Flags :</strong> Liste des flags, comment ils ont été récupérés</li>
    <li><strong>Recommendations :</strong> Conseils clairs et pros pour chaque faille</li>
  </ul>
  <p className="text-gray-300">
    J’ai rempli SysReptor en temps réel pendant l’examen, avec la <strong>méthode “trigger-based”</strong> : à chaque découverte ou étape franchie, je documentais tout de suite. Aucun rush de rédaction à la fin.
  </p>
  <div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2 mt-4">
    <CheckCircle2 className="w-5 h-5 text-violet-400" />
    <span className="text-gray-300">
      <strong>Conseil final :</strong> Obsidian, c’est pour toi ; SysReptor, c’est pour HTB.<br />
      Garde les deux propres, synthétiques et bien structurés.
    </span>
  </div>
</div>

  </div>
</div>
        </div>
      </div>
    </div>
  </section>

  {/* Semaine d’examen */}
<section className="mb-16">
  <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
    <div className="flex items-center gap-3 mb-8">
      <Clock className="w-8 h-8 text-violet-400" />
      <h2 className="text-3xl font-bold">Semaine d’examen</h2>
    </div>
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <Target className="w-6 h-6" />
          Format & périmètre de l’examen
        </h3>
       <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
{/* Aperçu de l’examen CPTS */}
<div className="flex items-center gap-3 mb-2">
  <Shield className="w-6 h-6 text-violet-400" />
  <h4 className="text-xl font-semibold text-violet-300">Examen CPTS : l’expérience la plus proche d’un vrai pentest</h4>
</div>
<p className="text-gray-300 text-lg">
  L’examen CPTS simule une <strong>vraie mission offensive</strong> contre une entreprise fictive.
  Je ne peux pas donner trop de détails (HTB oblige), mais je peux l’affirmer :<br/>
  <strong>C’est ce qui se rapproche le plus d’un vrai pentest en certification.</strong>
</p>

{/* Scénario et mission */}
<div className="flex items-center gap-2 mb-2">
  <Terminal className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Le scénario d’engagement</span>
</div>
<p className="text-gray-300">
  Dès le début, tu reçois un périmètre précis via une lettre d’engagement — comme dans un vrai mandat red team.
  Le point d’entrée initial est une webapp exposée.<br/>
  Ta mission : <strong>compromettre entièrement deux domaines Active Directory distincts</strong> (oui, deux !) et capturer au moins <strong>12 flags sur 14</strong> à travers l’infra.
</p>

{/* Réalisme et taille du réseau */}
<div className="flex items-center gap-2 mb-2">
  <Network className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Un réseau réaliste et segmenté</span>
</div>
<p className="text-gray-300">
  Le réseau est <strong>vaste et crédible</strong> : machines Windows & Linux, segmentation, pivots obligatoires.
  Le double pivot est indispensable ; des outils comme <strong>Ligolo-ng</strong> deviennent essentiels.
</p>

{/* Vulnérabilités et complexité */}
<div className="flex items-center gap-2 mb-2">
  <ListChecks className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Vulnérabilités & méthodologie</span>
</div>
<p className="text-gray-300">
  Les vulnérabilités ne sont ni exotiques ni hyper avancées : tout est abordé dans le learning path CPTS.<br/>
  Mais <strong>l’ampleur et la densité</strong> peuvent te perdre.
  Il n’y a pas de vrais “rabbit holes” comme dans les boxes Hard/Insane, mais l’environnement est tellement vaste qu’on peut perdre des heures si on n’est pas pragmatique.
</p>

{/* Gestion du temps et mentalité */}
<div className="flex items-center gap-2 mb-2">
  <Clock className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Gestion du temps & mentalité</span>
</div>
<p className="text-gray-300">
  L’examen dure <strong>10 jours complets</strong>. J’ai bossé en moyenne <strong>7h par jour</strong>.<br/>
  Prépare-toi à être bloqué : il m’est arrivé de rester coincé plus d’une journée.
  Dans ces cas-là, il faut prendre du recul, relancer l’énumération et réfléchir autrement.<br/>
  Il faut vraiment adopter la mentalité d’un attaquant. <strong>Créativité et adaptabilité</strong> comptent autant que la technique pure.
</p>


  {/* Conseils de réussite */}
<div className="flex items-center gap-2 mb-2">
  <Brain className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Pour réussir</span>
</div>
<div className="bg-violet-900/20 rounded-lg p-4">
  <span className="text-gray-300">
    Le learning path te prépare <strong>parfaitement</strong> — mais ne te repose pas sur l’automatisation ou sur une vision trop tunnel.<br />
    <span className="font-semibold text-violet-400">Pense comme un attaquant. Déplace-toi latéralement. Reste focus. Sois méthodique.</span>
  </span>
</div>

{/* Rapport et reporting */}
<div className="flex items-center gap-2 mb-2">
  <FileText className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Reporting</span>
</div>
<p className="text-gray-300">
  Pour le rapport, j’ai utilisé <strong>SysReptor</strong> et tout exporté en PDF propre et pro.<br />
  Je recommande vivement cette méthode : c’est clean, professionnel, et ça colle aux attentes de HTB.<br />
  Tu peux ajouter des annexes avec des preuves techniques comme un <strong>dump DC complet ou une analyse de politique de mot de passe (type DPAT)</strong> si c’est pertinent.
</p>
</div>
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Déroulé journalier
        </h3>
        <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
{/* Départ méthodo et première erreur */}
<div className="flex items-center gap-3 mb-2">
  <FileText className="w-6 h-6 text-violet-400" />
  <h4 className="text-xl font-semibold text-violet-300">Habitudes de reporting : à ne pas faire</h4>
</div>
<p className="text-gray-300 text-lg">
  Je suis arrivé à l’examen <strong>très bien préparé</strong>, avec une méthodologie solide et des bons réflexes… enfin, c’est ce que je croyais.<br/>
  Le <strong>premier jour</strong>, je me suis promis de tout documenter dans SysReptor <strong>chaque soir</strong>.<br/>
  <span className="text-red-400 font-semibold">❌ Grosse erreur.</span>
</p>


  {/* La vraie méthode qui marche */}
<div className="flex items-center gap-2 mb-2">
  <ListChecks className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">La méthode trigger-based en temps réel</span>
</div>
<div className="bg-violet-900/20 rounded-lg p-4">
  <span className="text-gray-300">
    Ce qui fonctionne vraiment, c’est l’approche <strong>“trigger-based” en temps réel</strong> : à chaque découverte (port, user, accès initial, flag…), prends quelques secondes pour le documenter <em>immédiatement</em>.<br/>
    <span className="block mt-1 font-semibold text-violet-400">RÉDIGE TON RAPPORT EN TEMPS RÉEL.</span>
  </span>
</div>

{/* ChatGPT pour accélérer la rédaction */}
<div className="flex items-center gap-2 mb-2">
  <Zap className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Bien utiliser ChatGPT</span>
</div>
<p className="text-gray-300">
  💡 Oui, j’ai utilisé <strong>ChatGPT</strong> pour gagner du temps sur certaines parties (surtout l’impact ou la mitigation),  
  mais j’ai toujours <strong>relu et réécrit tout</strong> pour que ça colle à mon style et à mes findings.
</p>

{/* Retour d’expérience sur le déroulé des flags */}
<div className="flex items-center gap-2 mb-2">
  <Brain className="w-6 h-6 text-violet-400" />
  <span className="text-xl font-semibold text-violet-300">Progression & mental</span>
</div>
<p className="text-gray-300">
  Côté progression : les premiers jours, tout s’est enchaîné vite — j’ai eu un bon accès de départ et j’ai avancé jusqu’au <strong>flag 9</strong> sans accroc.
  Ensuite, c’est devenu plus compliqué. Ce qui m’a sauvé, c’est de prendre du recul, <strong>re-énumérer</strong>, tout reposer à plat pour trouver ce qui bloquait.
</p>
<p className="text-gray-300">
  Même chose avec le <strong>flag 12</strong>. Aucun problème à devoir revenir en arrière pour avancer.  
  Le contenu est dense, et c’est stressant d’avoir seulement 9 flags à X jours.  
  <span className="font-semibold text-violet-400">Ne panique pas : reste calme, réfléchis posément, continue d’avancer.</span>
</p>
</div>
      </div>
    </div>
  </div>
</section>

{/* Le rapport de 190 pages */}
<section className="mb-16">
  <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
    <div className="flex items-center gap-3 mb-8">
      <FileText className="w-8 h-8 text-violet-400" />
      <h2 className="text-3xl font-bold">Le rapport de 190 pages</h2>
    </div>
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Stratégie de reporting en temps réel
        </h3>
        {/* --- Bloc : Workflow de reporting en temps réel --- */}
<div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
  <div className="flex items-center gap-3 mb-2">
    <FileText className="w-6 h-6 text-violet-400" />
    <h4 className="text-xl font-semibold text-violet-300">Workflow de reporting en temps réel</h4>
  </div>
  <p className="text-gray-300">
    Pendant l’examen CPTS, j’avais prévu au départ de rédiger le rapport chaque soir. <strong>Grosse erreur.</strong><br/>
    Avec la fatigue mentale et l’envie de garder le rythme, ça ne tenait pas sur la durée.
    J’ai donc décidé d’appliquer un <strong>workflow de reporting en temps réel</strong>, et ça a tout changé.
  </p>

  <div className="flex items-center gap-2 mb-2">
    <ListChecks className="w-5 h-5 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Stratégie “trigger-based”</span>
  </div>
  <p className="text-gray-300">
    Dès que je découvrais un élément important (nouveau service, credentials, shell…),  
    je le documentais immédiatement dans <strong>SysReptor</strong> et prenais en parallèle des notes dans <strong>Obsidian</strong>.<br/>
    Résultat : tout restait frais, plus besoin de revenir farfouiller dans une montagne de logs.
  </p>
  <p className="text-gray-300">
    Par exemple, après avoir compromis un utilisateur et accédé à un dossier partagé,  
    j’ouvrais SysReptor, créais un <strong>Finding</strong>, reliais le service vulnérable, ajoutais les étapes et la capture d’écran.  
    Pas de “je le ferai plus tard”. Ça permet d’avancer l’esprit tranquille.
  </p>

  <div className="flex items-center gap-2 mb-2">
    <BookOpen className="w-5 h-5 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Timeline & tags</span>
  </div>
  <p className="text-gray-300">
    Chaque note dans Obsidian était liée à ma timeline.<br/>
    J’utilisais des tags comme <code>#flag9</code>, <code>#pivot</code>, <code>#user-compromise</code> pour suivre l’avancement,  
    et la vue “graph” pour reconnecter les idées quand j’étais bloqué.
  </p>

  <div className="flex items-center gap-2 mb-2">
    <CheckCircle2 className="w-5 h-5 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">Débloquer les situations</span>
  </div>
  <p className="text-gray-300">
    Cette méthode m’a vraiment <strong>aidé à sortir des blocages</strong> (Flag 9, Flag 12).
    Quand j’étais coincé, je revenais sur les anciennes notes, trouvais ce que j’avais raté et ça débloquait la suite.<br/>
    Sans ce système, je me serais perdu dans la complexité du réseau interne.
  </p>

  <div className="flex items-center gap-2 mb-2">
    <Zap className="w-5 h-5 text-violet-400" />
    <span className="text-xl font-semibold text-violet-300">L’IA comme copilote</span>
  </div>
  <p className="text-gray-300">
    <strong>N’hésite pas à utiliser ChatGPT</strong> comme copilote — mais vérifie toujours ce que ça sort.
    Je m’en suis surtout servi pour reformuler des étapes techniques ou pour donner un ton neutre à certaines parties du rapport.
  </p>
</div>


{/* --- Bloc : Walkthroughs vs. Findings --- */}
<div className="mt-10">
  <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
    <Code className="w-6 h-6" />
    Walkthrough vs. Findings
  </h3>
  <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
    {/* Définition Walkthrough */}
    <div className="flex items-center gap-2 mb-2">
      <FileText className="w-5 h-5 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">Walkthrough</span>
    </div>
    <p className="text-gray-300">
      Le <strong>walkthrough</strong>, ce n’est pas juste ton exploitation interne.
      C’est un guide étape par étape complet, qui doit permettre au relecteur de **reproduire tout le chemin d’attaque** —
      depuis l’interface web initiale jusqu’à la compromission complète des domaines.
    </p>
    <p className="text-gray-300">
      Considère-le comme un <strong>replay technique</strong> de ton opération, le plus simple et direct possible.
      Pas de justifications, pas de théorie : uniquement des actions, classées logiquement.<br/>
      Il doit tout couvrir : surface d’attaque initiale, déplacement latéral, élévation de privilèges, exploitation de la confiance, pivot externe.
    </p>
    <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-700/30">
      <h4 className="text-violet-400 text-xl font-semibold mb-3">✅ Exemple de contenu Walkthrough</h4>
      <ul className="list-disc list-inside text-white space-y-2">
        <li>Page de login trouvée sur <code>/admin</code> → brute-force → credentials valides trouvés.</li>
        <li>Connexion, LFI via injection de logs → escalade en RCE.</li>
        <li>Shell inversé obtenu en tant que <code>www-data</code> → énumération utilisateurs → pivot sur une machine interne.</li>
        <li>Compte AD compromis par abus de token → escalade en Domain Admin.</li>
      </ul>
    </div>
    {/* Définition Findings */}
    <div className="flex items-center gap-2 mb-2 mt-6">
      <FileText className="w-5 h-5 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">Findings</span>
    </div>
    <p className="text-gray-300">
      C’est là que tu dois montrer ta compréhension en sécurité.
      Chaque finding est l’occasion de prouver que tu comprends les vulnérabilités, leur cause, leur impact, et les mesures à prendre.
      Parfois, une vulnérabilité unique amène plusieurs findings (ex. : politique de mot de passe faible révélée après une faille web).
    </p>
    <ul className="list-disc list-inside text-white space-y-2">
      <li><strong>Titre :</strong> court et impactant (ex : “Stockage de mots de passe non sécurisé sur l’application interne”)</li>
      <li><strong>Résumé :</strong> ce qui est affecté, comment, et pourquoi c’est important</li>
      <li><strong>Détails techniques :</strong> captures, payloads, étapes, outputs d’outils</li>
      <li><strong>Analyse de risque :</strong> raisonnement à la CVSS ou ton propre avis</li>
      <li><strong>Remédiation :</strong> conseils clairs, exploitables immédiatement</li>
    </ul>
    <p className="text-gray-300">
      Ces deux parties — walkthrough et findings — sont fondamentalement différentes.
      Le walkthrough est factuel et linéaire, les findings sont analytiques et structurés. Ne mélange pas les deux.
      Si tu respectes cette distinction, ton rapport sera clair, puissant et pro.
    </p>
  </div>
</div>

{/* --- Bloc : Ce que j’ai inclus & pourquoi --- */}
<div className="mt-10">
  <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
    <Lightbulb className="w-6 h-6" />
    Ce que j’ai inclus & pourquoi
  </h3>
  <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
    {/* Esprit */}
    <div className="flex items-center gap-2 mb-2">
      <BookOpen className="w-5 h-5 text-violet-400" />
      <span className="text-xl font-semibold text-violet-300">État d’esprit : une certif, pas juste un rapport</span>
    </div>
    <p className="text-gray-300">
      Ce n’est pas juste un rapport : c’est un examen de certification.<br/>
      Tu dois prouver tes compétences techniques **et** ta capacité à <strong>documenter un pentest au plus haut niveau pro</strong>.
    </p>
    {/* Pertinence max */}
    <h4 className="text-lg font-semibold text-violet-400">Tout montrer (mais que ce qui compte)</h4>
    <p className="text-gray-300">
      Ton but : <strong>pertinence maximale, détails maximum, zéro bruit</strong>.<br/>
      Chaque finding était écrit avec une extrême précision.<br/>
      J’ai relu chaque section <strong>plusieurs fois</strong> pour m’assurer qu’elle apportait quelque chose,
      pouvait être comprise seule, et racontait un chemin d’attaque cohérent.<br/>
      <em>Est-ce que ça aiderait la Blue Team à comprendre ce qui s’est passé ? Si non, je retire.</em>
    </p>
    {/* Sanitize */}
    <h4 className="text-lg font-semibold text-violet-400">🔐 Tout anonymiser / nettoyer</h4>
    <p className="text-gray-300">
      <strong>C’est un rapport de sécurité. Ne l’oublie jamais.</strong><br/>
      Même dans un lab, traite-le comme une vraie mission client :
    </p>
    <ul className="list-disc pl-6 text-gray-300">
      <li>Hashes : 🔒 <strong>anonymisés</strong></li>
      <li>Identifiants internes : 🔒 <strong>anonymisés</strong></li>
      <li>IPs/domaines internes : 🔒 <strong>anonymisés</strong></li>
      <li>Mots de passe : 🔒 <strong>anonymisés ou masqués</strong></li>
      <li>Captures d’écran : 🔒 <strong>floutées ou caviardées</strong></li>
    </ul>
    <p className="text-gray-300">
      ⚠️ Un rapport qui fuite ne doit jamais aider un attaquant à reproduire la compromission. Montre que tu as compris la notion de <strong>responsabilité</strong> dans le reporting.
    </p>
    {/* Lien findings/walkthrough */}
    <h4 className="text-lg font-semibold text-violet-400">Walkthrough clair, findings liés</h4>
    <p className="text-gray-300">
      Mon walkthrough était un <strong>récit étape par étape</strong>, du premier scan à la compromission totale de l’AD.<br/>
      À chaque point clé, je mettais des liens directs vers les <strong>findings</strong> concernés pour naviguer facilement.
      Cette structure rendait le doc accessible autant pour les profils techniques que non techniques.
    </p>
    {/* Pivoting */}
    <h4 className="text-lg font-semibold text-violet-400">Pivot & lisibilité</h4>
    <p className="text-gray-300">
      Le pivot interne, c’est <strong>un des points les plus durs</strong>.<br/>
      J’ai documenté chaque pivot (Ligolo-ng, tunnels, routes) clairement, avec :
    </p>
    <ul className="list-disc pl-6 text-gray-300">
      <li>Schémas quand nécessaire</li>
      <li>Petits extraits de config réseau</li>
      <li>Tableaux de suivi de l’avancement</li>
    </ul>
    <p className="text-gray-300">
      L’objectif : <strong>n’importe quel analyste peut rejouer tout le chemin d’attaque</strong> sans poser de questions.
    </p>
    {/* DPAT */}
    <h4 className="text-lg font-semibold text-violet-400">En bonus : Audit de mots de passe (DPAT)</h4>
    <p className="text-gray-300">
      Si tu arrives à dumper le DC, lance un <strong>audit de mots de passe façon DPAT</strong>.<br/>
      J’ai inclus les résultats anonymisés dans un ZIP joint au PDF du rapport :  
      c’est excellent pour montrer l’analyse post-exploitation, les faiblesses de politique et le risque réel.
    </p>
    {/* Audience */}
    <h4 className="text-lg font-semibold text-violet-400">Adapter au public</h4>
    <p className="text-gray-300">
      J’ai adapté le ton et la structure selon la partie :
    </p>
    <ul className="list-disc pl-6 text-gray-300">
      <li><strong>Walkthrough / Findings</strong> : technique, précis</li>
      <li><strong>Résumé et recommandations</strong> : vulgarisé, focus sur l’impact</li>
    </ul>
    <p className="text-gray-300">
      Ça montre que tu sais communiquer avec <strong>des profils techniques et non techniques</strong>.
    </p>
    {/* Conclusion */}
    <h4 className="text-lg font-semibold text-violet-400">Derniers mots</h4>
    <p className="text-gray-300">
      Il ne s’agit pas d’étaler sa technique.<br/>
      Le but, c’est de livrer un rapport <strong>reproductible</strong>, <strong>pro</strong> et <strong>sécure</strong>.<br/>
      Sois rigoureux, clair, et garde en tête la responsabilité qui va avec cette connaissance.<br/>
      <strong>Et encore une fois : anonymise tout. Toujours.</strong>
    </p>
  </div>
</div>


  
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