import React from 'react';
import { motion } from 'framer-motion';
import { Network, Server, Briefcase, Zap, Calendar, Sparkles } from 'lucide-react';

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
      subtitle: "Vers une expertise globale",
      description: "Mon ambition est de développer une vision transverse des systèmes d'information. Au-delà des silos techniques, je souhaite maîtriser l'ensemble de la chaîne — architecture, développement, infrastructure et sécurité — pour concevoir et maintenir des environnements complexes avec rigueur et pragmatisme.",
      icon: Zap,
      color: "purple",
      tags: ["Vision 360°", "Architecture", "Ingénierie", "Polyvalence"],
      isFuture: true
    }
  ];

  return (
    <section id="timeline" className="py-32 bg-[#0a0a0f] relative overflow-hidden">
      {/* Fond d'ambiance subtil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 uppercase tracking-widest">
              Mon Parcours
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              Trajectoire Professionnelle
            </span>
          </motion.h2>
        </div>

        <div className="max-w-5xl mx-auto relative">
          {/* Ligne verticale centrale (Desktop) / Gauche (Mobile) */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent md:-translate-x-1/2" />

          <div className="space-y-16 md:space-y-24">
            {timelineData.map((item, index) => {
              const isEven = index % 2 === 0;
              const Icon = item.icon;
              
              // Configuration des couleurs
              const colors: Record<string, { bg: string, text: string, border: string, glow: string }> = {
                blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", glow: "group-hover:shadow-blue-500/20" },
                violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20", glow: "group-hover:shadow-violet-500/20" },
                green: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", glow: "group-hover:shadow-emerald-500/20" },
                purple: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", border: "border-fuchsia-500/30", glow: "shadow-[0_0_30px_rgba(192,38,211,0.15)]" }
              };

              const theme = colors[item.color];

              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row gap-8 ${isEven ? 'md:flex-row-reverse' : ''} items-center`}
                >
                  {/* Point Central */}
                  <div className="absolute left-[28px] md:left-1/2 w-4 h-4 rounded-full bg-[#0a0a0f] border-2 border-white/20 z-20 -translate-x-1/2 flex items-center justify-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.isFuture ? 'bg-fuchsia-500 animate-pulse' : 'bg-white'} transition-colors duration-500`} />
                  </div>

                  {/* Connecteur Horizontal (Desktop uniquement) */}
                  <div className={`hidden md:block absolute top-1/2 w-[calc(50%-2rem)] h-px bg-gradient-to-r from-white/5 to-transparent ${isEven ? 'right-[50%] origin-right' : 'left-[50%] origin-left'}`} />

                  {/* Espace vide pour l'alignement */}
                  <div className="hidden md:block flex-1" />

                  {/* Carte */}
                  <div className="flex-1 w-full pl-16 md:pl-0">
                    <div 
                      className={`
                        group relative p-1 rounded-2xl transition-all duration-500
                        ${item.isFuture ? 'hover:scale-[1.01]' : 'hover:-translate-y-1'}
                      `}
                    >
                      {/* Glow effect de fond */}
                      <div className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 ${theme.glow} shadow-2xl`} />
                      
                      {/* Bordure Gradient */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none ${item.isFuture ? 'border border-fuchsia-500/30' : ''}`} />

                      <div className="relative h-full bg-[#13131a] rounded-xl p-6 border border-white/5 overflow-hidden">
                        
                        {/* Fond décoratif icône */}
                        <Icon className={`absolute -right-6 -top-6 w-32 h-32 opacity-[0.03] transition-transform duration-700 group-hover:rotate-12 ${theme.text}`} />

                        {/* En-tête : Date */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wide ${theme.bg} ${theme.text} border ${theme.border}`}>
                            {item.year}
                          </div>
                          {item.isFuture && (
                            <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-fuchsia-500 animate-pulse font-bold">
                              <Sparkles className="w-3 h-3" />
                              Vision
                            </div>
                          )}
                        </div>

                        {/* Titres */}
                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className={`text-sm font-medium mb-4 opacity-80 ${theme.text}`}>
                          {item.subtitle}
                        </p>
                        
                        {/* Description */}
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 border-l-2 border-white/5 pl-4">
                          {item.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, i) => (
                            <span 
                              key={i} 
                              className="px-2.5 py-1 text-[11px] rounded-md bg-white/5 text-gray-400 border border-white/5 group-hover:border-white/10 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Footer Timeline */}
          <div className="flex justify-center mt-24 opacity-30">
            <div className="h-16 w-px bg-gradient-to-b from-white/10 to-transparent" />
          </div>

        </div>
      </div>
    </section>
  );
};