// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/services/contact.service';
import { contactSubmissionSchema } from '@/lib/security/validate';
import { sanitizePlainText } from '@/lib/security/sanitize';
import { getTrustedClientIp, readJsonBody } from '@/lib/security/request';
import { checkFormRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getTrustedClientIp(request);
    const rate = await checkFormRateLimit(ip, 'contact');
    if (rate.limited) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((rate.reset - Date.now()) / 1000))), 'X-RateLimit-Limit': String(rate.limit), 'X-RateLimit-Remaining': '0' } }
      );
    }
    let body: any;
    try {
      body = await readJsonBody(request, 64 * 1024);
    } catch (error) {
      const status = error instanceof Error && error.message === 'REQUEST_BODY_TOO_LARGE' ? 413 : 400;
      return NextResponse.json({ success: false, error: status === 413 ? 'Request body is too large.' : 'Invalid JSON body.' }, { status });
    }

    const parsed = contactSubmissionSchema.safeParse({
      name: body?.name,
      email: body?.email,
      phone: body?.phone,
      subject: body?.subject || 'General Inquiry',
      message: body?.message,
      type: body?.type || 'general',
    });

    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join('; ') || 'Invalid input';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    const data = parsed.data;

    const result = await contactService.submitContact({
      name: sanitizePlainText(data.name),
      email: data.email.toLowerCase().trim(),
      phone: data.phone ? sanitizePlainText(data.phone) : undefined,
      subject: sanitizePlainText(data.subject),
      message: sanitizePlainText(data.message),
      type: data.type,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API contact]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
