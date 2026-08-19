// lib/providers/kanyoza.ts — v2.2 Complete
// All endpoints aligned with Growthbridge public API routes.
// Uses publicConfig only — never imports server secrets.
// Retry logic, mock fallback, unified error handling.

import type { BackendProvider } from '../backend-provider';
import { MockBackendProvider } from './mock';
import type {
  Service, Project, BlogPost, Member, Person, PersonCategory,
  PeopleQueryParams, Testimonial, ImpactStats, ContactFormData,
  ApplicationData, PartnershipData, ApiResponse, SocialFeedItem,
  SocialFeedQueryParams,
} from '@/lib/types';
import type { Settings } from '@/lib/types/admin';
import { publicConfig } from '@/lib/config/public';
import { sanitizePlainText, stripHtml } from '@/lib/utils/validation';
import { BackendUnavailableError } from '../errors';

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

export class KanyozaBackendProvider implements BackendProvider {
  private baseUrl: string;
  private fallbackProvider: MockBackendProvider | null;

  constructor() {
    this.baseUrl = publicConfig.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    this.fallbackProvider = publicConfig.NEXT_PUBLIC_USE_MOCK_DATA
      ? new MockBackendProvider()
      : null;
  }

  private timeoutSignal(timeoutMs = DEFAULT_TIMEOUT_MS): AbortSignal {
    const c = new AbortController();
    setTimeout(() => c.abort(), timeoutMs);
    return c.signal;
  }

