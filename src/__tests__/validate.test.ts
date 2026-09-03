import { describe, it, expect } from 'vitest';
import {
  contactSubmissionSchema,
  talentApplicationSchema,
  partnershipRequestSchema,
} from '@/lib/security/validate';

describe('contactSubmissionSchema', () => {
  it('accepts valid contact payload', () => {
    const result = contactSubmissionSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Hello',
      message: 'This is a sufficiently long message.',
      type: 'general',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short message and invalid email', () => {
    const result = contactSubmissionSchema.safeParse({
      name: 'J',
      email: 'not-an-email',
      subject: 'Hi',
      message: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('talentApplicationSchema', () => {
  it('accepts valid talent application', () => {
    const result = talentApplicationSchema.safeParse({
      fullName: 'Thabo Molefe',
      email: 'thabo@example.com',
      role: 'Frontend Engineer',
      skills: ['React', 'TypeScript'],
      motivation: 'I want to contribute to meaningful digital products across Africa.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing motivation', () => {
    const result = talentApplicationSchema.safeParse({
      fullName: 'Thabo Molefe',
      email: 'thabo@example.com',
      role: 'Engineer',
      motivation: 'too short',
    });
    expect(result.success).toBe(false);
  });
});

describe('partnershipRequestSchema', () => {
  it('accepts valid partnership request', () => {
    const result = partnershipRequestSchema.safeParse({
      organizationName: 'Acme Corp',
      contactPerson: 'Alice',
      email: 'alice@acme.com',
      partnershipType: 'sponsor',
      message: 'We would like to explore a long-term sponsorship partnership.',
    });
    expect(result.success).toBe(true);
  });
});
