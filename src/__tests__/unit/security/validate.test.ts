// src/__tests__/unit/security/validate.test.ts
import { describe, it, expect } from 'vitest';
import { contactSubmissionSchema, talentApplicationSchema } from '@/lib/security/validate';
import { sanitizeHtml, stripHtml } from '@/lib/security/sanitize';

describe('Security Validation & Sanitization', () => {
  it('should validate valid contact submissions', () => {
    const valid = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Inquiry',
      message: 'Hello, I would like to learn more about GrowthBridge.',
      type: 'general',
    };
    const result = contactSubmissionSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should reject invalid emails in contact submissions', () => {
    const invalid = {
      name: 'Jane',
      email: 'not-an-email',
      subject: 'Hi',
      message: 'Test message here.',
    };
    const result = contactSubmissionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should sanitize HTML inputs preventing XSS', () => {
    const malicious = '<script>alert("xss")</script><b>Hello</b>';
    expect(stripHtml(malicious)).toBe('alert("xss")Hello');
    expect(sanitizeHtml(malicious)).toContain('&lt;script&gt;');
  });
});
