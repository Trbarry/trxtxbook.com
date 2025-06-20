import React from 'react';
import { Briefcase, GraduationCap, Target, Users, Brain, Lightbulb } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#1a1a1f] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-violet-900/20 hover:border-violet-500/50 transition-all duration-300 shadow-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              Tristan Barry
            </h2>
            <p className="text-gray-400">Alternant Technicien Informatique</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-violet-400 transition-colors bg-[#2a2a2f]/80 p-2 rounded-full
                     hover:bg-[#2a2a2f] backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Section Alternance */}
        <div className="bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/50 rounded-lg p-6 mb-8 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-6 h-6 text-violet-500" />
            <h3 className="text-xl font-bold text-violet-400">Recherche Alternance 2025</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#2a2a2f] p-4 rounded-lg border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Formation</span>
              </div>
              <p className="text-gray-400">BTS SIO option SISR</p>
            </div>
            <div className="bg-[#2a2a2f] p-4 rounded-lg border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Rythme</span>
              </div>
              <p className="text-gray-400">2 semaines entreprise / 2 semaines formation</p>
            </div>
            <div className="bg-[#2a2a2f] p-4 rounded-lg border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Localisation</span>
              </div>
              <p className="text-gray-400">Saint-Étienne et Lyon</p>
            </div>
          </div>
        </div>

        {/* À Propos de Moi */}
        <div className="bg-[#2a2a2f] p-6 rounded-lg mb-8 border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
          <h3 className="text-xl font-semibold text-violet-400 mb-4">À Propos de Moi</h3>
          <div className="space-y-4">
            <p className="leading-relaxed">
              Passionné d'informatique, de cybersécurité et de hacking éthique, je suis Tristan Barry, 27 ans, actuellement en reconversion professionnelle. 
              Mon parcours, débuté comme technicien réseau fibre optique, m'a conduit vers l'informatique et sa sécurité, un domaine qui répond 
              parfaitement à ma philosophie : une journée sans apprendre est une journée perdue.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-violet-400">Parcours Professionnel</h4>
              <p className="text-gray-400">
                Mon expérience en tant que technicien fibre optique m'a doté de compétences précieuses en :
              </p>
              <ul className="list-disc list-inside text-gray-400 ml-4 space-y-1">
                <li>Installation et maintenance d'infrastructures de communication</li>
                <li>Résolution de problèmes techniques complexes</li>
                <li>Gestion de projets et coordination d'équipe</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-violet-400">Passion pour la Technologie</h4>
              <p className="text-gray-400">
                Mon intérêt pour la cybersécurité et le hacking éthique m'a conduit à une formation autodidacte 
                approfondie. Je me concentre particulièrement sur :
              </p>
              <ul className="list-disc list-inside text-gray-400 ml-4 space-y-1">
                <li>Protection des données et sécurité des systèmes</li>
                <li>Tests d'intrusion et analyse de vulnérabilités</li>
                <li>Développement de compétences en réseau et système</li>
                <li>Veille technologique continue</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Soft Skills de la Fibre */}
        <div className="bg-[#2a2a2f] p-6 rounded-lg mb-8 border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-violet-400" />
            <h3 className="text-xl font-semibold text-violet-400">Soft Skills acquis en Fibre Optique</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-[#1a1a1f] p-4 rounded-lg border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
                <Users className="w-5 h-5 text-violet-400 mt-1" />
                <div>
                  <h4 className="font-semibold">Travail en équipe</h4>
                  <p className="text-gray-400 text-sm">Communication efficace et coordination d'équipe</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#1a1a1f] p-4 rounded-lg border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
                <Brain className="w-5 h-5 text-violet-400 mt-1" />
                <div>
                  <h4 className="font-semibold">Gestion du stress</h4>
                  <p className="text-gray-400 text-sm">Résolution de problèmes sous pression</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-[#1a1a1f] p-4 rounded-lg border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
                <Lightbulb className="w-5 h-5 text-violet-400 mt-1" />
                <div>
                  <h4 className="font-semibold">Autonomie</h4>
                  <p className="text-gray-400 text-sm">Prise d'initiative et décision rapide</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#1a1a1f] p-4 rounded-lg border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
                <Target className="w-5 h-5 text-violet-400 mt-1" />
                <div>
                  <h4 className="font-semibold">Attention aux détails</h4>
                  <p className="text-gray-400 text-sm">Rigueur et minutie dans le travail</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Objectifs */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-violet-400 mb-3">Objectif à Court Terme</h3>
            <div className="bg-[#2a2a2f] p-4 rounded-lg border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
              <p className="text-gray-400">
                Intégrer une alternance pour mettre en pratique mes compétences en informatique, tout en continuant 
                de me former en cybersécurité et hacking éthique. Le rythme alterné permettra de concilier théorie et pratique 
                de manière optimale.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-violet-400 mb-3">Objectif à Long Terme</h3>
            <div className="bg-[#2a2a2f] p-4 rounded-lg border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300">
              <p className="text-gray-400">
                Devenir expert en hacking éthique certifié en combinant mes compétences en cybersécurité, mes futures certifications 
                (CPTS, OSCP) et une expérience pratique continue. L'alternance est une étape clé pour développer des 
                compétences solides en informatique, réseau, système et développement.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/50 rounded-lg p-4 mt-8 transition-all duration-300">
          <p className="text-violet-400 font-semibold italic text-center">
            "Une journée sans apprendre est une journée perdue"
          </p>
        </div>
      </div>
    </div>
  );
};