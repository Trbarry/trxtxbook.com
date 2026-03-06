import React from 'react';
import { Clock, Target, Shield, Terminal, Network, ListChecks, Brain, FileText, Calendar, Zap } from 'lucide-react';

export const ExamWeekSection: React.FC = () => (
  <section className="mb-16">
    <div className="bg-[#1a1a1f] p-8 rounded-lg border border-violet-900/20">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="w-8 h-8 text-violet-400" />
        <h2 className="text-3xl font-bold">Semaine d’examen</h2>
      </div>
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Format & périmètre de l’examen
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-violet-400" />
              <h4 className="text-xl font-semibold text-violet-300">Examen CPTS : Pentest Réaliste</h4>
            </div>
            <p className="text-gray-300">
              L’examen CPTS simule une <strong>vraie mission offensive</strong>. C’est ce qui se rapproche le plus d’un vrai pentest en certification.
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-semibold text-violet-300">Scénario d’engagement</span>
            </div>
            <p className="text-gray-300">
              Périmètre précis via une lettre d’engagement. Mission : <strong>compromettre entièrement deux domaines AD</strong>.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Déroulé journalier
          </h3>
          <div className="bg-[#2a2a2f] p-6 rounded-lg space-y-6">
            <p className="text-gray-300">
              L’examen dure <strong>10 jours</strong>. J’ai bossé environ 7h par jour.
            </p>
            <div className="bg-violet-900/20 rounded-lg p-4">
              <Zap className="w-6 h-6 text-violet-400 mb-2" />
              <span className="text-gray-300">
                Utilise la méthode <strong>trigger-based</strong> pour le reporting : documente chaque découverte immédiatement.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
