export interface Certification {
  title: string;
  platform: string;
  issueDate: string;
  description: string;
  details: string[];
  skills: string[];
  verificationUrl?: string;
  certificateUrl?: string;
  completionTime?: string;
  type: 'ejpt' | 'thm' | 'bts';
  validated?: boolean;
}