// src/app/api/admin/data/[resource]/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/supabase-auth';
import { canPerformAdminAction } from '@/lib/auth/admin-authorization';
import { ServicesRepository } from '@/repositories/services.repository';
import { ProjectsRepository } from '@/repositories/projects.repository';
import { BlogRepository } from '@/repositories/blog.repository';
import { PeopleRepository } from '@/repositories/people.repository';
import { TestimonialsRepository } from '@/repositories/testimonials.repository';
import { TalentRepository } from '@/repositories/talent.repository';
import { ApplicationsRepository } from '@/repositories/applications.repository';
import { FAQsRepository } from '@/repositories/faqs.repository';
import { AnnouncementsRepository } from '@/repositories/announcements.repository';
import { PartnersRepository } from '@/repositories/partners.repository';
import { mediaService } from '@/services/media.service';
import { AuditLogRepository } from '@/repositories/audit-log.repository';
import { adminJsonBodySchema } from '@/lib/security/validate';
import { validateAdminResourcePayload } from '@/lib/security/admin-validate';
import { blogService } from '@/services/blog.service';
import { adminNotificationsRepository } from '@/repositories/admin-notifications.repository';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    resource: string;
    id: string;
  }>;
};

const servicesRepo = new ServicesRepository();
const projectsRepo = new ProjectsRepository();
const blogRepo = new BlogRepository();
const peopleRepo = new PeopleRepository();
const testimonialsRepo = new TestimonialsRepository();
const talentRepo = new TalentRepository();
const applicationsRepo = new ApplicationsRepository();
const faqsRepo = new FAQsRepository();
const announcementsRepo = new AnnouncementsRepository();
const partnersRepo = new PartnersRepository();
const auditRepo = new AuditLogRepository();

function getClientIp(request: NextRequest): string | undefined {
  return request.headers.get('cf-connecting-ip')?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    undefined;
}

async function writeAudit(request: NextRequest, user: Awaited<ReturnType<typeof getServerUser>>, action: string, resource: string, id: string, saved?: any) {
  if (!user) return;
  try {
    await auditRepo.create({
      actorId: user.id,
      actorName: user.name,
      action: action as any,
      resourceType: resource,
      resourceId: id,
      resourceName: saved?.name || saved?.title || saved?.question || saved?.organizationName || saved?.fileName,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
    });
  } catch (error) {
    console.error('[API audit]', error);
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { resource, id } = await context.params;
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!canPerformAdminAction(user.role, user.permissions, resource, 'read')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    let data: any = null;

    switch (resource) {
      case 'services':
        data = await servicesRepo.getById(id);
        break;
      case 'projects':
        data = await projectsRepo.getById(id);
        break;
      case 'people':
      case 'team':
        data = await peopleRepo.getById(id);
        break;
      case 'talent':
        data = await talentRepo.getById(id);
        break;
      case 'applications':
        data = await applicationsRepo.getById(id);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API single resource GET]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { resource, id } = await context.params;
    const user = await getServerUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (resource !== 'notifications' || !canPerformAdminAction(user.role, user.permissions, 'notifications', 'update')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json().catch(() => ({}));
    if (body?.read !== true) return NextResponse.json({ success: false, error: 'Unsupported notification action' }, { status: 400 });
    await adminNotificationsRepository.markRead(id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API notification PATCH]', error);
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { resource, id } = await context.params;
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!canPerformAdminAction(user.role, user.permissions, resource, 'update')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const rawBody = await request.json().catch(() => null);
    const parsedBody = adminJsonBodySchema.safeParse(rawBody ?? {});
    if (!parsedBody.success) {
      return NextResponse.json({ success: false, error: parsedBody.error.issues[0]?.message || 'Invalid request body.' }, { status: 400 });
    }
    const body = parsedBody.data;
    const validated = validateAdminResourcePayload(resource, body, 'update');
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }
    const validatedBody = validated.data;
    let updated: any = null;

    switch (resource) {
      case 'services':
        updated = await servicesRepo.update(id, validatedBody);
        break;
      case 'projects':
        updated = await projectsRepo.update(id, validatedBody);
        break;
      case 'blog':
        updated = await blogService.updateBlogPost(id, validatedBody, user.id);
        break;
      case 'people':
      case 'team':
        updated = await peopleRepo.update(id, validatedBody);
        break;
      case 'testimonials':
        updated = await testimonialsRepo.update(id, validatedBody);
        break;
      case 'talent':
        updated = await talentRepo.update(id, validatedBody);
        break;
      case 'applications':
        updated = await applicationsRepo.update(id, validatedBody);
        break;
      case 'faqs':
        updated = await faqsRepo.update(id, validatedBody);
        break;
      case 'announcements':
        updated = await announcementsRepo.update(id, validatedBody);
        break;
      case 'partners':
        updated = await partnersRepo.update(id, validatedBody);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid resource' }, { status: 400 });
    }

    await writeAudit(request, user, 'update', resource, id, updated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('[API single resource PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { resource, id } = await context.params;
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!canPerformAdminAction(user.role, user.permissions, resource, 'delete')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    let deleted = false;

    switch (resource) {
      case 'services':
        deleted = await servicesRepo.delete(id);
        break;
      case 'projects':
        deleted = await projectsRepo.delete(id);
        break;
      case 'blog':
        deleted = await blogRepo.delete(id);
        break;
      case 'people':
      case 'team':
        deleted = await peopleRepo.delete(id);
        break;
      case 'testimonials':
        deleted = await testimonialsRepo.delete(id);
        break;
      case 'talent':
        deleted = await talentRepo.delete(id);
        break;
      case 'applications':
        deleted = await applicationsRepo.delete(id);
        break;
      case 'faqs':
        deleted = await faqsRepo.delete(id);
        break;
      case 'announcements':
        deleted = await announcementsRepo.delete(id);
        break;
      case 'partners':
        deleted = await partnersRepo.delete(id);
        break;
      case 'media':
        deleted = await mediaService.deleteMedia(id);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid resource' }, { status: 400 });
    }

    if (deleted) await writeAudit(request, user, 'delete', resource, id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('[API single resource DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete record' }, { status: 500 });
  }
}
