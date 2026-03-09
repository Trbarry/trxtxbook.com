import React from 'react';
import { Clock, Target, Shield, Terminal, Network, ListChecks, Brain, FileText, Calendar, Zap } from 'lucide-react';

export const ExamWeekSection: React.FC = () => (
  <section className="mb-16">
    <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="w-8 h-8 text-violet-400" />
        <h2 className="text-3xl font-bold">Semaine d'examen</h2>
      </div>
      <div className="space-y-8">

        {/* Format & Scope */}
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Format & Périmètre de l'examen
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">

            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-violet-400" />
              <h4 className="text-xl font-semibold text-violet-300">Examen CPTS : Ce qui se rapproche le plus d'un vrai pentest</h4>
            </div>
            <p className="text-gray-300 text-lg">
              L'examen CPTS simule une <strong>vraie mission offensive</strong> contre une entreprise fictive.
              Je ne peux pas partager trop de détails en raison des conditions d'utilisation d'HTB, mais je peux affirmer en toute confiance :
              <strong> C'est ce qui se rapproche le plus d'un vrai pentest dans une certification.</strong>
            </p>

            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Le scénario d'engagement</span>
            </div>
            <p className="text-gray-300">
              Dès le départ, tu reçois un périmètre précis via une lettre d'engagement — exactement comme dans une vraie opération red team.
              Le point d'entrée initial est une application web exposée sur internet.
              Ta mission ? <strong>Compromettre entièrement deux domaines Active Directory distincts</strong> (oui, deux !) et accéder à au moins <strong>12 flags sur 14</strong> dans toute l'infrastructure.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <Network className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Un réseau réaliste et segmenté</span>
            </div>
            <p className="text-gray-300">
              Le réseau est <strong>vaste et réaliste</strong> — hôtes Windows & Linux, segmentation, nécessité de pivoting.
              Le double pivoting est obligatoire ; des outils comme <strong>Ligolo-ng</strong> deviennent essentiels.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Vulnérabilités & Méthode</span>
            </div>
            <p className="text-gray-300">
              Les vulnérabilités ne sont ni exotiques ni avancées : tout est couvert dans le parcours CPTS.
              Mais <strong>l'échelle et la densité</strong> peuvent t'induire en erreur.
              Il n'y a pas de vrais "rabbit holes" comme dans les boxes Hard/Insane de HTB, mais l'environnement est si grand que tu peux perdre des heures si tu n'es pas pragmatique.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Rythme & Mentalité</span>
            </div>
            <p className="text-gray-300">
              L'examen dure <strong>10 jours complets</strong>. J'ai travaillé en moyenne <strong>7 heures par jour</strong>.
              Attends-toi à des blocages — parfois j'étais bloqué pendant une journée ou plus.
              Quand ça arrivait, je prenais du recul, je ré-énumérais et je réfléchissais de façon critique.
              Tu simules la mentalité d'un hacker. <strong>La créativité et l'adaptabilité</strong> sont aussi importantes que les compétences techniques.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Comment réussir</span>
            </div>
            <div className="bg-violet-900/20 rounded-lg p-4">
              <span className="text-gray-300">
                Le parcours d'apprentissage te prépare <strong>parfaitement</strong> — mais ne te repose pas sur l'automatisation ou le tunnel vision.
                <br />
                <span className="font-semibold text-violet-400">Pense comme un attaquant. Déplace-toi latéralement. Reste focus. Sois méthodique.</span>
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Reporting</span>
            </div>
            <p className="text-gray-300">
              Pour le rapport, j'ai utilisé <strong>SysReptor</strong> et exporté tout sous forme de PDF soigné.
              Je recommande vivement cette méthode — c'est propre, professionnel, et correspond aux attentes d'HTB.
              En option, tu peux inclure des annexes avec des preuves techniques comme un <strong>dump DC complet ou un audit de politique de mots de passe (ex: analyse DPAT)</strong> si c'est pertinent.
            </p>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Déroulé journalier
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">

            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-violet-400" />
              <h4 className="text-xl font-semibold text-violet-300">Habitudes de reporting : Ce qu'il ne faut pas faire</h4>
            </div>
            <p className="text-gray-300 text-lg">
              Je suis entré dans l'examen <strong>bien préparé</strong>, avec une solide méthodologie et de bonnes habitudes… du moins je le pensais.
              Le <strong>Jour 1</strong>, je me suis promis de tout documenter dans SysReptor <strong>chaque soir</strong>.<br />
              <span className="text-red-400 font-semibold">❌ Grosse erreur.</span>
            </p>

            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">La vraie méthode trigger-based en temps réel</span>
            </div>
            <div className="bg-violet-900/20 rounded-lg p-4">
              <span className="text-gray-300">
                Ce qui fonctionne vraiment, c'est l'<strong>approche trigger-based en temps réel</strong> — chaque fois que tu découvres quelque chose (un port, un utilisateur, un accès, un flag…), prends quelques secondes pour le documenter <em>immédiatement</em>.<br />
                <span className="block mt-1 font-semibold text-violet-400">ÉCRIS TON RAPPORT EN TEMPS RÉEL.</span>
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Utiliser ChatGPT (de la bonne façon)</span>
            </div>
            <p className="text-gray-300">
              💡 Oui, j'ai utilisé <strong>ChatGPT</strong> pour accélérer certaines parties de la rédaction (notamment les sections impact/mesures correctives),
              mais j'ai toujours <strong>relu et réécrit tout</strong> pour que ça corresponde à mon style et à mes findings.
            </p>

            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Progression & Gestion mentale</span>
            </div>
            <p className="text-gray-300">
              En termes de progression, les premiers jours étaient rapides — j'ai rapidement obtenu un accès solide et avancé sans problème jusqu'au <strong>flag 9</strong>.
              À partir de là, les choses se sont corsées. Ce qui m'a aidé, c'était de prendre du recul, <strong>ré-énumérer</strong>, et tout reanalyser.
              C'est comme ça que j'ai débloqué les étapes suivantes.
            </p>
            <p className="text-gray-300">
              La même chose s'est produite avec le <strong>flag 12</strong>. Il n'y a aucune honte à reculer pour mieux avancer.
              Le contenu est dense, et c'est stressant d'avoir seulement 9 flags au bout du Xème jour.
              <span className="font-semibold text-violet-400"> Ne panique pas — reste calme, réfléchis bien, et continue d'avancer.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
