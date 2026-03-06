import React from 'react';
import { Users, Award } from 'lucide-react';

export const ConclusionSection: React.FC = () => (
  <>
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
                Le vrai secret pour progresser en cybersécurité, c’est <strong>le travail, la patience et la résilience</strong>.
              </p>
              <p className="text-violet-300 font-semibold text-lg mt-4">
                N’abandonne jamais. Le progrès est inévitable !
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
        D’apprenti pentester à certifié CPTS — ce parcours m’a transformé.
      </p>
    </div>
  </>
);
