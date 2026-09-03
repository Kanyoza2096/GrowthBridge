import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/supabase-auth';
import { adminUsersRepository } from '@/repositories/admin-users.repository';
import { auditRepo } from '@/repositories/audit-log.repository';
import { z } from 'zod';
import type { AdminRole } from '@/lib/types/admin';

const roles: AdminRole[] = [
  'growthbridge_super_admin',
  'growthbridge_admin',
  'growthbridge_content_manager',
  'growthbridge_project_manager',
  'growthbridge_recruiter',
  'growthbridge_analyst',
];

const createSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(12).max(128),
  role: z.enum(roles as [AdminRole, ...AdminRole[]]),
  department: z.string().trim().max(120).optional(),
});

export async function GET() {
  try {
    await requireRole(['growthbridge_super_admin']);
    const users = await adminUsersRepository.getAll();
    return NextResponse.json({ success: true, data: users }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Admin users GET]', error);
    const message = error instanceof Error && error.message.startsWith('Forbidden') ? 'Forbidden' : 'Failed to load users.';
    return NextResponse.json({ success: false, error: message }, { status: message === 'Forbidden' ? 403 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireRole(['growthbridge_super_admin']);
    const body = createSchema.parse(await request.json());
    const existing = (await adminUsersRepository.getAll()).some((u) => u.email.toLowerCase() === body.email.toLowerCase());
    if (existing) return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });

    const created = await adminUsersRepository.create(body);
    await auditRepo.create({
      actorId: actor.id,
      actorName: actor.name,
      action: 'create',
      resourceType: 'users',
      resourceId: created.id,
      resourceName: created.email,
      changes: { role: created.role, department: created.department },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Admin users POST]', error);
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.issues[0]?.message || 'Invalid user data.' }, { status: 400 });
    if (error instanceof Error && error.message.startsWith('Forbidden')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: 'Failed to create user.' }, { status: 500 });
  }
}
