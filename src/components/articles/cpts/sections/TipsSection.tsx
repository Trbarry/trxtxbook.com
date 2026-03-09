import React from 'react';
import { Lightbulb, Target, Shield, Clock } from 'lucide-react';

export const TipsSection: React.FC = () => (
  <section className="mb-16">
    <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
      <div className="flex items-center gap-3 mb-8">
        <Lightbulb className="w-8 h-8 text-violet-400" />
        <h2 className="text-3xl font-bold">Tips & Tricks — Cheat-Sheet</h2>
      </div>
      <div className="space-y-8">

        {/* Énumération d'abord */}
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6" />
            L'énumération avant tout
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-gray-300 text-lg">
              <strong>L'énumération est la colonne vertébrale de l'examen CPTS.</strong> Le périmètre est intentionnellement large, et le vrai danger est de rater une surface d'attaque parce que tu as coupé des coins ronds trop tôt.
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li>
                <strong>Tout énumérer</strong> au départ : sous-réseaux, hôtes, services, partages et endpoints web — même s'ils semblent inutiles.
              </li>
              <li>
                <strong>Commencer large, puis affiner :</strong> Ne rien ignorer au début. Progressivement, éliminer les zones qui ne mènent nulle part (par ex. apps web non vulnérables ou sans rien d'intéressant).
              </li>
              <li>
                <strong>Nmap est ton meilleur ami :</strong> Toujours faire des scans larges, puis des scans ciblés au fur et à mesure des découvertes. Exemple : <span className="font-mono text-green-300">nmap -p- -A 10.10.0.0/16</span>
              </li>
              <li>
                <strong>Si tu es bloqué plus d'une journée,</strong> prends du recul et ré-énumère. Tu as probablement raté quelque chose de simple.
              </li>
              <li>
                <strong>Prendre des notes au fur et à mesure :</strong> Documenter chaque hôte, port ouvert et service intéressant — même les impasses.
              </li>
              <li>
                <strong>L'examen récompense le "rester simple" :</strong> Ne pas surcompliquer — la plupart des chemins sont directs si tu énumères correctement et gardes la tête froide.
              </li>
            </ul>
            <p className="text-gray-400 text-base italic mt-4">
              Mon approche : aller large, scanner agressivement, et ne se concentrer que là où tu obtiens des résultats. Si tu bloques, ré-énumère toujours. L'énumération représente 80% du travail — ne la sous-estime pas.
            </p>
          </div>
        </div>

        {/* Attention aux rabbit holes */}
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Attention aux rabbit holes
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-gray-300 text-lg">
              <strong>Ne te perds pas à chasser des fantômes.</strong> L'un des pièges les plus dangereux de l'examen CPTS (et des vrais pentests) est de passer des heures — voire des jours — à suivre la mauvaise piste.
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li>
                <strong>Être méthodique :</strong> Si quelque chose semble bizarre mais que tu ne trouves rien après un temps raisonnable (<span className="text-violet-400 font-semibold">~1–2 heures</span>), mets-le de côté et continue ailleurs.
              </li>
              <li>
                <strong>Suivre son temps :</strong> Noter littéralement combien de temps tu passes sur chaque "piste" ou chemin d'exploitation. Si tu dépasses l'heure sans progrès, change de contexte.
              </li>
              <li>
                <strong>Ne pas forcer :</strong> Tous les ports ouverts ou toutes les pages ne sont pas vulnérables. Sur la CPTS, il n'y a pas de "vrais" rabbit holes difficiles comme sur certaines boxes HTB insane — mais le réseau est grand, et tu peux facilement perdre du temps sur des impasses.
              </li>
              <li>
                <strong>Garder une liste "peut-être plus tard" :</strong> Documenter les findings bizarres dans tes notes et avancer. Revenir seulement si tu es à court d'autres pistes.
              </li>
              <li>
                <strong>Se demander :</strong> "Est-ce que c'est encore aligné avec l'objectif principal (flag, DA, DC) ou je pars sur une voie secondaire ?"
              </li>
            </ul>
            <p className="text-gray-400 text-base italic mt-4">
              Exemple : <br />
              J'ai une fois perdu une demi-journée à essayer d'exploiter un message d'erreur bizarre sur un service web qui s'est avéré être un leurre. Si tu ne progresses pas, prends du recul, fais une pause, et reconsidère.
              <br /><br />
              <span className="text-violet-400 font-semibold">Règle :</span> Dans le doute, retourne à l'énumération.
            </p>
          </div>
        </div>

        {/* Gestion du temps et de l'énergie mentale */}
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Gestion du temps & de l'énergie mentale
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg">
            <p className="text-gray-300 text-lg">
              <strong>Gérer son temps et son énergie mentale est aussi important que les compétences techniques pendant l'examen CPTS.</strong>
              <br />
              Avec 10 jours et un énorme réseau, tu as besoin d'un plan pour éviter le burnout et garder l'esprit vif.
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-300">
              <li>
                <strong>Établir une routine quotidienne :</strong> Bloquer des sessions fixes pour le pentest et les pauses. Par exemple, je visais <span className="text-violet-400 font-semibold">7 à 10 heures par jour</span>, mais réparties entre matin et après-midi, avec de vraies coupures.
              </li>
              <li>
                <strong>Prendre de vraies pauses :</strong> Quand tu bloques ou te sens fatigué, t'éloigner du clavier. Marcher, s'étirer, manger. Ça aide à se réinitialiser et à trouver de nouvelles idées.
              </li>
              <li>
                <strong>Ne pas s'obséder sur les blocages :</strong> Être bloqué fait partie du jeu. Si tu tournes en rond depuis des heures, changer d'activité : écrire le rapport, relire tes notes, ou dormir dessus. Parfois la solution apparaît après une pause.
              </li>
              <li>
                <strong>Suivre sa progression :</strong> Noter ses avancées (même les petites victoires) chaque jour. Voir la progression aide à combattre le découragement, surtout sur de longs examens.
              </li>
              <li>
                <strong>Prioriser son énergie :</strong> Attaquer les tâches "difficiles" ou créatives quand tu es le plus frais — généralement le matin. Utiliser les soirées pour la révision, l'écriture du rapport, ou préparer les cibles du lendemain.
              </li>
              <li>
                <strong>Anticiper les baisses :</strong> Tout le monde a des mauvaises journées. Si tu as une journée avec peu de progrès, ne panique pas. Le réseau est grand, mais tu n'as besoin que du bon chemin. Prends soin de toi.
              </li>
            </ul>
            <p className="text-gray-400 text-base italic mt-4">
              Exemple :<br />
              J'ai atteint un gros blocage autour du Flag 9. Après avoir gaspillé un après-midi entier, je me suis forcé à arrêter, sortir dehors, et ne revenir que le lendemain. En une heure, la solution est apparue, frais.
              <br /><br />
              <span className="text-violet-400 font-semibold">Rappelle-toi :</span> La CPTS est un marathon, pas un sprint. Ton cerveau est ton meilleur outil — traite-le bien.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
