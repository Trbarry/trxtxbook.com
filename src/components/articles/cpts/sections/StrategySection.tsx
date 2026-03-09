import React from 'react';
import { Brain, BookOpen, Calendar, Monitor, FileText, Zap, Terminal, Users, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

export const StrategySection: React.FC = () => (
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
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-violet-400" />
              <h4 className="text-xl font-semibold text-violet-300">Ma routine de travail</h4>
            </div>
            <p className="text-gray-300 text-lg">
              Je n’ai pas suivi de planning strict durant le cursus CPTS : je visais simplement environ <strong>6 à 7 heures par jour</strong>, <strong>cinq jours par semaine</strong>, en prenant toujours des pauses toutes les deux heures pour garder la concentration.
              Avec l’expérience, j’ai compris que <strong>le repos compte autant que le temps de travail</strong> — surtout en cybersécurité, où la compréhension est plus importante que le “par cœur”.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <Monitor className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Processus d’apprentissage</span>
            </div>
            <p className="text-gray-300">
              Ma routine était simple : <strong>je démarrais un module</strong>, <strong>j’allais au bout</strong>, et je prenais <strong>des notes structurées</strong> au fil de l’eau.
              Dès que possible, je <strong>enchaînais avec une ou deux boxes HTB</strong> en lien avec le thème du module.<br/>
              Cette pratique était essentielle : les défis pratiques m’aidaient à <strong>ancrer tout de suite ce que je venais de voir</strong>.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Révision quotidienne</span>
            </div>
            <p className="text-gray-300">
              Chaque matin, je <strong>relisais mes notes de la veille</strong> pour garder tout en tête et renforcer la mémoire à long terme.
              Ce n’était pas toujours facile de garder la motivation — il y a des hauts et des bas — mais je me répétais que <strong>la discipline devait l’emporter sur le confort</strong>.
              À la longue, ça a payé. Les progrès n’étaient pas toujours visibles au jour le jour, mais avec le recul, l’accumulation est flagrante.
            </p>

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
            <div className="flex items-center gap-3 mb-2">
              <Terminal className="w-6 h-6 text-violet-400" />
              <h4 className="text-xl font-semibold text-violet-300">De la théorie à la pratique</h4>
            </div>
            <p className="text-gray-300 text-lg">
              Pendant le <strong>parcours CPTS</strong>, je m’imposais de faire <strong>1 à 2 boxes HTB par module</strong>, toujours en lien direct avec la thématique étudiée.
              Par exemple, après le module <em>Web Exploitation</em>, j’allais chercher un challenge XSS ou file upload.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <Users className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Monter en niveau avec les live boxes</span>
            </div>
            <p className="text-gray-300">
              Une fois le cursus fini, je suis passé sur les <strong>live boxes de Hack The Box</strong>.<br/>
              Pas forcément reliées aux modules — juste pour le plaisir et le challenge.
            </p>
            <ul className="list-disc ml-8 text-gray-300 space-y-1">
              <li><strong>Le pivoting interne</strong> (Ligolo-ng)</li>
              <li><strong>La logique post-exploitation</strong> et le déplacement latéral</li>
              <li><strong>La gestion des antivirus et EDR</strong></li>
            </ul>

            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">La playlist IppSec CPTS</span>
            </div>
            <div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-400" />
              <span className="text-gray-300">
                J’ai attaqué la
                <a href="https://www.youtube.com/watch?v=H9FcE_FMZio&list=PLidcsTyj9JXItWpbRtTg6aDEj10_F17x5"
                  target="_blank"
                  className="text-violet-400 hover:underline font-semibold ml-1"
                  rel="noopener noreferrer"
                >
                  playlist CPTS d’IppSec
                </a>
                . Ces boxes sont <strong>brillamment sélectionnées</strong>. Certaines ont des vulnérabilités quasi identiques à la CPTS. Et surtout, elles te forcent à :
              </span>
            </div>
            <ul className="list-disc ml-8 text-gray-300 space-y-1">
              <li><strong>Enchaîner plusieurs étapes</strong> sans aucun guidage</li>
              <li><strong>Structurer ton workflow</strong> comme dans un vrai pentest</li>
              <li><strong>Gérer les pivots et scénarios post-exploitation</strong> tout seul</li>
            </ul>
            <p className="text-gray-300">
              Ces boxes m’ont vraiment <strong>boosté la confiance</strong>.
              Après avoir fini la playlist, je me suis dit : <em>"Ok, là je suis vraiment prêt pour les 10 jours d’exam."</em>
            </p>

            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Méthodes de préparation alternatives</span>
            </div>
            <div className="bg-violet-900/20 rounded-lg p-4">
              <p className="text-gray-300 mb-2">
                💬 Je sais que certains utilisent aussi les <strong>ProLabs</strong> ou s’attaquent aux <strong>boxes hard/insane</strong> pour préparer, mais personnellement, je n’en ai pas eu besoin.
                À mon avis, si tu :
              </p>
              <ul className="list-disc ml-8 text-gray-300 space-y-1">
                <li>termines le parcours CPTS <strong>sérieusement</strong>,</li>
                <li>associes les modules à des boxes pertinentes <strong>régulièrement</strong>,</li>
                <li>suis la playlist IppSec <strong>au bon moment</strong>,</li>
              </ul>
              <p className="text-gray-300 mt-2">
                …alors tu as <strong>tout ce qu’il te faut</strong>.
                Pas besoin d’en faire trop. Le parcours CPTS seul est déjà <strong>riche et complet</strong>.
              </p>
            </div>

            <div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-400" />
              <span className="text-gray-300">
                <strong>Conseil perso :</strong> N’attends pas trop après avoir fini le cursus avant d’attaquer la playlist IppSec — tu risques d’oublier des détails clés.
                Mais ne te lance pas trop tôt non plus.
                Assure-toi d’avoir des bases solides issues des modules avant de plonger. <strong>Fais confiance au processus</strong>.
              </span>
            </div>
          </div>
        </div>

        {/* Final Sprint */}
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Préparation finale & Sprint avant l’examen
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-violet-400" />
              <h4 className="text-xl font-semibold text-violet-300">J-10 : Pause stratégique</h4>
            </div>
            <p className="text-gray-300 text-lg">
              À <strong>J-10</strong>, j’avais déjà terminé l’intégralité du <strong>parcours d’apprentissage</strong>, les <strong>boxes HTB</strong>, et toute la <strong>playlist IppSec</strong>.<br />
              J’ai donc décidé de prendre une vraie pause — environ <strong>3 à 4 jours complets</strong> sans toucher à un clavier.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Le repos, c’est essentiel</span>
            </div>
            <div className="bg-violet-900/20 rounded-lg p-4">
              <span className="text-gray-300">
                Je suis convaincu que <strong>se reposer est aussi important que grinder</strong>.
                Ton cerveau a besoin de temps pour digérer et organiser tout ce que tu as appris.
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Organisation des notes & révision</span>
            </div>
            <p className="text-gray-300">
              Une fois revenu frais, j’ai passé le temps restant à relire <strong>toutes mes notes</strong> et à les structurer proprement dans <strong>Obsidian</strong>.
              J’ai tout organisé par phase de pentest pour pouvoir retrouver n’importe quelle technique ou commande rapidement si besoin.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Mode préparation finale</span>
            </div>
            <p className="text-gray-300">
              C’était mon seul objectif durant ces 10 jours.
              Plus de labs, plus de boxes, plus de distractions.
              Juste du peaufinage, de la sérénité, et de la préparation.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
