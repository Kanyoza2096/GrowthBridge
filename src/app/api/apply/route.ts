// src/app/api/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { applicationsService } from '@/services/applications.service';
import { talentApplicationSchema } from '@/lib/security/validate';
import { sanitizePlainText } from '@/lib/security/sanitize';
import { getTrustedClientIp, readJsonBody } from '@/lib/security/request';
import { checkFormRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getTrustedClientIp(request);
    const rate = await checkFormRateLimit(ip, 'apply');
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

    const parsed = talentApplicationSchema.safeParse({
      fullName: body?.fullName,
      email: body?.email,
      phone: body?.phone,
      role: body?.role,
      skills: Array.isArray(body?.skills) ? body.skills : [],
      portfolio: body?.portfolio || '',
      linkedin: body?.linkedin || '',
      motivation: body?.motivation,
    });

    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join('; ') || 'Invalid input';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    const data = parsed.data;

    await applicationsService.createApplication({
      type: 'talent',
      name: sanitizePlainText(data.fullName),
      email: data.email.toLowerCase().trim(),
      phone: data.phone ? sanitizePlainText(data.phone) : undefined,
      role: sanitizePlainText(data.role),
      skills: data.skills.map((s) => sanitizePlainText(String(s))).filter(Boolean),
      portfolio: data.portfolio || undefined,
      message: sanitizePlainText(data.motivation),
      status: 'submitted',
    });

    return NextResponse.json({ success: true, data: { submitted: true } }, { status: 201 });
  } catch (error) {
    console.error('[API apply]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application.' },
      { status: 500 }
    );
  }
}
