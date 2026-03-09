import React from 'react';
import { Target, Users, BookOpen, Monitor, Brain, FileText, Award, ArrowRight, Shield } from 'lucide-react';

export const IntroSection: React.FC = () => (
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
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-violet-400" />
              <h4 className="text-xl font-semibold text-violet-300">Nouveau départ</h4>
            </div>
            <p className="text-gray-300 text-lg">
              <strong>Je suis français, actuellement en reconversion pour me lancer dans la cybersécurité.</strong>
              En septembre, je commence officiellement une alternance en informatique et réseaux, mais pour être honnête, mon parcours a commencé bien avant ça.
            </p>

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
                  rel="noopener noreferrer"
                >
                  Bruno Rocha Moura
                </a>
                m’a vraiment aidé. Ses conseils m’ont donné une vraie structure, ça m’a permis de garder le cap.<br />
                Dans le même état d’esprit, j’écris cet article pour “rendre la pareille”.
                <strong>Si tu te demandes si la CPTS vaut le coup, ou si tu ne sais pas comment aborder la prépa, j’espère que ça te donnera des repères.</strong>
              </p>
            </div>

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

            {/* De l’eJPT à la CPTS */}
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">De l’eJPT à la CPTS</span>
            </div>
            <p className="text-gray-300">
              Mais juste après, en creusant les modules CPTS…
              J’ai mesuré <strong>l’écart</strong>. La CPTS, c’était autrement plus <strong>avancé</strong>, autrement plus <strong>réaliste</strong>.<br />
              La eJPT m’avait confirmé que j’<strong>avais dépassé le stade débutant</strong> — mais il me restait encore beaucoup de chemin pour être vraiment solide.
              C’est là que la CPTS prenait tout son sens.
            </p>

            {/* Pourquoi la CPTS d’abord ? */}
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Pourquoi la CPTS d’abord ?</span>
            </div>
            <p className="text-gray-300">
              J’ai choisi la CPTS plutôt que de foncer directement sur l’<strong>OSCP</strong> parce que je voulais <strong>me former sérieusement</strong> — pas juste griller les étapes.
              Et soyons honnêtes : l’OSCP est <strong>cher</strong>, et j’ai vu beaucoup de retours disant que le contenu de la formation est moyen.
              Le <strong>contenu HTB</strong>, lui, est d’<strong>excellente qualité</strong>.
              Les modules sont <strong>denses, structurés et pratiques</strong>.
              Et la certification CPTS est <strong>abordable</strong>, ce qui compte quand on se finance seul.
            </p>
            <div className="bg-violet-900/20 rounded-lg p-4 space-y-2">
              <p className="text-violet-300 font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-400" />
                <span>CPTS : Le choix intelligent</span>
              </p>
              <p className="text-gray-300">
                Je vois la CPTS comme une <strong>étape technique sérieuse</strong> avant de tenter l’OSCP plus tard, surtout pour la <strong>visibilité RH</strong>.<br />
                Mais là, la CPTS était le <strong>choix pragmatique et réaliste</strong> pour là où j’en étais.
                Un super contenu, des <strong>challenges concrets</strong>, et un examen qui oblige à <strong>penser comme un pentesteur</strong> — pas juste à suivre des étapes.
              </p>
            </div>
            <p className="text-gray-400 text-base italic mt-2">
              <span className="text-violet-400 font-semibold">Conseil :</span> Si tu es dans cette situation — quelque part entre <strong>"débutant" et "prêt pour de vraies missions"</strong> — la CPTS est une excellente façon de <strong>progresser sans se cramer ni se ruiner</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
