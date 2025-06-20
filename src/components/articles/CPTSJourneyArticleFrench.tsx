import React from 'react';
import { Award, Calendar, Target, BookOpen, Brain, Shield, Terminal, Users, Lightbulb, CheckCircle2, Clock, FileText, Zap, Coffee, Monitor, Network, Lock, Code, ArrowRight, TrendingUp, Cpu, Database } from 'lucide-react';

export const CPTSJourneyArticleFrench: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Image d'illustration CPTS */}
      <div className="relative mb-12">
        <div className="relative h-[400px] overflow-hidden rounded-lg border border-violet-900/20">
          <img
            src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/cptsimage.png"
            alt="CPTS Journey - Certified Penetration Testing Specialist"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">
                Mon Parcours CPTS : 5 Mois d'Apprentissage Intensif
              </h2>
              <p className="text-xl text-gray-200 leading-relaxed">
                De l'eJPT au CPTS - Une transformation complète en pentesting professionnel
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table des matières */}
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20 mb-12">
        <h2 className="text-xl font-bold text-violet-400 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Table des Matières
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            'Introduction & Accroche',
            'Contexte : De l\'eJPT au CPTS',
            'Stratégie d\'Étude Détaillée',
            'Feuille de Route de 5 Mois & Sprint Final',
            'Outils, Environnement & Prise de Notes',
            'Semaine d\'Examen',
            'Le Rapport de 190 Pages',
            'Plus Grands Défis & Comment Je les ai Surmontés',
            'Conseils & Astuces - Aide-Mémoire',
            'Réflexion Post-Examen & Prochaines Étapes',
            'Études Complémentaires & Remerciements',
            'Conclusion & Encouragements'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-400 hover:text-violet-400 transition-colors">
              <ArrowRight className="w-3 h-3" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 1: Introduction & Hook */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Introduction & Accroche</h2>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed text-lg mb-6">
              Il y a 5 mois, j'étais un pentester junior fraîchement certifié eJPT, avec une soif d'apprendre mais sans vraiment savoir par où continuer. Aujourd'hui, je viens de valider ma certification CPTS (Certified Penetration Testing Specialist) de Hack The Box Academy, et je peux dire sans exagérer que ce parcours a complètement transformé ma vision du pentesting.
            </p>
            
            <p className="text-gray-300 leading-relaxed text-lg mb-6">
              Cette certification n'est pas juste un bout de papier de plus. C'est 5 mois d'apprentissage intensif, 28 modules techniques, plus de 30 machines pratiques, 10 jours d'examen en conditions réelles, et un rapport de 190 pages rédigé en anglais. C'est aussi des nuits blanches, des moments de doute, des "eureka" à 3h du matin, et finalement une confiance technique que je n'avais jamais eue auparavant.
            </p>

            <p className="text-gray-300 leading-relaxed text-lg">
              Dans cet article, je partage tout : ma méthode de travail, mes erreurs, mes outils, mes galères, et surtout ce que j'aurais aimé savoir avant de commencer. Si vous hésitez à vous lancer dans la CPTS ou si vous cherchez des conseils concrets pour réussir, cet article est fait pour vous.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Background */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Contexte : De l'eJPT au CPTS</h2>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed text-lg mb-6">
              Avant de me lancer dans la CPTS, j'avais validé l'eJPT en février 2025. Cette première certification m'avait donné les bases du pentesting, mais je sentais qu'il me manquait la profondeur technique et la méthodologie rigoureuse pour passer au niveau supérieur.
            </p>

            <div className="bg-[#2a2a2f] p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-violet-400 mb-4">Pourquoi la CPTS ?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1" />
                  <span><strong>100% pratique :</strong> Pas de QCM, que de la pratique en conditions réelles</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1" />
                  <span><strong>Contenu dense :</strong> 28 modules couvrant tous les aspects du pentesting moderne</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1" />
                  <span><strong>Reconnaissance industrie :</strong> Certification respectée par les professionnels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1" />
                  <span><strong>Prix abordable :</strong> 490$ pour une formation complète (vs 7000$+ pour l'OSCP)</span>
                </li>
              </ul>
            </div>

            <p className="text-gray-300 leading-relaxed text-lg">
              Le déclic s'est fait en lisant l'article de Bruno Rocha Moura sur son expérience CPTS. Son approche méthodique et ses conseils pratiques m'ont convaincu que c'était le bon moment pour franchir le cap.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Study Strategy */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Stratégie d'Étude Détaillée</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Cpu className="w-6 h-6" />
                Maîtriser les 28 Modules CPTS
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg mb-6">
                  La formation CPTS se compose de 28 modules techniques, chacun couvrant un aspect spécifique du pentesting. Mon approche a été de les traiter de manière séquentielle, en prenant le temps de vraiment comprendre chaque concept avant de passer au suivant.
                </p>

                <div className="bg-[#2a2a2f] p-6 rounded-lg mb-6">
                  <h4 className="text-lg font-semibold text-violet-400 mb-4">Ma méthode par module :</h4>
                  <ol className="space-y-3 list-decimal list-inside">
                    <li><strong>Lecture active :</strong> Prise de notes détaillées dans Obsidian</li>
                    <li><strong>Pratique immédiate :</strong> Reproduction de chaque technique dans mon lab</li>
                    <li><strong>Documentation :</strong> Création de templates et de checklists</li>
                    <li><strong>Révision :</strong> Retour sur les points difficiles après 48h</li>
                  </ol>
                </div>

                <p className="text-gray-300 leading-relaxed text-lg">
                  Les modules les plus chronophages ont été ceux sur Active Directory (AD Enumeration & Attacks) et les techniques de post-exploitation. J'y ai passé près de 3 semaines au total, mais c'est ce qui m'a donné la confiance nécessaire pour l'examen.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Monitor className="w-6 h-6" />
                Machines HTB & Liste d'IppSec
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg mb-6">
                  En parallèle des modules, j'ai suivi la liste "Unofficial CPTS Prep" d'IppSec, qui recommande une trentaine de machines HTB spécifiquement choisies pour préparer l'examen CPTS.
                </p>

                <div className="bg-[#2a2a2f] p-6 rounded-lg mb-6">
                  <h4 className="text-lg font-semibold text-violet-400 mb-4">Approche machines :</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>Tentative solo :</strong> 2-3h maximum sans aide</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>Analyse du writeup :</strong> Comprendre la méthodologie</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>Reproduction :</strong> Refaire la machine en appliquant la méthode</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>Documentation :</strong> Notes détaillées des techniques utilisées</span>
                    </li>
                  </ul>
                </div>

                <p className="text-gray-300 leading-relaxed text-lg">
                  Cette approche m'a permis de développer une méthodologie solide et de constituer une base de connaissances réutilisable pour l'examen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Roadmap & Sprint */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Feuille de Route de 5 Mois & Sprint Final</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Répartition Mois par Mois
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#2a2a2f] p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-violet-400 mb-4">Mois 1-2 : Fondations</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Modules de reconnaissance et énumération</li>
                    <li>• Techniques de footprinting</li>
                    <li>• Vulnérabilités web de base</li>
                    <li>• 8-10 machines HTB faciles</li>
                  </ul>
                </div>
                <div className="bg-[#2a2a2f] p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-violet-400 mb-4">Mois 3-4 : Approfondissement</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Active Directory en profondeur</li>
                    <li>• Techniques de post-exploitation</li>
                    <li>• Pivoting et tunneling</li>
                    <li>• 12-15 machines HTB moyennes</li>
                  </ul>
                </div>
                <div className="bg-[#2a2a2f] p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-violet-400 mb-4">Mois 5 : Préparation finale</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Révision complète des modules</li>
                    <li>• Machines difficiles et challenges</li>
                    <li>• Préparation de l'environnement d'examen</li>
                    <li>• Tests de méthodologie</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Les 10 Derniers Jours
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg mb-6">
                  Les 10 derniers jours avant l'examen ont été cruciaux. J'ai complètement arrêté d'apprendre de nouvelles techniques pour me concentrer sur la consolidation et la préparation mentale.
                </p>

                <div className="bg-[#2a2a2f] p-6 rounded-lg mb-6">
                  <h4 className="text-lg font-semibold text-violet-400 mb-4">Programme des 10 derniers jours :</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>J-10 à J-7 :</strong> Révision des checklists et templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>J-6 à J-4 :</strong> Test de l'environnement d'examen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>J-3 à J-1 :</strong> Repos et préparation mentale</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>J-0 :</strong> Jour J - Démarrage de l'examen</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Coffee className="w-6 h-6" />
                Mes Rituels d'Administrateur Système
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg mb-6">
                  Pour tenir sur la durée, j'ai développé des rituels qui m'ont aidé à maintenir ma motivation et ma productivité.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2f] p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-violet-400 mb-4">Routine quotidienne :</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• 6h-7h : Réveil et café</li>
                      <li>• 7h-12h : Session d'étude intensive</li>
                      <li>• 12h-13h : Pause déjeuner</li>
                      <li>• 13h-17h : Pratique sur machines</li>
                      <li>• 17h-18h : Documentation et notes</li>
                      <li>• Soirée : Repos et détente</li>
                    </ul>
                  </div>
                  <div className="bg-[#2a2a2f] p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-violet-400 mb-4">Gestion du stress :</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• Pauses régulières toutes les 2h</li>
                      <li>• Sport 3x par semaine</li>
                      <li>• Sommeil 7-8h par nuit</li>
                      <li>• Weekend de repos complet</li>
                      <li>• Discussions avec la communauté</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Tooling & Environment */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Outils, Environnement & Prise de Notes</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Utiliser Obsidian Efficacement
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg mb-6">
                  Obsidian a été mon outil principal pour organiser mes connaissances. J'ai créé un système de notes interconnectées qui m'a permis de retrouver rapidement n'importe quelle information pendant l'examen.
                </p>

                <div className="bg-[#2a2a2f] p-6 rounded-lg mb-6">
                  <h4 className="text-lg font-semibold text-violet-400 mb-4">Structure de mon vault Obsidian :</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>📚 Modules CPTS :</strong> Une note par module avec résumés et techniques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>🎯 Machines HTB :</strong> Writeups détaillés avec méthodologie</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>🔧 Checklists :</strong> Procédures step-by-step pour chaque phase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>💡 One-liners :</strong> Commandes et payloads organisés par catégorie</span>
                    </li>
                  </ul>
                </div>

                <p className="text-gray-300 leading-relaxed text-lg">
                  Le système de liens et de tags d'Obsidian m'a permis de créer une véritable base de connaissances navigable, essentielle pendant les 10 jours d'examen.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Utiliser Sysreptor Sans Perdre la Raison
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg mb-6">
                  Sysreptor est l'outil recommandé par HTB Academy pour la rédaction du rapport CPTS. Bien qu'il soit puissant, il a ses particularités qu'il faut maîtriser avant l'examen.
                </p>

                <div className="bg-[#2a2a2f] p-6 rounded-lg mb-6">
                  <h4 className="text-lg font-semibold text-violet-400 mb-4">Mes conseils Sysreptor :</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>Préparer les templates :</strong> Créer des modèles pour chaque type de vulnérabilité</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>Maîtriser le markdown :</strong> Sysreptor utilise une syntaxe spécifique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>Organiser les screenshots :</strong> Système de nommage cohérent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-400 mt-1" />
                      <span><strong>Sauvegardes régulières :</strong> Export PDF toutes les 2-3 heures</span>
                    </li>
                  </ul>
                </div>

                <p className="text-gray-300 leading-relaxed text-lg">
                  J'ai passé une semaine entière à me familiariser avec Sysreptor avant l'examen. Cette préparation m'a fait gagner un temps précieux pendant la rédaction du rapport.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusion finale */}
      <div className="bg-gradient-to-r from-violet-500/10 to-violet-600/10 border border-violet-500/20 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Award className="w-8 h-8 text-violet-400" />
          <h2 className="text-2xl font-bold text-violet-400">Parcours Terminé</h2>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
          Du pentester junior au professionnel certifié CPTS - ce parcours a été transformateur. 
          Le chemin était difficile, mais chaque heure investie en valait la peine pour les compétences et la confiance acquises.
        </p>
      </div>
    </div>
  );
};