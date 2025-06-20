import React from 'react';
import { Award, Calendar, Target, BookOpen, Brain, Shield, Terminal, Users, Lightbulb, CheckCircle2, Clock, FileText, Zap, Coffee, Monitor, Network, Lock, Code, ArrowRight, TrendingUp, Cpu, Database } from 'lucide-react';

export const CPTSJourneyArticleFrench: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Image d'illustration CPTS */}
      <div className="relative mb-12">
        <div className="relative h-[300px] md:h-[400px] overflow-hidden rounded-lg border border-violet-900/20">
          <img
            src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/cptsimage.png"
            alt="CPTS Journey - Certified Penetration Testing Specialist"
            className="w-full h-full object-contain bg-[#1a1a1f]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">
                Mon Parcours CPTS : 5 Mois d'Apprentissage Intensif
              </h2>
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
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
            <div className="bg-[#2a2a2f] p-6 rounded-lg mb-6">
              <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              <p className="text-gray-400 text-sm">
                Cette section contiendra l'introduction et l'accroche pour l'article du parcours CPTS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Background: From eJPT to CPTS */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Contexte : De l'eJPT au CPTS</h2>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <div className="bg-[#2a2a2f] p-6 rounded-lg mb-6">
              <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              <p className="text-gray-400 text-sm">
                Cette section couvrira le contexte et la motivation pour poursuivre le CPTS après l'eJPT.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Study Strategy Breakdown */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Stratégie d'Étude Détaillée</h2>
          </div>
          
          <div className="space-y-8">
            {/* Subsection: Tackling the 28 CPTS Modules */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Cpu className="w-6 h-6" />
                Maîtriser les 28 Modules CPTS
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
                <p className="text-gray-400 text-sm">
                  Cette sous-section détaillera l'approche pour étudier les 28 modules CPTS.
                </p>
              </div>
            </div>

            {/* Subsection: HTB Boxes & IppSec's List */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Monitor className="w-6 h-6" />
                Machines HTB & Liste d'IppSec
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
                <p className="text-gray-400 text-sm">
                  Cette sous-section couvrira la pratique des machines HTB et la liste recommandée d'IppSec.
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