import React from 'react';
import { Award, Shield, BookOpen, CheckCircle2, Lock, Calendar, FileText, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Formation: React.FC = () => {
  const navigate = useNavigate();

  const handleCertificationClick = () => {
    navigate('/certifications');
  };

  const handleCertificationDetails = (section: string) => {
    navigate('/certifications#' + section);
  };

  return (
    <section className="py-20 bg-[#0d0d12]">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-violet-500" />
            <h2 className="text-3xl font-bold">Formation & Certifications</h2>
          </div>
          <button
            onClick={handleCertificationClick}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-violet-500/10 
                     text-violet-300 rounded-lg hover:bg-violet-500/20 
                     transition-all duration-300 group"
          >
            <span>Voir toutes les certifications</span>
            <Shield className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Grid principale */}
        <div className="grid grid-cols-1 gap-8">
          {/* BTS SIO */}
          <div className="bg-[#1a1a1f] p-6 rounded-lg border border-blue-900/20 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-blue-400">BTS SIO option SISR</h3>
              </div>
              <button
                onClick={() => handleCertificationDetails('bts')}
                className="px-4 py-2 bg-blue-500/10 text-blue-300 rounded-lg 
                         hover:bg-blue-500/20 transition-all duration-300 
                         flex items-center gap-2 group"
              >
                <span>Détails</span>
                <Shield className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            
            <div className="bg-[#2a2a2f] p-6 rounded-lg">
              <div className="flex items-start gap-6">
                <div className="relative shrink-0">
                  <img 
                    src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/BTS-SIO.png"
                    alt="BTS SIO Logo"
                    className="w-32 h-32 object-contain rounded-lg bg-blue-500/10 p-3"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">Services Informatiques aux Organisations</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Solutions d'Infrastructure, Systèmes et Réseaux
                  </p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="text-sm bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full">2025 - 2027</span>
                    <span className="text-sm bg-green-500/10 text-green-300 px-3 py-1 rounded-full flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      En cours
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-1" />
                      <span>Administration des systèmes Windows et Linux</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-1" />
                      <span>Gestion des infrastructures réseau</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-1" />
                      <span>Sécurisation des systèmes d'information</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Grid 2x1 pour CPTS et eJPT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CPTS */}
            <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20 hover:border-violet-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-violet-400" />
                  <h3 className="text-xl font-bold text-violet-400">CPTS</h3>
                </div>
                <button
                  onClick={() => handleCertificationDetails('cpts')}
                  className="px-4 py-2 bg-violet-500/10 text-violet-300 rounded-lg 
                           hover:bg-violet-500/20 transition-all duration-300 
                           flex items-center gap-2 group"
                >
                  <span>Détails</span>
                  <Shield className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <img 
                        src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/assets/CPTS.png"
                        alt="CPTS Badge"
                        className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 object-contain rounded-lg bg-violet-500/10 p-2 transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold mb-2">Certified Penetration Testing Specialist</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Certification avancée en test d'intrusion délivrée par Hack The Box
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="text-sm bg-violet-500/10 text-violet-300 px-3 py-1 rounded-full flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Mars 2025
                    </span>
                    <span className="text-sm bg-green-500/10 text-green-300 px-3 py-1 rounded-full flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Certification obtenue
                    </span>
                  </div>

                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-violet-400 mt-1" />
                      <span>10 jours d'examen pratique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-violet-400 mt-1" />
                      <span>Rapport professionnel de 190 pages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-violet-400 mt-1" />
                      <span>Test d'intrusion complet sur infrastructure réelle</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* eJPT */}
            <div className="bg-[#1a1a1f] p-6 rounded-lg border border-red-900/20 hover:border-red-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-bold text-red-400">eJPT</h3>
                </div>
                <button
                  onClick={() => handleCertificationDetails('ejpt')}
                  className="px-4 py-2 bg-red-500/10 text-red-300 rounded-lg 
                           hover:bg-red-500/20 transition-all duration-300 
                           flex items-center gap-2 group"
                >
                  <span>Détails</span>
                  <Shield className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <div className="bg-[#2a2a2f] p-6 rounded-lg">
                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <img 
                        src="https://srmwnujqhxaopnffesgl.supabase.co/storage/v1/object/public/profile-images/eJPT_badge.webp"
                        alt="eJPT Badge"
                        className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 object-contain rounded-lg bg-red-500/10 p-2 transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold mb-2">eLearnSecurity Junior Penetration Tester</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Certification pratique en test d'intrusion et sécurité offensive
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="text-sm bg-red-500/10 text-red-300 px-3 py-1 rounded-full">Février 2025</span>
                    <span className="text-sm bg-green-500/10 text-green-300 px-3 py-1 rounded-full flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Validé
                    </span>
                  </div>

                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-400 mt-1" />
                      <span>Test d'intrusion black box</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-400 mt-1" />
                      <span>Exploitation de vulnérabilités web</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-400 mt-1" />
                      <span>Post-exploitation et pivoting</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton mobile */}
        <button
          onClick={handleCertificationClick}
          className="w-full mt-8 md:hidden flex items-center justify-center gap-2 px-4 py-3 
                   bg-[#1a1a1f] rounded-lg hover:bg-[#2a2a2f] transition-all duration-300 
                   group transform hover:scale-105"
        >
          <span className="text-sm text-violet-400">Voir toutes les certifications</span>
          <Shield className="w-4 h-4 text-violet-400 transform transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
};