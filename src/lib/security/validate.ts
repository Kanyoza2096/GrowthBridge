// src/lib/security/validate.ts
import { z } from 'zod';

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
  portfolio: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
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
