import React, { useState, useEffect } from 'react';
import { getOptimizedUrl } from '../lib/imageUtils';
import { 
  FolderGit2, 
  Search, 
  FileText, 
  Eye, 
  ArrowRight,
  Cpu
} from 'lucide-react';
import { ProjectDetail } from './ProjectDetail';
import { ExegolProject } from './projects/ExegolProject';
import { SMBProject } from './projects/SMBProject';
import { ADProject } from './projects/ADProject';
import { SteamDeckProject } from './projects/SteamDeckProject';
import { LinuxMintProject } from './projects/LinuxMintProject';
import { CPTSJourneyProject } from './projects/CPTSJourneyProject';
import { Project } from '../types/project';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from './SEOHead';
import { motion, AnimatePresence } from 'framer-motion'; // ✅ Import ajouté

export const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const allProjects: Project[] = [
    CPTSJourneyProject, 
    LinuxMintProject, 
    ExegolProject, 
    ADProject, 
    SMBProject, 
    SteamDeckProject
  ];

  const filteredProjects = allProjects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleProjectClick = (project: Project) => {
    if (project.articleUrl) {
      navigate(project.articleUrl);
    } else {
      setSelectedProject(project);
    }
  };

  return (
    <>
      <SEOHead 
        title="Projets & Lab | Tristan Barry" 
        description="Portfolio de projets techniques : scripting Python, déploiement d'infrastructure Active Directory, contributions Open Source et Home Lab."
      />

      <div className="min-h-screen pt-32 pb-24 bg-black text-gray-100">
        <div className="container mx-auto px-6">
          
          {/* En-tête */}
          <div className="flex flex-col items-center text-center mb-16">
            <div className="p-4 bg-[#1a1a1f] rounded-2xl border border-white/10 mb-6 shadow-2xl">
              <FolderGit2 className="w-12 h-12 text-violet-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Lab & Projets
            </h1>
            <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
              Déploiements d'infrastructure, scripts d'automatisation et outils de sécurité.
              <br />
              <span className="text-sm font-mono text-violet-400 mt-2 block">
                git clone https://github.com/Trbarry/projects
              </span>
            </p>
          </div>

          {/* Barre de Recherche */}
          <div className="max-w-4xl mx-auto mb-16 sticky top-24 z-30">
            <div className="bg-[#1a1a1f]/90 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">
              <div className="relative flex-1 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm pointer-events-none group-focus-within:text-violet-400 transition-colors">
                  {'>_'}
                </div>
                <input 
                  type="text"
                  placeholder="Rechercher un projet (Python, Active Directory, Bash...)"
                  className="w-full bg-black/50 border border-white/5 rounded-xl py-4 pl-10 pr-4 text-gray-200 placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-violet-500/30 focus:bg-black/80 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Grille des Projets */}
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Code className="w-16 h-16 text-gray-800 mb-4" />
              <h3 className="text-xl font-bold text-gray-500">Aucun projet trouvé</h3>
            </div>
          ) : (
            /* ✅ GRILLE ANIMÉE */
            <motion.div 
              layout 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            >
              <AnimatePresence mode='popLayout'>
                {filteredProjects.map((project, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={index} 
                    onClick={() => handleProjectClick(project)}
                    className="group relative bg-[#1a1a1f] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full
                             hover:border-violet-500/30 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] 
                             transition-all duration-300 cursor-pointer"
                  >
                    {/* Image Header */}
                    <div className="relative h-56 overflow-hidden border-b border-white/5">
                      <div className="absolute inset-0 bg-violet-900/20 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                      <img 
                        src={getOptimizedUrl(project.image, 600)}
                        alt={project.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-[#1a1a1f]/40 to-transparent opacity-90 z-10" />
                      
                      {project.articleUrl && (
                        <div className="absolute top-4 right-4 z-20">
                            <div className="bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg 
                                      flex items-center gap-1.5 text-[10px] font-bold border border-white/10 uppercase tracking-wide">
                              <FileText className="w-3 h-3" />
                              Article
                            </div>
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-6 flex-1 flex flex-col relative z-20">
                      
                      <div className="-mt-10 mb-4">
                           <div className="w-12 h-12 bg-[#1a1a1f] rounded-xl border border-white/10 p-1 flex items-center justify-center shadow-xl group-hover:border-violet-500/50 transition-colors">
                              <Cpu className="w-6 h-6 text-violet-400" />
                           </div>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors mb-3">
                        {project.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3 flex-grow">
                          {project.description}
                      </p>
                      
                      <div className="flex flex-col gap-4 mt-auto">
                          <div className="flex flex-wrap gap-2">
                            {project.tags.slice(0, 3).map((tag, i) => (
                              <span 
                                key={i} 
                                className="text-[10px] uppercase font-bold tracking-wider bg-black text-gray-500 px-2 py-1 rounded border border-white/5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm font-medium">
                              <span className="text-gray-500">Voir les détails</span>
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-violet-600 transition-colors">
                                  {project.articleUrl ? <ArrowRight className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </div>
                          </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            isModal={true}
          />
        )}
      </div>
    </>
  );
};