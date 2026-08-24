export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;
const SCRIPT_REGEX = /<script[\s\S]*?<\/script>/gi;
const ONEVENT_REGEX = /\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^'">\s]+)/gi;
const DANGEROUS_PROTOCOLS = /(javascript:|data:text\/html|vbscript:)/i;
const XSS_INJECTION_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /onclick\s*=/i,
  /document\./i,
  /window\./i,
  /eval\(/i,
  /expression\(/i,
];

const MAX_FIELD_LENGTHS = {
  name: 150,
  email: 254,
  phone: 30,
  subject: 300,
  message: 5000,
  url: 2048,
  slug: 200,
  role: 100,
  organization: 200,
  motivation: 3000,
  content: 50000,
} as const;

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) return { isValid: false, error: 'Email is required' };
  if (trimmed.length > MAX_FIELD_LENGTHS.email) {
    return { isValid: false, error: `Email must be ${MAX_FIELD_LENGTHS.email} characters or fewer` };
  }
  if (!EMAIL_REGEX.test(trimmed)) return { isValid: false, error: 'Invalid email address' };
  if (trimmed.includes('..') || trimmed.endsWith('.')) {
    return { isValid: false, error: 'Invalid email address format' };
  }
  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  const trimmed = phone.trim();
  if (!trimmed) return { isValid: true };
  if (trimmed.length > MAX_FIELD_LENGTHS.phone) {
    return { isValid: false, error: `Phone number must be ${MAX_FIELD_LENGTHS.phone} digits or fewer` };
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 6) return { isValid: false, error: 'Phone number is too short' };
  if (digits.length > 20) return { isValid: false, error: 'Phone number is too long' };
  if (!PHONE_REGEX.test(trimmed)) return { isValid: false, error: 'Invalid phone number format' };
  return { isValid: true };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value.trim()) return { isValid: false, error: `${fieldName} is required` };
  return { isValid: true };
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): ValidationResult {
  const trimmed = value.trim();
  if (trimmed.length > 0 && trimmed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }
  return { isValid: true };
}

export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): ValidationResult {
  if (value.trim().length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be ${maxLength} characters or fewer`,
    };
  }
  return { isValid: true };
}

export function validateUrl(url: string): ValidationResult {
  const trimmed = url.trim();
  if (!trimmed) return { isValid: true };
  if (trimmed.length > MAX_FIELD_LENGTHS.url) {
    return { isValid: false, error: `URL must be ${MAX_FIELD_LENGTHS.url} characters or fewer` };
  }
  if (DANGEROUS_PROTOCOLS.test(trimmed)) {
    return { isValid: false, error: 'URL protocol is not allowed' };
  }
  if (!URL_REGEX.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
        return { isValid: false, error: 'URL protocol is not allowed' };
      }
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL' };
    }
  }
  return { isValid: true };
}

export function validateSlug(slug: string): ValidationResult {
  const trimmed = slug.trim();
  if (!trimmed) return { isValid: false, error: 'Slug is required' };
  if (trimmed.length > MAX_FIELD_LENGTHS.slug) {
    return { isValid: false, error: `Slug must be ${MAX_FIELD_LENGTHS.slug} characters or fewer` };
  }
  if (!SLUG_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Slug may only contain lowercase letters, numbers, and hyphens' };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { isValid: false, error: 'Password is required' };
  if (password.length < 12) return { isValid: false, error: 'Password must be at least 12 characters' };
  if (password.length > 128) return { isValid: false, error: 'Password must be 128 characters or fewer' };
  if (!/[A-Z]/.test(password)) return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  if (!/\d/.test(password)) return { isValid: false, error: 'Password must contain at least one number' };
  if (!/[^A-Za-z0-9]/.test(password)) return { isValid: false, error: 'Password must contain at least one special character' };
  return { isValid: true };
}

export function sanitizePlainText(input: string): string {
  if (!input) return '';
  let output = String(input);
  output = output.replace(SCRIPT_REGEX, '');
  output = output.replace(ONEVENT_REGEX, '');
  output = output.replace(DANGEROUS_PROTOCOLS, '');
  XSS_INJECTION_PATTERNS.forEach((pattern) => {
    output = output.replace(pattern, '');
  });
  return output.trim();
}

export function sanitizeRichText(input: string): string {
  if (!input) return '';
  let output = String(input);
  output = output.replace(SCRIPT_REGEX, '');
  output = output.replace(ONEVENT_REGEX, '');
  output = output.replace(DANGEROUS_PROTOCOLS, '');
  output = output.replace(/\s+style\s*=\s*("[^"]*"|'[^']*'|[^'">\s]+)/gi, (match) => {
    if (/expression\(|javascript:|url\s*\(/i.test(match)) return '';
    return match;
  });
  return output.trim();
}

export function stripHtml(input: string): string {
  if (!input) return '';
  return String(input)
    .replace(HTML_TAG_REGEX, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  return String(filename)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^[._-]|[._-]$/g, '')
    .slice(0, 200);
}

export function getMaxLength(field: keyof typeof MAX_FIELD_LENGTHS): number {
  return MAX_FIELD_LENGTHS[field];
}

export function validateAll(results: ValidationResult[]): { isValid: boolean; errors: string[] } {
  const errors = results.filter((r) => !r.isValid).map((r) => r.error!).filter(Boolean);
  return { isValid: errors.length === 0, errors };
}
