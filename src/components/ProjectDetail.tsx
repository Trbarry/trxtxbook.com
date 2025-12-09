import React from 'react';
import { Code, ExternalLink, Github, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { ModalPortal } from './ModalPortal';
import { Project } from '../types/project';
import { useNavigate } from 'react-router-dom';
import { getOptimizedUrl } from '../lib/imageUtils';

interface ProjectDetailProps {
  project: Project;
  onClose?: () => void;
  isModal?: boolean;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose, isModal = false }) => {
  const navigate = useNavigate();

  const handleArticleClick = () => {
    if (project.articleUrl) {
      navigate(project.articleUrl);
    }
  };

  const Content = (
    // ✅ CHANGEMENT : bg-surface et bordure adaptative
    <div className="bg-surface dark:bg-[#1a1a1f] rounded-lg border border-gray-200 dark:border-violet-900/20 overflow-hidden shadow-2xl dark:shadow-none transition-colors duration-300">
      
      {/* En-tête avec image */}
      <div className="relative h-[300px] overflow-hidden group">
        <img
          src={getOptimizedUrl(project.image, 1200)}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* ✅ CHANGEMENT : Gradient adapté au mode jour (from-surface) */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent dark:from-[#1a1a1f] dark:via-[#1a1a1f]/50 dark:to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center justify-between mb-4">
            {/* Titre toujours lisible car sur l'image/gradient */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white relative z-10">{project.title}</h2>
            {project.articleUrl && (
              <button
                onClick={handleArticleClick}
                className="px-4 py-2 bg-white/90 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 rounded-lg 
                         hover:bg-white dark:hover:bg-violet-500/30 transition-all duration-300 flex items-center gap-2 shadow-lg z-10"
              >
                <span>Voir l'article</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 relative z-10">
            {project.tags.map((tag, i) => (
              <span
                key={i}
                className="text-sm bg-gray-100/90 dark:bg-violet-500/10 text-gray-700 dark:text-violet-300 px-3 py-1 rounded-full border border-gray-200/50 dark:border-transparent font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Statut et timeline */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 font-medium border
            ${project.status === 'completed' 
                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-transparent' 
                : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-transparent'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{project.status === 'completed' ? 'Projet Terminé' : 'En Développement'}</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{project.timeline}</span>
        </div>

        {/* Description et détails */}
        {/* ✅ CHANGEMENT : Typography adaptative (prose-gray en jour, invert en nuit) */}
        <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
            {project.longDescription}
          </p>

          <h3 className="text-xl font-semibold text-violet-600 dark:text-violet-400 mb-4">Fonctionnalités</h3>
          <ul className="space-y-3">
            {project.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-1 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold text-violet-600 dark:text-violet-400 mt-8 mb-4">Détails Techniques</h3>
          <ul className="space-y-3">
            {project.technicalDetails.map((detail, index) => (
              <li key={index} className="flex items-start gap-3">
                <Code className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-1 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Liens externes */}
        <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#2a2a2f] hover:bg-gray-200 dark:hover:bg-[#3a3a3f] 
                       text-gray-900 dark:text-white rounded-lg transition-colors group border border-gray-200 dark:border-transparent"
            >
              <Github className="w-5 h-5" />
              <span>Code Source</span>
              <ExternalLink className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 
                       text-white rounded-lg transition-colors group shadow-lg shadow-violet-500/20"
            >
              <span>Voir le Projet</span>
              <ExternalLink className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
            </a>
          )}
          {project.articleUrl && !isModal && (
            <button
              onClick={handleArticleClick}
              className="flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300
                       rounded-lg hover:bg-violet-100 dark:hover:bg-violet-500/30 transition-colors group ml-auto border border-violet-100 dark:border-transparent"
            >
              <span>Lire l'article complet</span>
              <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!isModal) return Content;

  return (
    <ModalPortal>
      <div 
        // Overlay sombre toujours actif pour le focus (standard UX)
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-lg"
          onClick={e => e.stopPropagation()}
        >
          {Content}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white dark:bg-[#1a1a1f] rounded-full 
                     hover:bg-gray-100 dark:hover:bg-[#2a2a2f] transition-colors shadow-lg border border-gray-200 dark:border-transparent text-gray-500 dark:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </ModalPortal>
  );
};