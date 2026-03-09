import React from 'react';
import { FileText, Clock, ListChecks, BookOpen, CheckCircle2, Zap, Code, Lightbulb } from 'lucide-react';

export const ReportSection: React.FC = () => (
  <section className="mb-16">
    <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-8 h-8 text-violet-400" />
        <h2 className="text-3xl font-bold">Le rapport de 190 pages</h2>
      </div>
      <div className="space-y-8">

        {/* Stratégie de reporting en temps réel */}
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Stratégie de reporting en temps réel
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">

            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-violet-400" />
              <h4 className="text-xl font-semibold text-violet-300">Workflow de reporting en temps réel</h4>
            </div>
            <p className="text-gray-300">
              Pendant mon examen CPTS, j'avais prévu d'écrire le rapport chaque soir. <strong>Grosse erreur.</strong>
              Avec la fatigue mentale et le besoin de maintenir l'élan, ça est rapidement devenu insoutenable.
              C'est là que j'ai décidé d'appliquer un <strong>workflow de reporting en temps réel</strong>, et ça a fait une énorme différence.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="w-5 h-5 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Stratégie trigger-based</span>
            </div>
            <p className="text-gray-300">
              Dès que je découvrais quelque chose de pertinent (nouveau service, identifiants, shell…),
              je le documentais immédiatement dans <strong>SysReptor</strong> et prenais des notes de support dans <strong>Obsidian</strong>.
              Tout restait frais — jamais besoin de remonter dans une montagne de logs.
            </p>
            <p className="text-gray-300">
              Par exemple, après avoir compromis un utilisateur et accédé à un dossier partagé,
              j'ouvrais SysReptor, créais un <strong>Finding</strong>, liait le service vulnérable, insérait les étapes et ajoutait le screenshot.
              Pas de "je le ferai plus tard". J'avançais avec l'esprit libre.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Timeline & Tags</span>
            </div>
            <p className="text-gray-300">
              Chaque note dans Obsidian était liée à ma timeline.
              J'utilisais des tags comme <code>#flag9</code>, <code>#pivot</code>, <code>#user-compromise</code> pour suivre ma progression et la vue graphique pour reconnecter les idées quand j'étais bloqué.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Débloquer les blocages</span>
            </div>
            <p className="text-gray-300">
              Cette approche m'a aidé à <strong>surmonter les blocages</strong> (Flag 9, Flag 12).
              Quand j'étais bloqué, je revisitais mes notes précédentes, repérais ce que j'avais manqué, et débloquais le chemin.
              Sans ce système, j'aurais été perdu dans la complexité du réseau interne.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">L'IA comme assistant</span>
            </div>
            <p className="text-gray-300">
              <strong>N'hésite pas à utiliser ChatGPT</strong> comme assistant — mais vérifie toujours ses outputs.
              Je l'ai utilisé principalement pour reformuler des étapes techniques avec clarté et pour rédiger un langage neutre dans le rapport.
            </p>
          </div>
        </div>

        {/* Walkthrough vs Findings */}
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Code className="w-6 h-6" />
            Walkthrough vs. Findings
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">

            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Walkthrough</span>
            </div>
            <p className="text-gray-300">
              Le <strong>walkthrough</strong> n'est pas juste ton exploitation interne.
              C'est un guide complet étape par étape qui doit permettre à ton évaluateur de reproduire entièrement le chemin d'attaque —
              de l'interface web initiale à la compromission totale du domaine.
            </p>
            <p className="text-gray-300">
              Pense-y comme un <strong>replay technique</strong> de ton opération, aussi direct et clair que possible.
              Pas de justifications, pas de théorie — juste des actions, ordonnées logiquement.
              Ça doit tout couvrir : surface d'attaque initiale, mouvement latéral, escalade, exploitation de trusts, pivoting externe.
            </p>
            <div className="bg-violet-900/20 rounded-lg p-4 border border-violet-700/30">
              <h4 className="text-violet-400 text-xl font-semibold mb-3">✅ Exemple de contenu de Walkthrough</h4>
              <ul className="list-disc list-inside text-white space-y-2">
                <li>Page de login identifiée à <code>/admin</code> → brute force de login → identifiants valides trouvés.</li>
                <li>Connecté, LFI trouvée via injection de log → escalade vers RCE.</li>
                <li>Reverse shell obtenu en tant que <code>www-data</code> → énumération des utilisateurs → pivot vers l'hôte interne.</li>
                <li>Utilisateur AD compromis via token abuse → escalade vers Domain Admin.</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 mb-2 mt-6">
              <FileText className="w-5 h-5 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Findings</span>
            </div>
            <p className="text-gray-300">
              C'est là que ton cerveau infosec brille.
              Chaque finding est ta chance de démontrer ta compréhension des vulnérabilités, de leurs causes racines, impacts et remédiation.
              Parfois, une seule vulnérabilité mène à plusieurs findings (ex: politique de mots de passe faible après vuln web).
            </p>
            <ul className="list-disc list-inside text-white space-y-2">
              <li><strong>Titre :</strong> court et percutant (ex: "Stockage de mots de passe non sécurisé sur l'application interne").</li>
              <li><strong>Résumé :</strong> ce qui est affecté, comment, et pourquoi c'est important.</li>
              <li><strong>Détails techniques :</strong> screenshots, payloads, étapes, sortie des outils.</li>
              <li><strong>Analyse de risque :</strong> raisonnement style CVSS ou ta propre évaluation.</li>
              <li><strong>Remédiation :</strong> suggestions claires et actionnables.</li>
            </ul>
            <p className="text-gray-300">
              Ces deux sections — walkthrough et findings — sont fondamentalement différentes.
              Le walkthrough est factuel et linéaire, les findings sont analytiques et structurés. Ne les mélange pas.
              Respecte leur intention et ton rapport sera puissant, clair et professionnel.
            </p>
          </div>
        </div>

        {/* Ce que j'ai inclus & Pourquoi */}
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            Ce que j'ai inclus & Pourquoi
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">

            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Mentalité : Certification, pas juste un rapport</span>
            </div>
            <p className="text-gray-300">
              Ce n'est pas juste un rapport — c'est un examen de certification.
              Tu ne démontres pas seulement des compétences techniques, mais aussi ta capacité à <strong>documenter un pentest au plus haut standard professionnel</strong>.
            </p>

            <h4 className="text-lg font-semibold text-violet-400">Tout montrer (mais seulement ce qui compte)</h4>
            <p className="text-gray-300">
              Ton objectif : <strong>pertinence maximale, détail maximal, zéro bruit</strong>.
              Chaque finding a été rédigé avec une précision extrême.
              J'ai relu chaque section <strong>plusieurs fois</strong> pour m'assurer qu'elle contribuait de façon significative,
              pouvait être comprise de façon autonome, et peignait un récit d'attaque clair.
              <br /><em>Est-ce que ça aiderait la Blue Team à comprendre ce qui s'est passé ? Sinon, supprime-le.</em>
            </p>

            <h4 className="text-lg font-semibold text-violet-400">🔐 Tout anonymiser</h4>
            <p className="text-gray-300">
              <strong>C'est un rapport de sécurité. Ne l'oublie jamais.</strong>
              Même dans un lab, traite-le comme une vraie mission client :
            </p>
            <ul className="list-disc pl-6 text-gray-300">
              <li>Hashes : 🔒 <strong>anonymisés</strong></li>
              <li>Noms d'utilisateurs internes : 🔒 <strong>anonymisés</strong></li>
              <li>IPs/domaines internes : 🔒 <strong>anonymisés</strong></li>
              <li>Mots de passe : 🔒 <strong>anonymisés ou masqués</strong></li>
              <li>Screenshots : 🔒 <strong>floutés ou caviardés</strong></li>
            </ul>
            <p className="text-gray-300">
              ⚠️ Un rapport fuité ne devrait pas aider un attaquant à reproduire la compromission. Prouve que tu comprends la <strong>responsabilité</strong> du reporting.
            </p>

            <h4 className="text-lg font-semibold text-violet-400">Walkthrough clair, lié aux Findings</h4>
            <p className="text-gray-300">
              Mon walkthrough était un <strong>récit étape par étape</strong>, du premier scan à la compromission AD complète.
              À chaque point pertinent, j'incluais des liens directs vers les <strong>Findings</strong> correspondants pour faciliter la navigation.
              Cette structure rendait le document plus accessible aux lecteurs techniques et non-techniques.
            </p>

            <h4 className="text-lg font-semibold text-violet-400">Pivoting & Visibilité</h4>
            <p className="text-gray-300">
              Le pivoting interne est <strong>l'une des parties les plus difficiles</strong>.
              J'ai documenté chaque pivot (Ligolo-ng, tunnels, routes) clairement, avec :
            </p>
            <ul className="list-disc pl-6 text-gray-300">
              <li>Des schémas quand nécessaire</li>
              <li>De courts blocs de code pour la configuration des interfaces</li>
              <li>Des tableaux pour suivre la progression des accès</li>
            </ul>
            <p className="text-gray-300">
              L'objectif : <strong>n'importe quelle personne compétente peut reproduire ton chemin d'attaque</strong> sans poser de questions.
            </p>

            <h4 className="text-lg font-semibold text-violet-400">Bonus : Audit de mots de passe (DPAT)</h4>
            <p className="text-gray-300">
              Si tu réussis à dumper le DC, effectue un <strong>audit de mots de passe style DPAT</strong>.
              J'ai inclus des résultats anonymisés dans un ZIP avec le rapport PDF :
              super pour montrer l'analyse post-exploitation, les politiques faibles et le risque réel.
            </p>

            <h4 className="text-lg font-semibold text-violet-400">Adapté à l'audience</h4>
            <p className="text-gray-300">
              J'ai adapté le ton et la structure par section :
            </p>
            <ul className="list-disc pl-6 text-gray-300">
              <li><strong>Walkthrough / Findings</strong> : très technique, précis</li>
              <li><strong>Vue d'ensemble & Recommandations</strong> : accessible, axé sur l'impact</li>
            </ul>
            <p className="text-gray-300">
              Ça montre que tu peux communiquer avec <strong>les parties prenantes techniques et non-techniques</strong>.
            </p>

            <h4 className="text-lg font-semibold text-violet-400">Derniers mots</h4>
            <p className="text-gray-300">
              Ce n'est pas une question de se vanter.
              C'est livrer un rapport de pentest <strong>reproductible</strong>, <strong>professionnel</strong> et <strong>sécurisé</strong>.
              <br />
              Sois rigoureux, clair, et respectueux de la responsabilité qui vient avec cette connaissance.
              <br /><strong>Et encore une fois : Tout anonymiser. Toujours.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
