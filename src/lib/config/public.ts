import { z } from 'zod';

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_NAME: z.string().min(1).default('Growthbridge Virtual Organization'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://growthbridge.org'),
  NEXT_PUBLIC_API_URL: z.string().url().default('https://api.growthbridge.org'),
  NEXT_PUBLIC_BACKEND_PROVIDER: z.enum(['kanyoza', 'mock']).default('kanyoza'),
  NEXT_PUBLIC_USE_MOCK_DATA: z
    .preprocess(
      (val) => {
        // Handle if value is already boolean
        if (typeof val === 'boolean') return val;
        // Handle if value is string
        if (typeof val === 'string') {
          return val.toLowerCase() === 'true';
        }
        // Handle undefined or null
        return false;
      },
      z.boolean().default(false)
    ),
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().email().default('hello@growthbridge.org'),
  NEXT_PUBLIC_ADMIN_API_BASE_PATH: z.string().default('/api/v1/growthbridge/admin'),
});

const parsed = publicSchema.safeParse({
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_BACKEND_PROVIDER: process.env.NEXT_PUBLIC_BACKEND_PROVIDER,
  NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_ADMIN_API_BASE_PATH: process.env.NEXT_PUBLIC_ADMIN_API_BASE_PATH,
});

export const publicConfig = parsed.success ? parsed.data : {
  NEXT_PUBLIC_SITE_NAME: 'Growthbridge Virtual Organization',
  NEXT_PUBLIC_SITE_URL: 'https://growthbridge.org',
  NEXT_PUBLIC_API_URL: 'https://api.growthbridge.org',
  NEXT_PUBLIC_BACKEND_PROVIDER: 'kanyoza' as const,
  NEXT_PUBLIC_USE_MOCK_DATA: false,
  NEXT_PUBLIC_CONTACT_EMAIL: 'hello@growthbridge.org',
  NEXT_PUBLIC_ADMIN_API_BASE_PATH: '/api/v1/growthbridge/admin',
};
