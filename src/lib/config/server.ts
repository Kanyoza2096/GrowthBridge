// Server configuration — Edge Runtime compatible
// No server-only import needed

import { z } from 'zod';

const schema = z.object({
  ADMIN_SESSION_SECRET: z.string().min(64, 'ADMIN_SESSION_SECRET must be at least 64 characters'),
  ADMIN_SESSION_MAX_AGE: z.coerce.number().int().positive().default(60 * 60 * 8),
  ADMIN_HASH_PEPPER: z.string().min(32, 'ADMIN_HASH_PEPPER must be at least 32 characters'),
  MASTER_API_TOKEN: z.string().min(10, 'MASTER_API_TOKEN is required'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  SMTP_FROM_NAME: z.string().optional(),
});

const parsed = schema.safeParse({
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
  ADMIN_SESSION_MAX_AGE: process.env.ADMIN_SESSION_MAX_AGE,
  ADMIN_HASH_PEPPER: process.env.ADMIN_HASH_PEPPER,
  MASTER_API_TOKEN: process.env.MASTER_API_TOKEN,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
});

if (!parsed.success) {
  console.error('[ServerConfig] Invalid configuration:', parsed.error.flatten().fieldErrors);
}

// Production fails closed
if (!parsed.success && process.env.NODE_ENV === 'production') {
  throw new Error(`Invalid server configuration: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
}

// Local development gets placeholders
const data = parsed.success ? parsed.data : {
  ADMIN_SESSION_SECRET: 'development-only-secret-change-me-please-64-characters-0000000000000000',
  ADMIN_SESSION_MAX_AGE: 60 * 60 * 8,
  ADMIN_HASH_PEPPER: 'development-only-pepper-change-me-please-32chars',
  MASTER_API_TOKEN: 'development-only-token',
  SMTP_HOST: undefined,
  SMTP_PORT: undefined,
  SMTP_USER: undefined,
  SMTP_PASS: undefined,
  SMTP_FROM: undefined,
  SMTP_FROM_NAME: undefined,
};

export const serverConfig = data;
