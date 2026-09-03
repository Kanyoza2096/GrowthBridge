// Public configuration — safe for browser.
// Required public connection settings fail fast in production instead of
// silently falling back to a fake backend.
import { z } from 'zod';

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1).default('Growthbridge Virtual Organization'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://growthbridge.org'),
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().email().default('hello@growthbridge.org'),
  NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED: z.preprocess(
    (val) => typeof val === 'boolean' ? val : String(val ?? '').toLowerCase() === 'true',
    z.boolean().default(false)
  ),
});

const parsed = publicSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED: process.env.NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED,
});

if (!parsed.success && process.env.NODE_ENV === 'production') {
  const errors = parsed.error.flatten().fieldErrors;
  console.error('[PublicConfig] Invalid public configuration:', errors);
  throw new Error(`[PublicConfig] Invalid public configuration: ${JSON.stringify(errors)}`);
}

const dev = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-anon-key',
  NEXT_PUBLIC_SITE_NAME: 'Growthbridge Virtual Organization',
  NEXT_PUBLIC_SITE_URL: 'https://growthbridge.org',
  NEXT_PUBLIC_CONTACT_EMAIL: 'hello@growthbridge.org',
  NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED: false,
};

export const publicConfig = parsed.success ? parsed.data : dev;
