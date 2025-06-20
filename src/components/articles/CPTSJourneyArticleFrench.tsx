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

      {/* 🟣 H1 - Titre principal */}
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent mb-6">
          Mon Expérience Certified Penetration Testing Specialist (CPTS)
        </h1>
      </header>

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

      {/* 🟪 H2 - Introduction & Accroche */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Introduction & Accroche</h2>
          </div>
          
          {/* 🟦 H3 - Maîtriser les 28 Modules CPTS */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Cpu className="w-6 h-6" />
                Maîtriser les 28 Modules CPTS
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Contexte : De l'eJPT au CPTS */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Contexte : De l'eJPT au CPTS</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Pourquoi CPTS Après eJPT ? */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Pourquoi CPTS Après eJPT ?
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - Mon Niveau de Départ */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Mon Niveau de Départ
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Stratégie d'Étude Détaillée */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Stratégie d'Étude Détaillée</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Structure du Parcours d'Apprentissage CPTS */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Structure du Parcours d'Apprentissage CPTS
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - Machines HTB, Modules & Piste d'IppSec */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Monitor className="w-6 h-6" />
                Machines HTB, Modules & Piste d'IppSec
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Feuille de Route de 5 Mois & Sprint Final */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Feuille de Route de 5 Mois & Sprint Final</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Répartition du Temps Mois par Mois */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Répartition du Temps Mois par Mois
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - Sprint Final de 10 Jours */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Sprint Final de 10 Jours
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Outils, Environnement & Prise de Notes */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Outils, Environnement & Prise de Notes</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Exegol : Mon Environnement Offensif */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Exegol : Mon Environnement Offensif
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - SysReptor & Obsidian pour Notes & Rapports */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                SysReptor & Obsidian pour Notes & Rapports
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Semaine d'Examen */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Semaine d'Examen</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Format & Portée de l'Examen */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Format & Portée de l'Examen
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - Répartition Quotidienne */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Répartition Quotidienne
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Le Rapport de 190 Pages */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Le Rapport de 190 Pages</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Stratégie de Rapport en Temps Réel */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Stratégie de Rapport en Temps Réel
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - Procédures vs. Découvertes */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Code className="w-6 h-6" />
                Procédures vs. Découvertes
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - Ce que J'ai Inclus & Pourquoi */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                Ce que J'ai Inclus & Pourquoi
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Plus Grands Défis & Comment Je les ai Surmontés */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Lock className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Plus Grands Défis & Comment Je les ai Surmontés</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Pivoting du Réseau Interne */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Network className="w-6 h-6" />
                Pivoting du Réseau Interne
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - Obstacles d'Exploitation Web */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Code className="w-6 h-6" />
                Obstacles d'Exploitation Web
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Conseils & Astuces - Aide-Mémoire */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Conseils & Astuces - Aide-Mémoire</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Énumération d'Abord, Toujours */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Énumération d'Abord, Toujours
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - Attention aux Pièges */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Attention aux Pièges
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - Gestion du Temps & de l'Énergie Mentale */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Gestion du Temps & de l'Énergie Mentale
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Réflexion Post-Examen & Prochaines Étapes */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <CheckCircle2 className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Réflexion Post-Examen & Prochaines Étapes</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Comparaison CPTS vs OSCP */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Comparaison CPTS vs OSCP
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - Mon Plan pour OSCP, BSCP & Au-Delà */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Mon Plan pour OSCP, BSCP & Au-Delà
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Études Complémentaires & Remerciements */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Database className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Études Complémentaires & Remerciements</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Livres, Labs, Communautés */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Livres, Labs, Communautés
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>

            {/* 🟦 H3 - Personnes qui M'ont Aidé à Grandir */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Personnes qui M'ont Aidé à Grandir
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟪 H2 - Conclusion & Encouragements */}
      <section className="mb-16">
        <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold">Conclusion & Encouragements</h2>
          </div>
          
          <div className="space-y-8">
            {/* 🟦 H3 - Vous Pouvez le Faire Aussi */}
            <div>
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Vous Pouvez le Faire Aussi
              </h3>
              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <p className="text-violet-400 font-semibold mb-2">📝 Contenu à ajouter manuellement</p>
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