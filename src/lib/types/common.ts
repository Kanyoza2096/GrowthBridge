// Common shared types for Growthbridge

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

export interface ImpactStats {
  projectsCompleted: number;
  youthEmpowered: number;
  communitiesServed: number;
  clientSatisfaction: number;
  activeMembers: number;
  eventsHosted: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: 'general' | 'partnership' | 'talent';
}

export interface ApplicationData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  skills: string[];
  portfolio?: string;
  linkedin?: string;
  motivation: string;
  resume?: File;
}

export interface PartnershipData {
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  partnershipType: 'sponsor' | 'collaborator' | 'mentor' | 'other';
  message: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
  badge?: string;
}
