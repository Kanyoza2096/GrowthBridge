// src/lib/security/validate.ts
import { z } from 'zod';

const httpUrl = z.string().url().refine((value) => {
  try {
    const protocol = new URL(value).protocol;
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}, 'URL must use http:// or https://');

export const contactSubmissionSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(30).optional(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  type: z.enum(['general', 'partnership', 'talent']).default('general'),
});

export const talentApplicationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(30).optional(),
  role: z.string().min(2).max(100),
  skills: z.array(z.string()).default([]),
  portfolio: httpUrl.optional().or(z.literal('')),
  linkedin: httpUrl.optional().or(z.literal('')),
  motivation: z.string().min(10).max(5000),
});

export const partnershipRequestSchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required').max(150),
  contactPerson: z.string().min(2).max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(30).optional(),
  partnershipType: z.enum(['sponsor', 'collaborator', 'mentor', 'other']).default('other'),
  message: z.string().min(10).max(5000),
});

export const adminJsonBodySchema = z.record(z.unknown()).superRefine((value, ctx) => {
  const serialized = JSON.stringify(value);
  if (serialized.length > 256 * 1024) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Request body is too large.' });
    return;
  }

  const walk = (node: unknown, depth: number): void => {
    if (depth > 8) throw new Error('Request body is too deeply nested.');
    if (typeof node === 'string' && node.length > 100_000) throw new Error('A text field is too large.');
    if (Array.isArray(node)) {
      if (node.length > 1000) throw new Error('An array field contains too many items.');
      node.forEach((item) => walk(item, depth + 1));
    } else if (node && typeof node === 'object') {
      for (const child of Object.values(node as Record<string, unknown>)) walk(child, depth + 1);
    }
  };

  try {
    walk(value, 0);
  } catch (error) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error instanceof Error ? error.message : 'Invalid request body.' });
  }
});
