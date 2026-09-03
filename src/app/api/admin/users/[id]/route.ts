import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/supabase-auth';
import { adminUsersRepository } from '@/repositories/admin-users.repository';
import { auditRepo } from '@/repositories/audit-log.repository';
import { z } from 'zod';
import type { AdminRole } from '@/lib/types/admin';

const roles: AdminRole[] = [
  'growthbridge_super_admin', 'growthbridge_admin', 'growthbridge_content_manager',
  'growthbridge_project_manager', 'growthbridge_recruiter', 'growthbridge_analyst',
];
const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  department: z.string().trim().max(120).optional(),
  role: z.enum(roles as [AdminRole, ...AdminRole[]]).optional(),
  isActive: z.boolean().optional(),
});

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const actor = await requireRole(['growthbridge_super_admin']);
    const { id } = await context.params;
    const body = updateSchema.parse(await request.json());

    if (id === actor.id && body.role && body.role !== 'growthbridge_super_admin') {
      return NextResponse.json({ success: false, error: 'You cannot remove your own Super Admin access.' }, { status: 400 });
    }
    if (id === actor.id && body.isActive === false) {
      return NextResponse.json({ success: false, error: 'You cannot deactivate your own account.' }, { status: 400 });
    }

    const wouldRemoveSuperAdmin = body.isActive === false || (body.role !== undefined && body.role !== 'growthbridge_super_admin');
    if (wouldRemoveSuperAdmin) {
      const remaining = await adminUsersRepository.countActiveSuperAdmins(id);
      if (remaining < 1) {
        return NextResponse.json({ success: false, error: 'At least one active Super Admin must remain.' }, { status: 400 });
      }
    }

    const updated = await adminUsersRepository.update(id, body);
    await auditRepo.create({
      actorId: actor.id,
      actorName: actor.name,
      action: 'update',
      resourceType: 'users',
      resourceId: id,
      resourceName: updated.email,
      changes: body,
    });
    return NextResponse.json({ success: true, data: updated }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Admin users PATCH]', error);
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.issues[0]?.message || 'Invalid user data.' }, { status: 400 });
    if (error instanceof Error && error.message.startsWith('Forbidden')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: 'Failed to update user.' }, { status: 500 });
  }
}
