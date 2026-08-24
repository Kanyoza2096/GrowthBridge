// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/services/contact.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const result = await contactService.submitContact({
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject || 'General Inquiry',
      message: body.message,
      type: body.type || 'general',
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
