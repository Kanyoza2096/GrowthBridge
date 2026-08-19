// Backend Provider Interface
// All backend implementations must conform to this contract

import type {
  Service,
  Project,
  BlogPost,
  Member,
  Person,
  PeopleQueryParams,
  Testimonial,
  ImpactStats,
  ContactFormData,
  ApplicationData,
  PartnershipData,
  ApiResponse,
  SocialFeedItem,
  SocialFeedQueryParams,
} from '@/lib/types';
import type { Settings } from '@/lib/types/admin';

export interface BackendProvider {
  // Content retrieval
  getServices(): Promise<Service[]>;
  getServiceBySlug(slug: string): Promise<Service | null>;
  getProjects(): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | null>;
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | null>;
  getMembers(): Promise<Member[]>;
  getMemberBySlug(slug: string): Promise<Member | null>;

  // Social Media Aggregator
  getSocialFeed?(params?: SocialFeedQueryParams): Promise<SocialFeedItem[]>;

  // People Module (6 categories)
  getPeople(params?: PeopleQueryParams): Promise<Person[]>;
  getPersonBySlug(slug: string): Promise<Person | null>;
  getPersonById?(id: string): Promise<Person | null>;
  createPerson?(data: Partial<Person>): Promise<Person>;
  updatePerson?(id: string, data: Partial<Person>): Promise<Person>;
  deletePerson?(id: string): Promise<boolean>;

  getTestimonials(): Promise<Testimonial[]>;
  getStats(): Promise<ImpactStats>;

  // Settings Management
  getSettings?(): Promise<Settings>;
  updateSettings?(data: Partial<Settings>): Promise<Settings>;

  // Form submissions
  submitContact(data: ContactFormData): Promise<ApiResponse>;
  submitApplication(data: ApplicationData): Promise<ApiResponse>;
  submitPartnership(data: PartnershipData): Promise<ApiResponse>;
}

