// src/app/api/partner/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/services/contact.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.organizationName || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Organization name and email are required.' },
        { status: 400 }
      );
    }

    const result = await contactService.submitPartnership({
      organizationName: body.organizationName,
      contactPerson: body.contactPerson || '',
      email: body.email,
      phone: body.phone,
      partnershipType: body.partnershipType || 'other',
      message: body.message || '',
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
