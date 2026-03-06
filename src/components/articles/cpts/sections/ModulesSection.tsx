import React from 'react';
import { Cpu, BookOpen, Brain, Monitor, ListChecks, FileText, CheckCircle2, Network } from 'lucide-react';

export const ModulesSection: React.FC = () => (
  <section className="mb-16">
    <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
      <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
        <Cpu className="w-6 h-6" />
        Aborder les 28 MODULES de la CPTS
      </h3>
      
      <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
        {/* Vue d'ensemble du parcours */}
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-violet-400" />
          <h4 className="text-xl font-semibold text-violet-300">Le parcours : 3 à 4 mois de montée en compétences</h4>
        </div>
        <p className="text-gray-300 text-lg">
          J’ai passé environ <strong>3 à 4 mois</strong> sur l’ensemble du <strong>learning path Penetration Tester</strong> de Hack The Box.
          Je n’ai pas cherché à aller vite — j’ai abordé chaque module comme un mini-cours, parfois en revenant plusieurs fois sur un sujet jusqu’à bien le comprendre.
          Ce cursus est <strong>incroyablement riche</strong>, aussi bien sur l’aspect technique que dans sa pertinence réelle.
          Avec de la motivation, même en partant de zéro, tu peux boucler ce parcours et être prêt pour la CPTS.
          <span className="block font-semibold text-violet-400">La clé : régularité et patience.</span>
        </p>

        {/* Progressivité du learning path */}
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-violet-400" />
          <span className="text-xl font-semibold text-violet-300">Une structure progressive</span>
        </div>
        <p className="text-gray-300">
          Au début, les 28 modules peuvent faire peur, surtout si tu n’as jamais suivi de formation structurée en cybersécurité.
          Mais le cheminement est <strong>progressif</strong> : les premiers modules posent les bases, et chaque étape ajoute en complexité et en réalisme.
          Plus tu avances, plus ton état d’esprit évolue : tu ne penses plus comme un étudiant, mais comme un pentester.
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
          <span className="text-xl font-semibold text-violet-300">Exemple : les notes comme checklist</span>
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
            <li><strong>Attacking Enterprise Networks</strong> : Un <span className="font-semibold">mini-exam CPTS</span>. Long, ultra détaillé, très proche du format réel. Aucun walkthrough, zéro indice : c’est le test ultime. On enchaîne énumération, privesc, pivot, mouvement latéral, reporting.</li>
            <li><strong>Penetration Testing Process</strong> : Donne le <span className="font-semibold">mindset et la méthodologie</span> pour tout le cursus. Idéal pour comprendre le “pourquoi” avant le “comment”.</li>
            <li><strong>Active Directory Enumeration & Attacks</strong> : Le module le plus <span className="font-semibold">complet et clair</span>. Permet de bâtir de vraies checklists et de passer à l’action sur AD — outils, mais aussi logique.</li>
            <li><strong>Documentation and Reporting</strong> : <span className="font-semibold">Crucial pour l’exam</span>. Format, ton, attentes sur le rapport. C’est ce module qui m’a permis de structurer mon rapport CPTS sous <strong>SysReptor</strong>.</li>
            <li><strong>Command Injection</strong> & <strong>SQLi</strong> : Super équilibre entre théorie et pratique : payloads, contournements, beaucoup d’entraînement sur des box.</li>
          </ul>
        </div>

        {/* Modules moins marquants */}
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-6 h-6 text-violet-400" />
          <span className="text-xl font-semibold text-violet-300">Modules moins marquants</span>
        </div>
        <div className="bg-violet-900/20 rounded-lg p-4">
          <ul className="list-disc ml-6 text-gray-300 space-y-1">
            <li><strong>Password Attacks</strong> : Important mais trop passif — beaucoup d’attente, assez peu formateur au final.</li>
            <li><strong>Shells & Payloads</strong> : <span className="font-semibold">Mal intégré</span>. Notions dispersées, mieux traité ailleurs.</li>
            <li><strong>Linux Privilege Escalation</strong> : Bons exemples mais manque de <span className="font-semibold">méthodologie</span>. Je l’ai complété avec des ressources CTF, PEASS et g0tmi1k.</li>
            <li><strong>Vulnerability Assessment</strong> : Un peu sec — pose les bases mais pas très poussé. Pas mauvais, juste pas passionnant.</li>
          </ul>
        </div>

        {/* Tarif */}
        <div className="flex items-center gap-2 mb-2">
          <Network className="w-6 h-6 text-violet-400" />
          <span className="text-xl font-semibold text-violet-300">Tarif & rapport qualité/prix</span>
        </div>
        <p className="text-gray-300">
          Même les modules un peu moins marquants restent <strong>solides</strong>. HTB ne bâcle rien et le tarif est vraiment honnête.
          J’ai choisi l’<strong>abonnement Silver HTB</strong> : <strong>410 €/an</strong> pour <strong>les 28 modules</strong>, labs, updates et <strong>voucher pour l’exam CPTS</strong>.
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
  </section>
);
