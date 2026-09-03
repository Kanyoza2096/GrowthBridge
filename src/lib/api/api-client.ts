// Browser-safe public/admin API client.
// Never imports server repositories or service-role credentials.
import { createClient } from '@/lib/supabase/client';
import { adminFetch } from './admin-client';
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
} from '@/lib/types';

const supabase = createClient();

function mapService(row: any): Service {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    division: row.division,
    tagline: row.tagline || '',
    description: row.description || '',
    icon: row.icon || 'Code',
    color: row.color || 'blue',
    features: Array.isArray(row.features) ? row.features : [],
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    process: Array.isArray(row.process) ? row.process : [],
    image: row.image || undefined,
    order: row.display_order ?? 0,
  };
}

function mapProject(row: any): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client: row.client,
    category: row.category,
    description: row.description || '',
    shortDescription: row.short_description || row.description?.slice(0, 150) || '',
    image: row.image || '/images/project-placeholder.jpg',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    technologies: Array.isArray(row.technologies) ? row.technologies : [],
    impact: row.impact || { metric: '', value: '', description: '' },
    testimonial: row.testimonial || undefined,
    serviceDivision: row.service_division || 'Growthbridge Digital',
    featured: Boolean(row.featured),
    completedAt: row.completed_at || row.created_at,
    url: row.url || undefined,
  };
}

function mapBlog(row: any): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    content: row.content || '',
    author: { name: row.author_name || 'Growthbridge', avatar: '', role: '' },
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    image: row.cover_image || '/images/blog-placeholder.jpg',
    publishedAt: row.published_at || row.created_at,
    readTime: row.read_time || 0,
    featured: Boolean(row.featured),
  };
}

function mapPerson(row: any): Person {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    fullName: row.full_name,
    title: row.title,
    department: row.department || undefined,
    bio: row.bio || '',
    shortBio: row.short_bio || undefined,
    photo: row.photo || undefined,
    // Never expose PII from public client paths (view already strips these)
    email: undefined,
    phone: undefined,
    location: row.location || undefined,
    joinedAt: row.joined_at || undefined,
    skills: Array.isArray(row.skills) ? row.skills : [],
    certifications: Array.isArray(row.certifications) ? row.certifications : [],
    socialLinks: row.social_links || undefined,
    projects: Array.isArray(row.projects) ? row.projects : [],
    articles: Array.isArray(row.articles) ? row.articles : [],
    displayOrder: row.display_order ?? 0,
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const apiClient = {
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase.from('services').select('*').eq('status', 'published').is('deleted_at', null).order('display_order');
    if (error) throw error;
    return (data || []).map(mapService);
  },

  async getServiceBySlug(slug: string): Promise<Service | null> {
    const { data, error } = await supabase.from('services').select('*').eq('slug', slug).eq('status', 'published').is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data ? mapService(data) : null;
  },

  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase.from('projects').select('*').eq('status', 'published').is('deleted_at', null).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapProject);
  },

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).eq('status', 'published').is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data ? mapProject(data) : null;
  },

  async getBlogPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('status', 'published').is('deleted_at', null).order('published_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapBlog);
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('status', 'published').is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data ? mapBlog(data) : null;
  },

  async getMembers(): Promise<Member[]> {
    const people = await this.getPeople({ category: 'team' });
    return people.map((person) => ({
      id: person.id,
      slug: person.slug,
      fullName: person.fullName,
      role: person.title,
      department: person.department || '',
      bio: person.bio,
      avatar: person.photo || '/images/team-placeholder.jpg',
      skills: person.skills,
      experience: 'intermediate',
      availability: 'available',
      portfolio: person.socialLinks?.website,
      linkedin: person.socialLinks?.linkedin,
      github: person.socialLinks?.github,
      featured: person.featured,
    }));
  },

  async getMemberBySlug(slug: string): Promise<Member | null> {
    const person = await this.getPersonBySlug(slug);
    if (!person) return null;
    return {
      id: person.id,
      slug: person.slug,
      fullName: person.fullName,
      role: person.title,
      department: person.department || '',
      bio: person.bio,
      avatar: person.photo || '/images/team-placeholder.jpg',
      skills: person.skills,
      experience: 'intermediate',
      availability: 'available',
      portfolio: person.socialLinks?.website,
      linkedin: person.socialLinks?.linkedin,
      github: person.socialLinks?.github,
      featured: person.featured,
    };
  },

  async getPeople(params: PeopleQueryParams = {}): Promise<Person[]> {
    const isAdminDirectoryQuery = params.onlyActive === false;
    let query = isAdminDirectoryQuery
      ? supabase.from('people').select('*').is('deleted_at', null).order('display_order')
      : supabase.from('public_people').select('*').order('display_order');
    if (params.category) query = query.eq('category', params.category);
    if (!isAdminDirectoryQuery) query = query.eq('active', true);
    if (params.onlyFeatured) query = query.eq('featured', true);
    if (params.search?.trim()) {
      const q = params.search.trim().replace(/[,()]/g, ' ');
      query = query.or(`full_name.ilike.%${q}%,title.ilike.%${q}%,department.ilike.%${q}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapPerson);
  },

  async getPersonBySlug(slug: string): Promise<Person | null> {
    const { data, error } = await supabase.from('public_people').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data ? mapPerson(data) : null;
  },

  async getPersonById(id: string): Promise<Person | null> {
    const { data, error } = await supabase.from('people').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data ? mapPerson(data) : null;
  },

  async createPerson(data: Partial<Person>): Promise<Person> {
    return adminFetch<Person>('/api/admin/data/people', { method: 'POST', body: JSON.stringify(data) });
  },

  async updatePerson(id: string, data: Partial<Person>): Promise<Person> {
    return adminFetch<Person>(`/api/admin/data/people/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async deletePerson(id: string): Promise<boolean> {
    const result = await adminFetch<{ success: boolean }>(`/api/admin/data/people/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return result.success;
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase.from('testimonials').select('*').eq('status', 'approved').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      quote: row.quote,
      author: row.author_name,
      role: row.author_role || '',
      organization: row.author_organization || '',
      avatar: row.author_avatar || undefined,
      rating: row.rating,
      projectId: row.project_id || undefined,
      serviceId: row.service_id || undefined,
      featured: Boolean(row.featured),
    })) as Testimonial[];
  },

  async getStats(): Promise<ImpactStats> {
    const response = await fetch('/api/public/impact-stats', { cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body?.success || !body?.data) {
      throw new Error(body?.error || 'Impact statistics are unavailable.');
    }
    return body.data as ImpactStats;
  },

  async submitContact(data: ContactFormData): Promise<ApiResponse> {
    const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return response.json();
  },

  async submitApplication(data: ApplicationData): Promise<ApiResponse> {
    const response = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, resume: undefined }) });
    return response.json();
  },

  async submitPartnership(data: PartnershipData): Promise<ApiResponse> {
    const response = await fetch('/api/partner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return response.json();
  },
};
