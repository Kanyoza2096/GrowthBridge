// src/app/api/partner/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/services/contact.service';
import { partnershipRequestSchema } from '@/lib/security/validate';
import { sanitizePlainText } from '@/lib/security/sanitize';
import { getTrustedClientIp, readJsonBody } from '@/lib/security/request';
import { checkFormRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getTrustedClientIp(request);
    const rate = await checkFormRateLimit(ip, 'partner');
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

    const parsed = partnershipRequestSchema.safeParse({
      organizationName: body?.organizationName,
      contactPerson: body?.contactPerson,
      email: body?.email,
      phone: body?.phone,
      partnershipType: body?.partnershipType || 'other',
      message: body?.message,
    });

    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join('; ') || 'Invalid input';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    const data = parsed.data;

    const result = await contactService.submitPartnership({
      organizationName: sanitizePlainText(data.organizationName),
      contactPerson: sanitizePlainText(data.contactPerson),
      email: data.email.toLowerCase().trim(),
      phone: data.phone ? sanitizePlainText(data.phone) : '',
      partnershipType: data.partnershipType,
      message: sanitizePlainText(data.message),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API partner]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit partnership request.' },
      { status: 500 }
    );
  }
}
