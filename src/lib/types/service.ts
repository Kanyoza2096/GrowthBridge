// Service type definitions

export interface Service {
  id: string;
  slug: string;
  title: string;
  division: ServiceDivision;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  benefits: string[];
  process: ProcessStep[];
  image?: string;
  order: number;
}

export type ServiceDivision =
  | 'digital'
  | 'business'
  | 'people'
  | 'community'
  | 'events';

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon?: string;
}

export const DIVISION_LABELS: Record<ServiceDivision, string> = {
  digital: 'Growthbridge Digital',
  business: 'Growthbridge Business',
  people: 'Growthbridge People',
  community: 'Growthbridge Community',
  events: 'Growthbridge Events',
};
