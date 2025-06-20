export interface Project {
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  image: string;
  features: string[];
  technicalDetails: string[];
  githubUrl?: string;
  demoUrl?: string;
  status: 'completed' | 'in-progress';
  timeline: string;
  articleUrl?: string;
}