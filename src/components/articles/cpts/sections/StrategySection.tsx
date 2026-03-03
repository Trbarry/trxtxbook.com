import React from 'react';
import { Brain, BookOpen, Calendar, Monitor, FileText, Zap, Terminal, Users, TrendingUp, Clock } from 'lucide-react';

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
            <p className="text-gray-300">
              J’ai attaqué la  
              <a href="https://www.youtube.com/watch?v=H9FcE_FMZio&list=PLidcsTyj9JXItWpbRtTg6aDEj10_F17x5"
                target="_blank"
                className="text-violet-400 hover:underline font-semibold ml-1"
                rel="noopener noreferrer"
              >
                playlist CPTS d’IppSec
              </a>
              . Les boxes sont <strong>super bien sélectionnées</strong>.
            </p>

            <div className="bg-violet-900/20 rounded-lg p-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-400" />
              <span className="text-gray-300">
                <strong>Conseil perso :</strong>
                N’attends pas trop après avoir fini le cursus avant d’attaquer la playlist IppSec.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
