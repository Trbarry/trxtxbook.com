import React, { useState } from 'react';
import { Code, ExternalLink, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectDetail } from './ProjectDetail';
import { Project } from '../types/project';
import { SMBProject } from './projects/SMBProject';
import { ADProject } from './projects/ADProject';
import { SteamDeckProject } from './projects/SteamDeckProject';
import { ExegolProject } from './projects/ExegolProject';
import { LinuxMintProject } from './projects/LinuxMintProject';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects: Project[] = [LinuxMintProject, ExegolProject, ADProject, SMBProject, SteamDeckProject];

  const handleProjectClick = (project: Project) => {
    if (project.articleUrl) {
      navigate(project.articleUrl);
    } else {
      setSelectedProject(project);
    }
  };

  return (
    <section className="py-20 bg-[#0d0d12]">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Code className="w-8 h-8 text-violet-500" />
            Projets Personnels
          </h2>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-sm bg-violet-500/10 px-4 py-2 rounded-lg
                     hover:bg-violet-500/20 transition-colors group"
          >
            <span>Voir tous les projets</span>
            <ExternalLink className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div 
              key={index} 
              onClick={() => handleProjectClick(project)}
              className="cyber-card bg-[#1a1a1f] rounded-lg border border-violet-900/20
                        hover:border-violet-500/50 transition-all duration-300 overflow-hidden
                        cursor-pointer transform hover:-translate-y-1 relative"
            >
              <div className="relative overflow-hidden group">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-48 object-cover transition-transform duration-300
                           group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent opacity-50" />
                {project.articleUrl && (
                  <div className="absolute top-4 right-4 bg-violet-500 text-white px-4 py-2 rounded-lg 
                                flex items-center gap-2 shadow-lg animate-pulse hover:animate-none
                                transition-all duration-300 hover:bg-violet-600 hover:scale-105
                                border border-violet-400/20">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Lire l'article</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold group-hover:text-violet-400 transition-colors mb-3">
                  {project.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-xs bg-violet-500/10 text-violet-300 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

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