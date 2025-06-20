import React from 'react';
import { Code, ExternalLink, Github, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { ModalPortal } from './ModalPortal';
import { Project } from '../types/project';
import { useNavigate } from 'react-router-dom';

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
    <div className="bg-[#1a1a1f] rounded-lg border border-violet-900/20 overflow-hidden">
      {/* En-tête avec image */}
      <div className="relative h-[300px] overflow-hidden group">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-[#1a1a1f]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold">{project.title}</h2>
            {project.articleUrl && (
              <button
                onClick={handleArticleClick}
                className="px-4 py-2 bg-violet-500/20 text-violet-300 rounded-lg 
                         hover:bg-violet-500/30 transition-all duration-300 flex items-center gap-2"
              >
                <span>Voir l'article</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, i) => (
              <span
                key={i}
                className="text-sm bg-violet-500/10 text-violet-300 px-3 py-1 rounded-full"
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
          <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-2
            ${project.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{project.status === 'completed' ? 'Projet Terminé' : 'En Développement'}</span>
          </div>
          <span className="text-sm text-gray-400">{project.timeline}</span>
        </div>

        {/* Description et détails */}
        <div className="prose prose-invert max-w-none mb-8">
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            {project.longDescription}
          </p>

          <h3 className="text-xl font-semibold text-violet-400 mb-4">Fonctionnalités</h3>
          <ul className="space-y-3">
            {project.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold text-violet-400 mt-8 mb-4">Détails Techniques</h3>
          <ul className="space-y-3">
            {project.technicalDetails.map((detail, index) => (
              <li key={index} className="flex items-start gap-3">
                <Code className="w-5 h-5 text-violet-400 mt-1" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Liens externes */}
        <div className="flex gap-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2f] hover:bg-[#3a3a3f] 
                       rounded-lg transition-colors group"
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
              className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 
                       rounded-lg transition-colors group"
            >
              <span>Voir le Projet</span>
              <ExternalLink className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
            </a>
          )}
          {project.articleUrl && !isModal && (
            <button
              onClick={handleArticleClick}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-300
                       rounded-lg hover:bg-violet-500/30 transition-colors group ml-auto"
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {Content}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-[#1a1a1f] rounded-full 
                     hover:bg-[#2a2a2f] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </ModalPortal>
  );
};