  private async fetchWithRetry<T>(
    endpoint: string, options: RequestInit = {}, retries = MAX_RETRIES,
    fallback?: () => Promise<T | null> | T | null
  ): Promise<T | null> {
    let attempt = 0, lastError: unknown = null, lastStatus: number | null = null;
    while (attempt <= retries) {
      try {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          signal: options.signal || this.timeoutSignal(),
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'Growthbridge-Web', ...(options.headers as any || {}) },
          credentials: 'omit', cache: 'no-store', redirect: 'error',
        });
        lastStatus = res.status;
        if (res.status === 404) return null;
        if (res.status === 400 || res.status === 422) return null;
        if (res.status >= 500 && attempt < retries) { attempt++; await new Promise(r => setTimeout(r, 150 * attempt * attempt)); continue; }
        if (!res.ok) throw new Error(`API Error ${res.status}`);
        const json = await res.json();
        return (json.data ?? json) as T;
      } catch (error) {
        lastError = error;
        if ((error as any).name === 'AbortError' && attempt < retries) { attempt++; await new Promise(r => setTimeout(r, 100 * attempt)); continue; }
        break;
      }
    }
    if (fallback && this.fallbackProvider) {
      console.warn(`[Kanyoza] ${endpoint} FAILED (${lastStatus ?? 'network'}). Falling back to mock.`, lastError);
      const fb = fallback();
      if (fb instanceof Promise) return (await fb) as T;
      return fb as T;
    }
    throw new BackendUnavailableError('Growthbridge backend unreachable.', { endpoint, statusCode: lastStatus, cause: lastError });
  }

  async getServices(): Promise<Service[]> {
    const d = await this.fetchWithRetry<{services:Service[]}>('/api/v1/growthbridge/services', {}, MAX_RETRIES, () => ({services: this.fallbackProvider?.getServices() ?? []} as any));
    return (d as any)?.services ?? [];
  }
  async getServiceBySlug(slug: string): Promise<Service | null> {
    const s = sanitizePlainText(slug); if (!s) return null;
    return (await this.fetchWithRetry<Service | null>(`/api/v1/growthbridge/services/${encodeURIComponent(s)}`, {}, MAX_RETRIES, () => this.fallbackProvider?.getServiceBySlug(s) ?? null)) ?? null;
  }

  async getProjects(): Promise<Project[]> {
    const d = await this.fetchWithRetry<{projects:Project[]}>('/api/v1/growthbridge/projects', {}, MAX_RETRIES, () => ({projects: this.fallbackProvider?.getProjects() ?? []} as any));
    return (d as any)?.projects ?? [];
  }
  async getProjectBySlug(slug: string): Promise<Project | null> {
    const s = sanitizePlainText(slug); if (!s) return null;
    return (await this.fetchWithRetry<Project | null>(`/api/v1/growthbridge/projects/${encodeURIComponent(s)}`, {}, MAX_RETRIES, () => this.fallbackProvider?.getProjectBySlug(s) ?? null)) ?? null;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    const d = await this.fetchWithRetry<{posts:BlogPost[]}>('/api/v1/growthbridge/blog', {}, MAX_RETRIES, () => ({posts: this.fallbackProvider?.getBlogPosts() ?? []} as any));
    return (d as any)?.posts ?? [];
  }
  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const s = sanitizePlainText(slug); if (!s) return null;
    return (await this.fetchWithRetry<BlogPost | null>(`/api/v1/growthbridge/blog/${encodeURIComponent(s)}`, {}, MAX_RETRIES, () => this.fallbackProvider?.getBlogPostBySlug(s) ?? null)) ?? null;
  }

  async getSettings(): Promise<Settings> {
    return (await this.fetchWithRetry<Settings>('/api/v1/growthbridge/settings', {}, MAX_RETRIES, () => this.fallbackProvider?.getSettings?.() ?? ({} as Settings))) ?? ({} as Settings);
  }
  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    return (await this.fetchWithRetry<Settings>('/api/v1/growthbridge/settings', {method:'PUT', body:JSON.stringify(data)}, 0, () => this.fallbackProvider?.updateSettings?.(data) ?? ({} as Settings))) ?? ({} as Settings);
  }

  async getSocialFeed(params?: SocialFeedQueryParams): Promise<SocialFeedItem[]> {
    const q = new URLSearchParams();
    if (params?.platform && params.platform !== 'all') q.set('platform', params.platform);
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString() ? `?${q}` : '';
    return (await this.fetchWithRetry<SocialFeedItem[]>(`/api/v1/growthbridge/social-feed${qs}`, {}, MAX_RETRIES, () => this.fallbackProvider?.getSocialFeed?.(params) ?? [])) ?? [];
  }

  async getMembers(): Promise<Member[]> {
    return (await this.getPeople({category:'team'})) as unknown as Member[];
  }
  async getMemberBySlug(slug: string): Promise<Member | null> {
    const p = await this.getPersonBySlug(slug);
    return (p as unknown as Member) ?? null;
  }

  async getPeople(params: PeopleQueryParams = {}): Promise<Person[]> {
    const q = new URLSearchParams();
    if (params.category) q.set('category', params.category);
    if (params.onlyActive) q.set('active', '1');
    if (params.onlyFeatured) q.set('featured', '1');
    if (params.search) q.set('q', params.search);
    const qs = q.toString() ? `?${q}` : '';
    const d = await this.fetchWithRetry<any[]>(`/api/v1/growthbridge/team${qs}`, {}, MAX_RETRIES, () => this.fallbackProvider?.getPeople(params) ?? []);
    return (d ?? []).map(mapApiPersonToModel);
  }
  async getPersonBySlug(slug: string): Promise<Person | null> {
    const s = sanitizePlainText(slug); if (!s) return null;
    const d = await this.fetchWithRetry<any | null>(`/api/v1/growthbridge/team/${encodeURIComponent(s)}`, {}, MAX_RETRIES, () => this.fallbackProvider?.getPersonBySlug(s) ?? null);
    return d ? mapApiPersonToModel(d) : null;
  }
  async getPersonById(id: string): Promise<Person | null> {
    const s = sanitizePlainText(id); if (!s) return null;
    const d = await this.fetchWithRetry<any | null>(`/api/v1/growthbridge/team/id/${encodeURIComponent(s)}`, {}, MAX_RETRIES, () => this.fallbackProvider?.getPersonById?.(s) ?? null);
    return d ? mapApiPersonToModel(d) : null;
  }
  async createPerson(data: Partial<Person>): Promise<Person> {
    const r = await this.fetchWithRetry<any>('/api/v1/growthbridge/team', {method:'POST', body:JSON.stringify(data)}, 0, () => this.fallbackProvider?.createPerson?.(data) ?? null);
    if (!r) throw new BackendUnavailableError('Failed to create person');
    return mapApiPersonToModel(r);
  }
  async updatePerson(id: string, data: Partial<Person>): Promise<Person> {
    const r = await this.fetchWithRetry<any>(`/api/v1/growthbridge/team/id/${encodeURIComponent(id)}`, {method:'PUT', body:JSON.stringify(data)}, 0, () => this.fallbackProvider?.updatePerson?.(id, data) ?? null);
    if (!r) throw new BackendUnavailableError('Failed to update person');
    return mapApiPersonToModel(r);
  }
  async deletePerson(id: string): Promise<boolean> {
    const r = await this.fetchWithRetry<any>(`/api/v1/growthbridge/team/id/${encodeURIComponent(id)}`, {method:'DELETE'}, 0, () => this.fallbackProvider?.deletePerson?.(id) ?? false);
    return Boolean(r);
  }

  async getTestimonials(): Promise<Testimonial[]> {
    const d = await this.fetchWithRetry<{testimonials:any[]}>('/api/v1/growthbridge/testimonials', {}, MAX_RETRIES, () => ({testimonials: this.fallbackProvider?.getTestimonials() ?? []} as any));
    return ((d as any)?.testimonials ?? []).map((t:any) => ({
      id: String(t.id ?? `t-${Math.random().toString(36).slice(2,9)}`),
      quote: stripHtml(String(t.quote ?? t.content ?? t.message ?? '')),
      author: String(t.author ?? t.authorName ?? t.author_name ?? t.name ?? 'Anonymous'),
      role: String(t.role ?? t.authorTitle ?? t.author_title ?? ''),
      organization: String(t.organization ?? ''),
      avatar: t.avatar ?? t.authorAvatar ?? t.image_url ?? undefined,
      rating: typeof t.rating === 'number' ? Math.min(5, Math.max(0, t.rating)) : 5,
      featured: Boolean(t.featured ?? false),
    }));
  }

  async getStats(): Promise<ImpactStats> {
    const d = await this.fetchWithRetry<{stats:ImpactStats}>('/api/v1/growthbridge/stats', {}, MAX_RETRIES, () => ({stats: this.fallbackProvider?.getStats() ?? emptyStats()} as any));
    return (d as any)?.stats ?? emptyStats();
  }

  private sanitizeForm<T extends Record<string,any>>(data: T): T {
    const out: Record<string,any> = {};
    for (const [k,v] of Object.entries(data)) {
      if (typeof v === 'string') out[k] = stripHtml(sanitizePlainText(v));
      else if (Array.isArray(v)) out[k] = v.map(x => typeof x === 'string' ? stripHtml(sanitizePlainText(x)) : x);
      else out[k] = v;
    }
    return out as T;
  }

  private async submitForm<T extends Record<string,any>>(endpoint: string, data: T, mock: () => Promise<ApiResponse>): Promise<ApiResponse> {
    const clean = this.sanitizeForm(data);
    try {
      const r = await this.fetchWithRetry<ApiResponse>(endpoint, {method:'POST', body:JSON.stringify(clean)}, 0);
      if (!r) throw new BackendUnavailableError('Empty response', {endpoint, statusCode:502});
      return r;
    } catch (err) {
      if (this.fallbackProvider) { console.warn(`[Kanyoza] Form ${endpoint} failed; using mock.`, err); return mock(); }
      if (err instanceof BackendUnavailableError) throw err;
      throw new BackendUnavailableError('Submission failed — backend unreachable.', {endpoint, cause:err});
    }
  }

  async submitContact(data: ContactFormData): Promise<ApiResponse> {
    return this.submitForm('/api/v1/growthbridge/contact', data, () => this.fallbackProvider!.submitContact(data).then(r => ({...r, devNote:'⚠️ MOCK — real submission NOT sent.'})));
  }
  async submitApplication(data: ApplicationData): Promise<ApiResponse> {
    return this.submitForm('/api/v1/growthbridge/talent/apply', data, () => this.fallbackProvider!.submitApplication(data).then(r => ({...r, devNote:'⚠️ MOCK — real submission NOT sent.'})));
  }
  async submitPartnership(data: PartnershipData): Promise<ApiResponse> {
    return this.submitForm('/api/v1/growthbridge/partners/apply', data, () => this.fallbackProvider!.submitPartnership(data).then(r => ({...r, devNote:'⚠️ MOCK — real submission NOT sent.'})));
  }
}

