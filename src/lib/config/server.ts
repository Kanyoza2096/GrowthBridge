// src/lib/config/server.ts
// Server-only configuration. Never imported in browser code.
// Validated at startup; production fails fast on misconfiguration.
import 'server-only';
import { z } from 'zod';

const schema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  AUTONOMOUS_PLATFORM_URL: z.string().url().optional(),
  AUTONOMOUS_PLATFORM_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  SMTP_FROM_NAME: z.string().optional(),
});

const parsed = schema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  AUTONOMOUS_PLATFORM_URL: process.env.AUTONOMOUS_PLATFORM_URL,
  AUTONOMOUS_PLATFORM_API_KEY: process.env.AUTONOMOUS_PLATFORM_API_KEY,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
});

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  console.error('[ServerConfig] Invalid server configuration:', errors);
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `[ServerConfig] Invalid server configuration: ${JSON.stringify(errors)}`
    );
  }
}

const dev = {
  SUPABASE_SERVICE_ROLE_KEY: 'development-placeholder-service-role-key',
  AUTONOMOUS_PLATFORM_URL: undefined as string | undefined,
  AUTONOMOUS_PLATFORM_API_KEY: undefined as string | undefined,
  SMTP_HOST: undefined as string | undefined,
  SMTP_PORT: undefined as number | undefined,
  SMTP_USER: undefined as string | undefined,
  SMTP_PASS: undefined as string | undefined,
  SMTP_FROM: undefined as string | undefined,
  SMTP_FROM_NAME: undefined as string | undefined,
};

export const serverConfig = parsed.success ? parsed.data : dev;

/**
 * Safe config diagnostic — logs config status without exposing secret values.
 * Call during startup for observability.
 */
export function logServerConfigStatus() {
  const cfg = serverConfig;
  console.info('[ServerConfig] Status:', {
    supabase_service_role: cfg.SUPABASE_SERVICE_ROLE_KEY ? '✓ set' : '✗ missing',
    autonomous_platform_url: cfg.AUTONOMOUS_PLATFORM_URL ? '✓ set' : 'not configured',
    autonomous_platform_key: cfg.AUTONOMOUS_PLATFORM_API_KEY ? '✓ set' : 'not configured',
    smtp: cfg.SMTP_HOST ? '✓ configured' : 'not configured',
  });
}
