import React, { useEffect, useState } from 'react';
import { Briefcase, Calendar, MapPin, GraduationCap, Server, Network, Database, Settings, Shield, Code, Laptop } from 'lucide-react';

interface HeroProps {
  isLoaded: boolean;
  setShowProfile: (show: boolean) => void;
}

export const Hero: React.FC<HeroProps> = ({ isLoaded, setShowProfile }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 100); // Attente courte pour éviter le LCP lent
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="pt-32 pb-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80')] 
                   bg-cover bg-center opacity-10 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/95 to-[#0a0a0f]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-4xl transition-all duration-1000 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Grand bloc principal */}
          <div className="bg-[#1a1a1f]/80 backdrop-blur-sm p-8 rounded-lg border border-violet-500/20 
                       hover:border-violet-500/50 transition-all duration-300 mb-8">
            {/* En-tête avec nom et titre */}
            <div className="flex items-center gap-3 mb-6">
              <Laptop className="w-8 h-8 text-violet-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-violet-600 to-violet-400 
                         bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Tristan Barry
              </h1>
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-xl text-gray-300">
                Alternant Technicien Informatique
              </p>
              <p className="text-lg text-violet-400">
                Spécialisé en Infrastructure et Réseaux
              </p>
            </div>

            {/* Section Alternance */}
            <div className="bg-violet-500/10 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="w-6 h-6 text-violet-500" />
                <h2 className="text-xl font-bold text-violet-400">Recherche Alternance 2025</h2>
              </div>
              
              <p className="text-base text-gray-300 mb-6 leading-relaxed">
                En recherche active d'une alternance en informatique pour septembre 2025. 
                Passionné par les systèmes et réseaux, je souhaite combiner formation académique 
                et expérience professionnelle pour développer mes compétences techniques.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: GraduationCap, title: "Formation", text: "BTS SIO option SISR" },
                  { icon: Calendar, title: "Rythme", text: "2 semaines entreprise / 2 semaines formation" },
                  { icon: MapPin, title: "Localisation", text: "Saint-Étienne et Lyon" }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="bg-[#1a1a1f] p-4 rounded-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <item.icon className="w-5 h-5 text-violet-400 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-gray-400 text-sm">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Présentation et compétences */}
            <p className="text-gray-300 leading-relaxed mb-8">
              Passionné d'informatique et de technologies, j'ai 27 ans et je suis actuellement en reconversion professionnelle. 
              Mon parcours atypique en tant que technicien fibre optique m'a permis de développer une approche unique de l'IT, 
              combinant expertise technique et engagement constant dans l'apprentissage des nouvelles technologies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Server, title: "Infrastructure IT", text: "Administration système, réseaux et maintenance informatique" },
                { icon: Code, title: "Projets Techniques", text: "Réalisations et documentation de projets IT" },
                { icon: Shield, title: "Cybersécurité", text: "Sécurisation et audit des systèmes d'information" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="bg-[#2a2a2f] p-4 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-5 h-5 text-violet-400" />
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{item.text}</p>
                </div>
              ))}
            </div>

            {
