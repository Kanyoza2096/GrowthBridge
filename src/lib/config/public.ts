// src/lib/config/public.ts
// Public configuration — safe for browser.
// All values sourced from NEXT_PUBLIC_ environment variables.
import { z } from 'zod';

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    .default('https://placeholder.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
    .default('placeholder-anon-key'),
  NEXT_PUBLIC_SITE_NAME: z
    .string()
    .min(1)
    .default('Growthbridge Virtual Organization'),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default('https://growthbridge.org'),
  NEXT_PUBLIC_CONTACT_EMAIL: z
    .string()
    .email()
    .default('hello@growthbridge.org'),
  NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED: z
    .preprocess(
      (val) => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') return val.toLowerCase() === 'true';
        return false;
      },
      z.boolean().default(false)
    ),
});

const parsed = publicSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED:
    process.env.NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED,
});

if (!parsed.success && process.env.NODE_ENV === 'production') {
  console.error(
    '[PublicConfig] Invalid public configuration:',
    parsed.error.flatten().fieldErrors
  );
}

export const publicConfig = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-anon-key',
      NEXT_PUBLIC_SITE_NAME: 'Growthbridge Virtual Organization',
      NEXT_PUBLIC_SITE_URL: 'https://growthbridge.org',
      NEXT_PUBLIC_CONTACT_EMAIL: 'hello@growthbridge.org',
      NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED: false,
    };
