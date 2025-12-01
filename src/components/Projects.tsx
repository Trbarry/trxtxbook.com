import React, { useState } from 'react';
import { Code, ExternalLink, FileText, FolderGit2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectDetail } from './ProjectDetail';
import { Project } from '../types/project';
import { SMBProject } from './projects/SMBProject';
import { ADProject } from './projects/ADProject';
import { SteamDeckProject } from './projects/SteamDeckProject';
import { ExegolProject } from './projects/ExegolProject';
import { LinuxMintProject } from './projects/LinuxMintProject';
import { CPTSJourneyProject } from './projects/CPTSJourneyProject';
import { getOptimizedUrl } from '../lib/imageUtils';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Liste de tes projets importés
  const projects: Project[] = [
    CPTSJourneyProject, 
    LinuxMintProject, 
    ExegolProject, 
    ADProject, 
    SMBProject, 
    SteamDeckProject
  ];

  const handleProjectClick = (project: Project) => {
    if (project.articleUrl) {
      navigate(project.articleUrl);
    } else {
      setSelectedProject(project);
    }
  };

  return (
    <section id="projects" className="py-24 bg-[#0a0a0f] relative overflow-hidden">
      {/* Suppression des éléments de fond décoratifs (lignes et blobs violets) */}

      <div className="container mx-auto px-6 relative z-10">
        {/* En-tête de section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center md:justify-start gap-3 mb-2">
              <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                <FolderGit2 className="w-8 h-8 text-violet-400" />
              </div>
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Lab & Projets Personnels
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mt-4">
                De l'administration système à la cybersécurité : découvrez mes déploiements, scripts et documentations techniques.
            </p>
          </div>

          <button
            onClick={() => navigate('/projects')}
            className="group flex items-center gap-2 text-sm font-medium bg-[#1a1a1f] text-gray-300 px-5 py-3 rounded-xl
                     border border-white/10 hover:border-violet-500/50 hover:text-white hover:bg-violet-500/10 transition-all duration-300"
          >
            <span>Voir la bibliothèque complète</span>
            <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Grille des Projets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div 
              key={index} 
              onClick={() => handleProjectClick(project)}
              className="group relative bg-[#1a1a1f] rounded-2xl border border-white/5 overflow-hidden
                        hover:border-violet-500/50 transition-all duration-300 cursor-pointer
                        hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] flex flex-col h-full"
            >
              {/* Conteneur Image */}
              <div className="relative h-56 overflow-hidden">
                {/* Overlay violet au repos, disparaît au survol */}
                <div className="absolute inset-0 bg-violet-900/20 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                
                <img 
                src={getOptimizedUrl(project.image, 600)}
                alt={project.title}
                loading="lazy"
                className="..."
                />
                
                {/* Dégradé bas pour lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-[#1a1a1f]/40 to-transparent opacity-90 z-10" />
                
                {/* Badge Article si disponible */}
                {project.articleUrl && (
                  <div className="absolute top-4 right-4 z-20">
                      <div className="bg-violet-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg 
                                flex items-center gap-1.5 text-xs font-bold shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <FileText className="w-3.5 h-3.5" />
                        Article disponible
                      </div>
                  </div>
                )}
              </div>

              {/* Contenu Carte */}
              <div className="p-6 pt-0 flex-1 flex flex-col relative z-20">
                {/* Icône flottante sur la bordure image/texte */}
                <div className="-mt-8 mb-4">
                     <div className="w-14 h-14 bg-[#1a1a1f] rounded-xl border border-white/10 p-1 flex items-center justify-center shadow-xl group-hover:border-violet-500/50 transition-colors">
                        <Code className="w-6 h-6 text-violet-400" />
                     </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors mb-3 line-clamp-1">
                  {project.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3 flex-grow">
                    {project.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tags.slice(0, 3).map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] uppercase font-bold tracking-wider bg-violet-500/5 text-violet-300 px-2 py-1 rounded border border-violet-500/10"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                      <span className="text-[10px] px-2 py-1 text-gray-500 font-medium">+ {project.tags.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de détail (si pas d'article dédié) */}
        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            isModal={true}
          />
        )}
      </div>
    </section>
  );
};