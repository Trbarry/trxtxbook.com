import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Code, Clock, Tag } from 'lucide-react';
import { useProject } from '../hooks/useProject';
import { SEOHead } from '../components/SEOHead';
import { getOptimizedUrl } from '../lib/imageUtils';

export const ProjectPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { project, isLoading } = useProject(slug ?? '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-gray-400 text-lg">Projet introuvable.</p>
        <button onClick={() => navigate('/projects')} className="text-violet-400 hover:text-violet-300 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour aux projets
        </button>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${project.title} | Tristan Barry`}
        description={project.description}
        url={`https://trxtxbook.com/projects/${project.slug}`}
      />

      <div className="min-h-screen bg-background pt-24 pb-20 transition-colors duration-300">

        {/* Hero image */}
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img
            src={getOptimizedUrl(project.image_url, 1400)}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Back button */}
          <button
            onClick={() => navigate('/projects')}
            className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium bg-black/50 backdrop-blur-sm
                       text-white px-4 py-2 rounded-xl border border-white/10 hover:bg-black/70 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Projets
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">

          {/* Header card */}
          <div className="bg-surface dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-2xl p-8 mb-8 shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {project.title}
              </h1>
              <div className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 font-medium border shrink-0
                ${project.status === 'completed'
                  ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20'
                  : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {project.status === 'completed' ? 'Terminé' : 'En cours'}
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-mono mb-6">
              <Clock className="w-4 h-4" />
              {project.timeline}
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
              {project.long_description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider
                                         bg-violet-500/5 text-violet-600 dark:text-violet-400 px-3 py-1.5 rounded-lg border border-violet-500/10">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Two-column features + tech */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">

            {/* Features */}
            <div className="bg-surface dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-violet-500" />
                Fonctionnalités
              </h2>
              <ul className="space-y-3">
                {project.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical details */}
            <div className="bg-surface dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <Code className="w-5 h-5 text-violet-500" />
                Détails Techniques
              </h2>
              <ul className="space-y-3">
                {project.technical_details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 font-mono">
                    <span className="text-violet-500 shrink-0 mt-0.5">›</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Back button bottom */}
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à tous les projets
          </button>
        </div>
      </div>
    </>
  );
};
