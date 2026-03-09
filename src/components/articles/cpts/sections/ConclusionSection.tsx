import React from 'react';
import { Users, Award, Shield, TrendingUp, Database, BookOpen } from 'lucide-react';

export const ConclusionSection: React.FC = () => (
  <>
    {/* Post-Exam Reflection & Next Steps */}
    <section className="mb-16">
      <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-violet-400" />
          <h2 className="text-3xl font-bold">Réflexion post-examen & Suite du parcours</h2>
        </div>
        <div className="space-y-8">

          {/* CPTS vs OSCP */}
          <div>
            <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Comparer la CPTS à l'OSCP
            </h3>
            <div className="bg-[#2a2a2f] p-6 rounded-lg">
              <p className="text-gray-300 text-lg">
                <strong>Valider la CPTS a été un vrai défi — aussi bien techniquement que mentalement.</strong> L'examen m'a forcé à être méthodique, rigoureux, et à gérer mon stress sur une longue période. J'en suis sorti plus fort et bien plus confiant dans mon workflow de pentest.
              </p>
              <div className="bg-violet-900/20 rounded-lg p-4 space-y-3">
                <p className="text-violet-300 font-semibold">
                  <span className="text-xl">💡</span> Je n'ai pas encore passé l'OSCP — c'est cher, et je veux le faire quand je chercherai activement un poste en cybersécurité.
                </p>
                <ul className="list-disc ml-6 text-gray-300">
                  <li>
                    <strong>La CPTS est plus technique et réaliste :</strong> Le périmètre est énorme, les réseaux sont complexes, et tu dois penser comme un vrai pentesteur (double pivot, compromission AD complète, énumération personnalisée).
                  </li>
                  <li>
                    <strong>L'OSCP est célèbre pour une raison :</strong> Même si techniquement moins avancé que la CPTS en 2025, c'est encore LA certification que la plupart des RH reconnaissent immédiatement — surtout en dehors de la communauté HTB.
                  </li>
                  <li>
                    <strong>Le format 24h de l'OSCP est brutal :</strong> Il génère un stress énorme et laisse peu de place aux erreurs, tandis que la CPTS ressemble plus à un vrai pentest, étalé sur 10 jours — ce qui enseigne l'endurance et la gestion des processus.
                  </li>
                  <li>
                    <strong>La reconnaissance évolue :</strong> La CPTS gagne en attention, notamment en Europe et auprès des équipes techniques. Les recruteurs commencent à en comprendre la valeur. Mais l'OSCP reste le standard sur les offres LinkedIn pour l'instant.
                  </li>
                  <li>
                    <strong>Le style de reporting diffère :</strong> La CPTS met fortement l'accent sur un reporting détaillé et réaliste (SysReptor, findings, walkthrough). L'OSCP est plus axé root/user.txt, avec un rapport plus simple à la fin.
                  </li>
                  <li>
                    <strong>Approche personnelle :</strong> Pour l'instant, mon focus est sur la progression technique. Quand je me sentirai prêt et que j'aurai besoin de la ligne OSCP sur mon CV, je m'y attaquerai — pas avant.
                  </li>
                </ul>
              </div>
              <p className="text-gray-400 text-base italic mt-2">
                <span className="text-violet-400 font-semibold">Mon conseil :</span> Ne cours pas après l'OSCP juste pour le nom. Construis tes compétences, solidifie-toi sur des labs réels, et choisis le bon moment pour toi. Les deux certifications peuvent ouvrir des portes, mais tes compétences et ton état d'esprit feront toujours la différence.
              </p>
            </div>
          </div>

          {/* Plan OSCP, BSCP & Beyond */}
          <div>
            <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Mon plan pour l'OSCP, la BSCP & la suite
            </h3>
            <div className="bg-[#2a2a2f] p-6 rounded-lg">
              <p className="text-gray-300 text-lg">
                <strong>Pour les prochaines étapes, ma stratégie est simple : continuer à empiler les compétences, continuer à progresser — un pas à la fois.</strong>
              </p>
              <div className="bg-violet-900/20 rounded-lg p-4 space-y-3">
                <ul className="list-disc ml-6 text-gray-300">
                  <li>
                    <strong>Après la CPTS :</strong> La prochaine étape logique est la <span className="text-violet-300">BSCP (Burp Suite Certified Practitioner)</span> pour prouver mes compétences en pentest web.
                  </li>
                  <li>
                    <strong>Objectif parallèle :</strong> Je veux aussi passer le <span className="text-blue-300">CCNA</span> pour renforcer mes bases réseau — c'est clé pour les rôles pentest et admin.
                  </li>
                  <li>
                    <strong>Encore hésitant :</strong> Devrais-je viser la <span className="text-pink-300">CBBH (Certified Bug Bounty Hunter)</span> ? Ou foncer directement vers l'OSCP ? Pour l'instant, je reste ouvert — j'adapterai selon ma progression.
                  </li>
                  <li>
                    <strong>L'OSCP est l'objectif long terme :</strong> Je veux attendre d'être prêt, et peut-être jusqu'à la fin de mes études ou quand je décide de chercher un poste en cybersécurité. En attendant, focus total sur l'apprentissage, les labs, et les pro labs si j'ai le temps !
                  </li>
                  <li>
                    <strong>Alternance + Certifs :</strong> Le défi est d'équilibrer mon <span className="text-violet-300">alternance</span>, mon parcours académique, et la progression technique. C'est exigeant, mais c'est le jeu.
                  </li>
                  <li>
                    <strong>Continuer à apprendre :</strong> Comme toujours : rester humble, apprendre chaque jour, et adapter le plan en chemin. Il n'y a pas de roadmap magique en cybersécurité — juste la prochaine étape.
                  </li>
                </ul>
              </div>
              <p className="text-gray-400 text-base italic mt-2">
                <span className="text-violet-400 font-semibold">État d'esprit actuel :</span> Les compétences d'abord, les certifications ensuite. Le job viendra quand il le faudra — là, c'est construire une expertise réelle et durable.
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
          <h2 className="text-3xl font-bold">Ressources complémentaires & Remerciements</h2>
        </div>
        <div className="space-y-8">

          <div>
            <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Labs, Plateformes & Communautés
            </h3>
            <div className="bg-[#2a2a2f] p-6 rounded-lg">
              <p className="text-gray-300 text-lg">
                <strong>En cybersécurité, on n'arrête jamais d'apprendre.</strong>
                Je continue à progresser grâce à la pratique et au soutien que je reçois chaque jour.
              </p>
              <div className="bg-violet-900/20 rounded-lg p-4 space-y-2">
                <h3 className="text-xl font-semibold text-violet-300 mb-2">Labs & Plateformes</h3>
                <ul className="list-disc ml-6 text-gray-300">
                  <li>TryHackMe — idéal pour l'apprentissage structuré et les bases</li>
                  <li>Hack The Box — boxes réalistes et labs Active Directory avancés</li>
                  <li>PortSwigger Web Security Academy — la référence pour maîtriser les vulns web</li>
                  <li>Root-Me — parfait pour les challenges CTF et l'exploitation pure</li>
                  <li>Exegol — mon environnement de pentest quotidien, hautement personnalisable</li>
                </ul>
              </div>
              <div className="bg-violet-900/20 rounded-lg p-4 space-y-2">
                <h3 className="text-xl font-semibold text-violet-300 mb-2">Communauté & Soutien</h3>
                <ul className="list-disc ml-6 text-gray-300">
                  <li>LinkedIn — pour le networking, l'inspiration, et suivre d'autres pentesters</li>
                  <li>Ma famille, ma femme, et mon chien — honnêtement, il faut aussi un soutien hors écran</li>
                </ul>
              </div>
              <p className="text-gray-400 italic">
                Si tu lis ceci et que tu m'as aidé en chemin, merci — tu sais qui tu es.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Ceux qui m'ont aidé à grandir
            </h3>
            <div className="bg-[#2a2a2f] p-6 rounded-lg">
              <p className="text-gray-300 text-lg">
                Je ne serais pas arrivé là seul. Voici quelques personnes et créateurs qui m'ont inspiré et poussé à aller plus loin en cybersécurité :
              </p>
              <ul className="list-disc ml-6 text-gray-300">
                <li>
                  <strong>Les pentesters sur LinkedIn :</strong> Chaque jour, je m'inspire de gens qui partagent leur parcours, leurs write-ups techniques et leurs conseils. Les voir avancer me motive à continuer.
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
                  : Le meilleur contenu pentesting français, toujours direct, super motivant. Si tu lis ceci : merci pour ton état d'esprit et tous les conseils !
                </li>
                <li>
                  <strong>IppSec :</strong> Le <em>GOAT</em> pour Hack The Box — j'ai appris la méthodologie, comment penser comme un hacker, et comment approcher chaque box étape par étape.
                </li>
                <li>
                  <strong>Mon ami pentesteur :</strong> Celui qui m'a plongé dans le terrier de la cybersécurité. Tu sais qui tu es. Sans tes conseils et nos discussions nocturnes, je n'aurais probablement pas franchi le pas.
                </li>
              </ul>
              <p className="text-gray-400 italic">
                Si tu m'as inspiré, appris quelque chose, ou challengé à faire mieux — même avec juste un message ou une vidéo YouTube — merci.
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
          <h2 className="text-3xl font-bold">Conclusion & Motivation</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6" />
              Toi aussi, tu peux le faire
            </h3>
            <div className="bg-[#2a2a2f] p-6 rounded-lg">
              <p className="text-gray-300 text-lg">
                Le vrai secret pour progresser en cybersécurité — ou dans n'importe quoi d'ailleurs — c'est <strong>le travail, la patience et la résilience</strong>. Rien ne vient instantanément. Il faut accepter qu'il y aura des jours (parfois beaucoup !) où tu te sentiras bloqué. Mais si tu continues d'avancer, les percées finissent toujours par arriver.
              </p>
              <p className="text-gray-300 text-lg">
                L'apprentissage est un processus à vie. Il n'y a pas de ligne d'arrivée — tu t'améliores juste un peu chaque jour. Plus tu essaies, plus tu vas loin, même si tu ne le vois pas toujours immédiatement.
              </p>
              <p className="text-gray-300 text-lg">
                Mon seul conseil : <strong>n'abandonne pas</strong>, même quand c'est frustrant. Retrouve ta curiosité, apprécie le défi, et n'aie pas peur d'essayer (et d'échouer) encore et encore. <strong>Quand tu aimes ce que tu fais, tu peux vraiment y devenir excellent.</strong>
              </p>
              <p className="text-gray-300 text-lg">
                Merci d'avoir pris le temps de lire cet article (très long !). J'espère qu'il t'a aidé ou guidé un peu — j'ai vraiment essayé de mettre toute mon expérience en mots, même si ce n'est pas toujours facile de tout expliquer.
              </p>
              <p className="text-violet-300 font-semibold text-lg">
                Toi aussi tu peux y arriver. Reste patient, continue d'apprendre, et demande de l'aide si tu en as besoin. Le progrès est inévitable si tu continues à te montrer !
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div className="bg-gradient-to-r from-violet-500/10 to-violet-600/10 border border-violet-500/20 rounded-lg p-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Award className="w-8 h-8 text-violet-400" />
        <h2 className="text-2xl font-bold text-violet-400">Parcours terminé</h2>
      </div>
      <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
        D'apprenti pentesteur à certifié CPTS — ce parcours m'a transformé.
        La route était difficile, mais chaque heure investie en valait la peine pour les compétences et la confiance acquises.
      </p>
    </div>
  </>
);
