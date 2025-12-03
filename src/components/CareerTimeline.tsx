import React from 'react';
import { motion } from 'framer-motion';
import { Network, Server, Terminal, Target, Briefcase, ChevronDown, Sparkles, Zap } from 'lucide-react';

export const CareerTimeline: React.FC = () => {
  const timelineData = [
    {
      year: "2020 - 2023",
      title: "Technicien Fibre Optique",
      subtitle: "Le terrain & la rigueur",
      description: "Interventions critiques sur infrastructures physiques. Gestion du stress, respect strict des procédures et travail en autonomie. La base de ma compréhension du réseau physique.",
      icon: Network,
      color: "blue",
      tags: ["Infrastructure", "Procédures", "Terrain"]
    },
    {
      year: "2024",
      title: "Reconversion Pro & Self-Learning",
      subtitle: "Proactivité & Projets Perso",
      description: "8 mois de discipline autodidacte. Organisation rigoureuse des révisions (TryHackMe, eJPT, CPTS) immédiatement appliquées dans des projets personnels concrets (Home Lab AD, Scripts) pour valider chaque compétence acquise.",
      icon: Server,
      color: "violet",
      tags: ["Autodidacte", "Home Lab", "Révisions"]
    },
    {
      year: "2025 - 2027",
      title: "Alternance Moulinvest",
      subtitle: "Admin Sys/Réseau & Sécurité",
      description: "Une expérience complète. Gestion simultanée du support utilisateur quotidien et de l'administration d'une infrastructure hybride complexe. Encadré par un expert, je mène des projets techniques variés (backlog riche) tout en proposant proactivement des améliorations de sécurité.",
      icon: Briefcase,
      color: "green",
      tags: ["SysAdmin", "Azure Hybride", "Sécurité"]
    },
    {
      year: "Futur",
      title: "L'Horizon",
      subtitle: "Vers une expertise globale", // Plus sobre et pro
      // Description orientée "Vision 360" et "Ingénierie" plutôt que "Hacking pur"
      description: "Mon ambition est de développer une vision transverse des systèmes d'information. Au-delà des silos techniques, je souhaite maîtriser l'ensemble de la chaîne — architecture, développement, infrastructure et sécurité — pour concevoir et maintenir des environnements complexes avec rigueur et pragmatisme.",
      icon: Zap,
      color: "purple",
      tags: ["Vision 360°", "Architecture", "Ingénierie", "Polyvalence"], // Tags plus matures
      isBlurry: true
    }
  ];

  return (
    <section id="timeline" className="py-24 bg-[#0a0a0f] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-900/50 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Trajectoire Professionnelle
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            De l'infrastructure physique à la sécurité offensive : une évolution guidée par la curiosité technique.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Ligne verticale centrale */}
          <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/20 via-violet-500/50 to-purple-500/20 md:-translate-x-1/2" />

          <div className="space-y-12">
            {timelineData.map((item, index) => {
              const isEven = index % 2 === 0;
              const Icon = item.icon;
              
              // Gestion des couleurs dynamiques
              const colorConfig: Record<string, string> = {
                blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/50",
                violet: "text-violet-400 bg-violet-500/10 border-violet-500/20 group-hover:border-violet-500/50",
                green: "text-green-400 bg-green-500/10 border-green-500/20 group-hover:border-green-500/50",
                purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/50"
              };

              const activeClass = colorConfig[item.color];

              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Point central (Icon) */}
                  <div className="absolute left-0 md:left-1/2 w-10 h-10 -translate-x-[1px] md:-translate-x-1/2 flex items-center justify-center rounded-full bg-[#0a0a0f] border-2 border-[#1a1a1f] z-10 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                    <div className={`w-3 h-3 rounded-full ${item.color === 'purple' ? 'bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]' : `bg-${item.color}-500`}`} />
                  </div>

                  {/* Contenu Vide (pour l'alignement sur desktop) */}
                  <div className="hidden md:block flex-1" />

                  {/* Carte de contenu */}
                  <div className="flex-1 pl-12 md:pl-0">
                    <div className={`
                      group relative p-6 rounded-2xl bg-[#1a1a1f] border transition-all duration-500
                      ${activeClass}
                      ${item.isBlurry ? 'backdrop-blur-sm bg-opacity-60 border-dashed' : 'hover:-translate-y-1 hover:shadow-xl'}
                    `}>
                      
                      {/* Date Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5 text-xs font-mono mb-4 text-gray-300">
                        <CalendarIcon className="w-3 h-3" />
                        {item.year}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        {item.title}
                        {item.isBlurry && <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />}
                      </h3>
                      
                      <p className={`text-sm font-medium mb-3 opacity-90 text-${item.color}-400 flex flex-wrap gap-2`}>
                        {item.subtitle}
                      </p>
                      
                      <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        {item.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, i) => (
                          <span key={i} className={`text-[10px] px-2 py-1 rounded border ${item.isBlurry ? 'bg-purple-500/10 border-purple-500/30 text-purple-200' : 'bg-black/30 border-white/5 text-gray-400'}`}>
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Icône de fond décorative */}
                      <Icon className={`absolute right-4 top-4 w-24 h-24 pointer-events-none transition-opacity duration-500 ${item.isBlurry ? 'opacity-[0.05] blur-[2px]' : 'opacity-[0.03]'}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Indicateur de suite */}
          <div className="flex justify-center mt-16">
            <div className="p-4 rounded-full bg-gradient-to-b from-transparent to-purple-500/5 border border-purple-500/20">
               <div className="flex flex-col items-center gap-2 text-gray-500 text-xs font-mono uppercase tracking-widest">
                  <span>Loading Future...</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Petit helper pour l'icône calendrier
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);