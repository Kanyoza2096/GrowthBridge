import { z } from 'zod';

const id = z.string().uuid().optional();
const text = (max = 10_000) => z.string().max(max);
const httpUrl = z.string().url().refine((value) => /^https?:$/i.test(new URL(value).protocol), 'URL must use http:// or https://');
const optionalUrl = httpUrl.or(z.literal('')).nullable().optional();

const schemas = {
  services: z.object({ id, status: z.enum(['draft','published','archived']).optional(), slug: text(180), title: text(200), division: text(80), description: text(20_000), tagline: text(500).optional(), image: optionalUrl, features: z.array(z.unknown()).max(200).optional(), benefits: z.array(z.unknown()).max(200).optional(), process: z.array(z.unknown()).max(200).optional() }),
  projects: z.object({ id, status: z.enum(['draft','published','archived']).optional(), slug: text(180), title: text(200), client: text(200), category: text(100), description: text(20_000), shortDescription: text(1_000).optional(), image: optionalUrl, gallery: z.array(httpUrl).max(100).optional(), technologies: z.array(text(100)).max(100).optional(), featured: z.boolean().optional(), completedAt: z.string().optional(), url: optionalUrl }),
  blog: z.object({ id, slug: text(180), title: text(200), excerpt: text(2_000).optional(), content: text(100_000), category: text(100), tags: z.array(text(100)).max(100).optional(), image: optionalUrl, readTime: z.number().int().min(0).max(1_000).optional(), featured: z.boolean().optional() }),
  people: z.object({ id, slug: text(180), fullName: text(200), title: text(200), category: text(80), department: text(200).optional(), bio: text(20_000).optional(), shortBio: text(2_000).optional(), photo: optionalUrl, email: z.string().email().or(z.literal('')).optional(), phone: text(50).optional(), location: text(200).optional(), skills: z.array(text(100)).max(100).optional(), certifications: z.array(text(200)).max(100).optional(), featured: z.boolean().optional(), active: z.boolean().optional(), displayOrder: z.number().int().min(0).max(1_000_000).optional() }),
  testimonials: z.object({ id, quote: text(10_000), author: text(200), role: text(200).optional(), organization: text(200).optional(), avatar: optionalUrl, rating: z.number().int().min(1).max(5).optional(), featured: z.boolean().optional() }),
  talent: z.object({ id, name: text(200), email: z.string().email(), phone: text(50).optional(), bio: text(20_000).optional(), skills: z.array(text(100)).max(100).optional(), experience: z.number().min(0).max(100).optional(), experienceLevel: text(50).optional(), portfolio: optionalUrl, resume: optionalUrl, availability: text(50).optional(), verificationStatus: text(50).optional(), categories: z.array(text(100)).max(100).optional() }),
  applications: z.object({ id, type: text(50), name: text(200), email: z.string().email(), phone: text(50).optional(), subject: text(500).optional(), message: text(20_000).optional(), role: text(200).optional(), skills: z.array(text(100)).max(100).optional(), portfolio: optionalUrl, status: text(50).optional(), assignee: z.string().uuid().or(z.literal('')).nullable().optional(), notes: z.array(z.unknown()).max(500).optional(), history: z.array(z.unknown()).max(500).optional() }),
  faqs: z.object({ id, question: text(1_000), answer: text(20_000), category: text(100), order: z.number().int().min(0).max(1_000_000).optional(), status: text(50).optional() }),
  announcements: z.object({ id, title: text(200), content: text(20_000), type: text(50).optional(), priority: text(50).optional(), audience: text(100).optional(), status: text(50).optional(), scheduledAt: z.string().optional(), publishedAt: z.string().optional(), expiresAt: z.string().optional() }),
  partners: z.object({ id, organizationName: text(300), contactPerson: text(200), email: z.string().email(), phone: text(50).optional(), website: optionalUrl, logo: optionalUrl, industry: text(200).optional(), description: text(20_000).optional(), status: text(50).optional(), partnershipType: text(100).optional(), partnershipStartDate: z.string().optional(), partnershipEndDate: z.string().optional(), address: text(500).optional(), notes: text(20_000).optional() }),
  settings: z.object({
    organization: z.object({ name: text(200).optional(), tagline: text(500).optional(), description: text(5000).optional(), logo: optionalUrl, address: text(500).optional(), phone: text(50).optional(), email: z.string().email().optional() }).optional(),
    social: z.record(httpUrl).optional(),
    seo: z.object({ defaultTitle: text(300).optional(), defaultDescription: text(2000).optional(), defaultKeywords: z.array(text(100)).max(100).optional() }).optional(),
    email: z.object({ fromAddress: z.string().email().optional(), fromName: text(200).optional() }).optional(),
    api: z.object({ enablePublicApi: z.boolean().optional(), rateLimitPerMinute: z.number().int().min(1).max(100000).optional() }).optional(),
    features: z.record(z.boolean()).optional(),
  }),
};

export function validateAdminResourcePayload(resource: string, body: unknown, action: 'create' | 'update') {
  const canonical = resource === 'team' ? 'people' : resource;
  const schema = schemas[canonical as keyof typeof schemas];
  if (!schema) return { success: false as const, error: 'This resource does not accept JSON mutations.' };

  const result = schema.safeParse(body);
  if (!result.success) {
    return { success: false as const, error: result.error.issues[0]?.message || 'Invalid request payload.' };
  }

  // Creation requires the fields the repository cannot safely infer.
  if (action === 'create') {
    const requiredByResource: Record<string, string[]> = {
      services: ['slug', 'title', 'description'],
      projects: ['slug', 'title', 'client', 'category', 'description'],
      blog: ['slug', 'title', 'content', 'category'],
      people: ['slug', 'fullName', 'title', 'category'],
      testimonials: ['quote', 'author'],
      talent: ['name', 'email'],
      applications: ['type', 'name', 'email'],
      faqs: ['question', 'answer', 'category'],
      announcements: ['title', 'content'],
      partners: ['organizationName', 'contactPerson', 'email'],
    };
    for (const field of requiredByResource[canonical] || []) {
      if (!(body as Record<string, unknown>)[field]) return { success: false as const, error: `${field} is required.` };
    }
  }

  return { success: true as const, data: result.data };
}
