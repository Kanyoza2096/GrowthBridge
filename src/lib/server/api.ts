import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  validateEmail,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePhone,
  validateUrl,
  validatePassword,
  validateAll,
  sanitizePlainText,
  sanitizeRichText,
  stripHtml,
  getMaxLength,
} from '@/lib/utils/validation';

export function jsonError(message: string, status: number, details?: string[]) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && details.length > 0 ? { details } : {}),
    },
    { status }
  );
}

export function jsonSuccess<T = any>(data?: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...(data !== undefined ? { data } : {}),
      ...(message ? { message } : {}),
    },
    { status }
  );
}

export async function readJsonBody<T = any>(request: NextRequest, maxSize = 1024 * 1024): Promise<{ ok: boolean; data?: T; error?: string }> {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return { ok: false, error: 'Request must be JSON' };
  }

  try {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength > maxSize) {
      return { ok: false, error: `Request body too large (max ${Math.round(maxSize / 1024)}KB)` };
    }
    const text = new TextDecoder('utf-8').decode(buffer);
    const data = JSON.parse(text) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Invalid JSON body' };
  }
}

export function validateContactBody(data: any): { ok: boolean; errors: string[]; sanitized?: any } {
  const name = sanitizePlainText(String(data?.name || ''));
  const email = String(data?.email || '').trim().toLowerCase();
  const phone = sanitizePlainText(String(data?.phone || ''));
  const subject = sanitizePlainText(String(data?.subject || ''));
  const message = sanitizeRichText(String(data?.message || ''));
  const type = sanitizePlainText(String(data?.type || 'general'));

  const results = [
    validateRequired(name, 'Name'),
    validateMaxLength(name, getMaxLength('name'), 'Name'),
    validateEmail(email),
    validatePhone(phone),
    validateRequired(subject, 'Subject'),
    validateMaxLength(subject, getMaxLength('subject'), 'Subject'),
    validateRequired(message, 'Message'),
    validateMinLength(message, 10, 'Message'),
    validateMaxLength(message, getMaxLength('message'), 'Message'),
  ];

  const { isValid, errors } = validateAll(results);
  if (!isValid) return { ok: false, errors };

  if (!['general', 'partnership', 'talent'].includes(type)) {
    return { ok: false, errors: ['Invalid inquiry type'] };
  }

  return {
    ok: true,
    errors: [],
    sanitized: {
      name,
      email,
      phone,
      subject,
      message: stripHtml(message),
      type: type as 'general' | 'partnership' | 'talent',
    },
  };
}

export function validateApplicationBody(data: any): { ok: boolean; errors: string[]; sanitized?: any } {
  const fullName = sanitizePlainText(String(data?.fullName || ''));
  const email = String(data?.email || '').trim().toLowerCase();
  const phone = sanitizePlainText(String(data?.phone || ''));
  const role = sanitizePlainText(String(data?.role || ''));
  const skills = Array.isArray(data?.skills)
    ? data.skills.map((s: any) => sanitizePlainText(String(s))).filter(Boolean)
    : [];
  const portfolio = sanitizePlainText(String(data?.portfolio || ''));
  const linkedin = sanitizePlainText(String(data?.linkedin || ''));
  const motivation = sanitizeRichText(String(data?.motivation || ''));

  const results = [
    validateRequired(fullName, 'Full Name'),
    validateMaxLength(fullName, getMaxLength('name'), 'Full Name'),
    validateEmail(email),
    validateRequired(phone, 'Phone'),
    validatePhone(phone),
    validateRequired(role, 'Desired Role'),
    validateMaxLength(role, getMaxLength('role'), 'Desired Role'),
    validateRequired(motivation, 'Motivation'),
    validateMinLength(motivation, 50, 'Motivation'),
    validateMaxLength(motivation, getMaxLength('motivation'), 'Motivation'),
    portfolio ? validateUrl(portfolio) : { isValid: true },
    linkedin ? validateUrl(linkedin) : { isValid: true },
  ];

  const { isValid, errors } = validateAll(results);
  if (!isValid) return { ok: false, errors };

  return {
    ok: true,
    errors: [],
    sanitized: {
      fullName,
      email,
      phone,
      role,
      skills: skills.slice(0, 30),
      portfolio,
      linkedin,
      motivation: stripHtml(motivation),
    },
  };
}

export function validatePartnershipBody(data: any): { ok: boolean; errors: string[]; sanitized?: any } {
  const organizationName = sanitizePlainText(String(data?.organizationName || ''));
  const contactPerson = sanitizePlainText(String(data?.contactPerson || ''));
  const email = String(data?.email || '').trim().toLowerCase();
  const phone = sanitizePlainText(String(data?.phone || ''));
  const partnershipType = sanitizePlainText(String(data?.partnershipType || ''));
  const message = sanitizeRichText(String(data?.message || ''));

  const results = [
    validateRequired(organizationName, 'Organization Name'),
    validateMaxLength(organizationName, getMaxLength('organization'), 'Organization Name'),
    validateRequired(contactPerson, 'Contact Person'),
    validateMaxLength(contactPerson, getMaxLength('name'), 'Contact Person'),
    validateEmail(email),
    validatePhone(phone),
    validateRequired(message, 'Message'),
    validateMinLength(message, 20, 'Message'),
    validateMaxLength(message, getMaxLength('message'), 'Message'),
  ];

  const { isValid, errors } = validateAll(results);
  if (!isValid) return { ok: false, errors };

  if (!['sponsor', 'collaborator', 'mentor', 'other'].includes(partnershipType)) {
    return { ok: false, errors: ['Invalid partnership type'] };
  }

  return {
    ok: true,
    errors: [],
    sanitized: {
      organizationName,
      contactPerson,
      email,
      phone,
      partnershipType: partnershipType as 'sponsor' | 'collaborator' | 'mentor' | 'other',
      message: stripHtml(message),
    },
  };
}

export function validateAdminLoginBody(data: any): { ok: boolean; errors: string[]; sanitized?: { email: string; password: string } } {
  const email = String(data?.email || '').trim().toLowerCase();
  const password = String(data?.password || '');

  const results = [
    validateEmail(email),
    validateRequired(password, 'Password'),
    validateMaxLength(password, 128, 'Password'),
  ];

  const { isValid, errors } = validateAll(results);
  if (!isValid) return { ok: false, errors };

  return {
    ok: true,
    errors: [],
    sanitized: { email, password },
  };
}
