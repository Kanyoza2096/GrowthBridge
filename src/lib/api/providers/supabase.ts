// src/lib/api/providers/supabase.ts
import type { BackendProvider } from '../backend-provider';
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
import { servicesService } from '@/services/services.service';
import { projectsService } from '@/services/projects.service';
import { blogService } from '@/services/blog.service';
import { peopleService } from '@/services/people.service';
import { TestimonialsRepository } from '@/repositories/testimonials.repository';
import { ImpactStatsRepository } from '@/repositories/impact-stats.repository';
import { SettingsRepository } from '@/repositories/settings.repository';
import { contactService } from '@/services/contact.service';
import { applicationsService } from '@/services/applications.service';

export class SupabaseBackendProvider implements BackendProvider {
  private testimonialsRepo = new TestimonialsRepository();
  private statsRepo = new ImpactStatsRepository();
  private settingsRepo = new SettingsRepository();

  async getServices(): Promise<Service[]> {
    return servicesService.getServices();
  }

  async getServiceBySlug(slug: string): Promise<Service | null> {
    return servicesService.getServiceBySlug(slug);
  }

  async getProjects(): Promise<Project[]> {
    return projectsService.getProjects();
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    return projectsService.getProjectBySlug(slug);
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return blogService.getBlogPosts();
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return blogService.getBlogPostBySlug(slug);
  }

  async getMembers(): Promise<Member[]> {
    const people = await peopleService.getPeople({ category: 'team' });
    return people as unknown as Member[];
  }

  async getMemberBySlug(slug: string): Promise<Member | null> {
    const person = await peopleService.getPersonBySlug(slug);
    return (person as unknown as Member) || null;
  }

  async getSocialFeed(params?: SocialFeedQueryParams): Promise<SocialFeedItem[]> {
    // Return empty list or fallback feed items
    return [];
  }

  async getPeople(params?: PeopleQueryParams): Promise<Person[]> {
    return peopleService.getPeople(params);
  }

  async getPersonBySlug(slug: string): Promise<Person | null> {
    return peopleService.getPersonBySlug(slug);
  }

  async getPersonById(id: string): Promise<Person | null> {
    return peopleService.getPersonById(id);
  }

  async createPerson(data: Partial<Person>): Promise<Person> {
    return peopleService.createPerson(data);
  }

  async updatePerson(id: string, data: Partial<Person>): Promise<Person> {
    return peopleService.updatePerson(id, data);
  }

  async deletePerson(id: string): Promise<boolean> {
    return peopleService.deletePerson(id);
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return this.testimonialsRepo.getAll();
  }

  async getStats(): Promise<ImpactStats> {
    return this.statsRepo.getStats();
  }

  async getSettings(): Promise<Settings> {
    return this.settingsRepo.getSettings();
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    return this.settingsRepo.updateSettings(data);
  }

  async submitContact(data: ContactFormData): Promise<ApiResponse> {
    return contactService.submitContact(data);
  }

  async submitApplication(data: ApplicationData): Promise<ApiResponse> {
    const app = await applicationsService.createApplication({
      type: 'talent',
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      skills: data.skills,
      portfolio: data.portfolio,
      message: data.motivation,
    });
    return { success: Boolean(app.id), message: 'Application received.' };
  }

  async submitPartnership(data: PartnershipData): Promise<ApiResponse> {
    return contactService.submitPartnership(data);
  }
}
