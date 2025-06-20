import React from 'react';
import { Code } from 'lucide-react';
import { ProjectDetail } from '../components/ProjectDetail';
import { ExegolProject } from '../components/projects/ExegolProject';
import { SMBProject } from '../components/projects/SMBProject';
import { ADProject } from '../components/projects/ADProject';
import { SteamDeckProject } from '../components/projects/SteamDeckProject';
import { Project } from '../types/project';

export const ProjectsList: React.FC = () => {
  const projects: Project[] = [ExegolProject, ADProject, SMBProject, SteamDeckProject];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-12">
          <Code className="w-8 h-8 text-violet-500" />
          Projets Personnels
        </h1>

        <div className="space-y-16">
          {projects.map((project, index) => (
            <ProjectDetail key={index} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};