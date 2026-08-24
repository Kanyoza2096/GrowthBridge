// src/app/api/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { applicationsService } from '@/services/applications.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.fullName || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const application = await applicationsService.createApplication({
      type: 'talent',
      name: body.fullName,
      email: body.email,
      phone: body.phone,
      role: body.role,
      skills: Array.isArray(body.skills) ? body.skills : [],
      portfolio: body.portfolio,
      message: body.motivation,
      status: 'submitted',
    });

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error('[API apply]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application.' },
      { status: 500 }
    );
  }
}