function emptyStats(): ImpactStats {
  return { projectsCompleted:0, youthEmpowered:0, communitiesServed:0, clientSatisfaction:0, activeMembers:0, eventsHosted:0 };
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function mapApiPersonToModel(t: any): Person {
  return {
    id: String(t.id ?? `p-${Math.random().toString(36).slice(2,9)}`),
    slug: String(t.slug ?? slugify(String(t.fullName ?? t.name ?? 'person'))),
    category: String(t.category ?? t.personCategory ?? 'team') as PersonCategory,
    fullName: String(t.fullName ?? t.name ?? 'Unnamed'),
    title: String(t.title ?? t.role ?? t.position ?? ''),
    department: String(t.department ?? ''),
    bio: stripHtml(String(t.bio ?? t.biography ?? '')),
    shortBio: stripHtml(String(t.shortBio ?? t.excerpt ?? t.bio ?? '').slice(0, 180)),
    photo: t.photo ?? t.avatar ?? t.image ?? undefined,
    email: t.email ?? undefined,
    phone: t.phone ?? undefined,
    location: t.location ?? undefined,
    joinedAt: t.joinedAt ?? t.startDate ?? undefined,
    skills: Array.isArray(t.skills) ? t.skills.map((s:any) => String(s)) : [],
    certifications: Array.isArray(t.certifications) ? t.certifications.map((c:any) => String(c)) : [],
    socialLinks: {
      linkedin: t.socialLinks?.linkedin ?? t.linkedin ?? undefined,
      github: t.socialLinks?.github ?? t.github ?? undefined,
      twitter: t.socialLinks?.twitter ?? t.twitter ?? undefined,
      website: t.socialLinks?.website ?? t.portfolio ?? t.website ?? undefined,
    },
    projects: Array.isArray(t.projects) ? t.projects.map((p:any) => ({slug:String(p.slug??''), title:String(p.title??p.name??'')})) : [],
    articles: Array.isArray(t.articles) ? t.articles.map((a:any) => ({slug:String(a.slug??''), title:String(a.title??''), publishedAt:a.publishedAt??undefined})) : [],
    displayOrder: typeof t.displayOrder === 'number' ? t.displayOrder : 999,
    featured: Boolean(t.featured ?? false),
    active: t.active === undefined ? true : Boolean(t.active),
    createdAt: t.createdAt ?? undefined,
    updatedAt: t.updatedAt ?? undefined,
  };
}
