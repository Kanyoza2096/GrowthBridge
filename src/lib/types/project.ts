// Project type definitions

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: ProjectCategory;
  description: string;
  shortDescription: string;
  image: string;
  gallery?: string[];
  technologies: string[];
  impact: ProjectImpact;
  testimonial?: ProjectTestimonial;
  serviceDivision: string;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  completedAt: string;
  url?: string;
}

export type ProjectCategory =
  | 'web-development'
  | 'mobile-app'
  | 'branding'
  | 'community'
  | 'training'
  | 'events'
  | 'consulting';

export interface ProjectImpact {
  metric: string;
  value: string;
  description: string;
}

export interface ProjectTestimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  'web-development': 'Web Development',
  'mobile-app': 'Mobile App',
  branding: 'Branding & Design',
  community: 'Community Impact',
  training: 'Training & Skills',
  events: 'Events',
  consulting: 'Consulting',
};
