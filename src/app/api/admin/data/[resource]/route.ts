// src/app/api/admin/data/[resource]/route.ts
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
import { MediaRepository } from '@/repositories/media.repository';
import { mediaService } from '@/services/media.service';
import { adminJsonBodySchema } from '@/lib/security/validate';
import { validateAdminResourcePayload } from '@/lib/security/admin-validate';
import { SettingsRepository } from '@/repositories/settings.repository';
import { AuditLogRepository } from '@/repositories/audit-log.repository';
import { blogService } from '@/services/blog.service';
import { adminNotificationsRepository } from '@/repositories/admin-notifications.repository';
import { dashboardRepository } from '@/repositories/dashboard.repository';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    resource: string;
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
const mediaRepo = new MediaRepository();
const settingsRepo = new SettingsRepository();
const auditRepo = new AuditLogRepository();

function getClientIp(request: NextRequest): string | undefined {
  return request.headers.get('cf-connecting-ip')?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    undefined;
}

async function writeAudit(request: NextRequest, user: Awaited<ReturnType<typeof getServerUser>>, action: string, resource: string, saved?: any) {
  if (!user) return;
  try {
    await auditRepo.create({
      actorId: user.id,
      actorName: user.name,
      action: action as any,
      resourceType: resource,
      resourceId: saved?.id,
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
    const { resource } = await context.params;
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
        data = await servicesRepo.getAll(true);
        break;
      case 'projects':
        data = await projectsRepo.getAll(true);
        break;
      case 'blog':
        data = await blogRepo.getAll(true);
        break;
      case 'people':
      case 'team':
        data = await peopleRepo.getAll();
        break;
      case 'testimonials':
        data = await testimonialsRepo.getAll();
        break;
      case 'talent':
        data = await talentRepo.getAll();
        break;
      case 'applications':
      case 'inquiries':
        data = await applicationsRepo.getAll();
        break;
      case 'faqs':
        data = await faqsRepo.getAll();
        break;
      case 'announcements':
        data = await announcementsRepo.getAll();
        break;
      case 'partners':
        data = await partnersRepo.getAll();
        break;
      case 'media':
        data = await mediaRepo.getAll();
        break;
      case 'media-folders':
        data = await mediaRepo.getFolders();
        break;
      case 'settings':
        data = await settingsRepo.getSettings(true);
        break;
      case 'audit-logs':
        data = await auditRepo.getAll();
        break;
      case 'notifications':
        data = await adminNotificationsRepository.getForUser(user.id);
        break;
      case 'dashboard':
      case 'analytics': {
        const [stats, trends] = await Promise.all([
          dashboardRepository.getStats(),
          dashboardRepository.getTrends(),
        ]);
        data = { ...trends, stats };
        break;
      }
      default:
        return NextResponse.json({ success: false, error: 'Invalid resource' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API data resource GET]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { resource } = await context.params;
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!canPerformAdminAction(user.role, user.permissions, resource, 'create')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    let body: any = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (file && resource === 'media') {
        const metadata = {
          name: (formData.get('name') as string) || file.name,
          folder: formData.get('folder') as string,
          altText: formData.get('altText') as string,
        };
        const saved = await mediaService.uploadMedia(file, metadata, user.id);
        await writeAudit(request, user, 'create', resource, saved);
        return NextResponse.json({ success: true, data: saved });
      }
    } else {
      const rawBody = await request.json().catch(() => null);
      const parsedBody = adminJsonBodySchema.safeParse(rawBody ?? {});
      if (!parsedBody.success) {
        return NextResponse.json({ success: false, error: parsedBody.error.issues[0]?.message || 'Invalid request body.' }, { status: 400 });
      }
      body = parsedBody.data;
    }

    if (resource !== 'settings') {
      const validated = validateAdminResourcePayload(resource, body, 'create');
      if (!validated.success) {
        return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
      }
      body = validated.data;
    }

    let saved: any = null;

    switch (resource) {
      case 'services':
        saved = await servicesRepo.create(body);
        break;
      case 'projects':
        saved = await projectsRepo.create(body);
        break;
      case 'blog':
        saved = await blogService.createBlogPost(body, user.id);
        break;
      case 'people':
      case 'team':
        saved = await peopleRepo.create(body);
        break;
      case 'testimonials':
        saved = await testimonialsRepo.create(body);
        break;
      case 'talent':
        saved = await talentRepo.create(body);
        break;
      case 'applications':
        saved = await applicationsRepo.create(body);
        break;
      case 'faqs':
        saved = await faqsRepo.create(body);
        break;
      case 'announcements':
        saved = await announcementsRepo.create(body);
        break;
      case 'partners':
        saved = await partnersRepo.create(body);
        break;
      case 'media':
        saved = await mediaRepo.create(body);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid resource' }, { status: 400 });
    }

    await writeAudit(request, user, 'create', resource, saved);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('[API data resource POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to create record' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { resource } = await context.params;
    const user = await getServerUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (resource !== 'notifications' || !canPerformAdminAction(user.role, user.permissions, 'notifications', 'update')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json().catch(() => ({}));
    if (body?.markAllRead === true) await adminNotificationsRepository.markAllRead(user.id);
    else return NextResponse.json({ success: false, error: 'Unsupported notification action' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API notifications PATCH]', error);
    return NextResponse.json({ success: false, error: 'Failed to update notifications' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { resource } = await context.params;
    const user = await getServerUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (resource !== 'notifications' || !canPerformAdminAction(user.role, user.permissions, 'notifications', 'delete')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    await adminNotificationsRepository.clearAll(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API notifications DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to clear notifications' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { resource } = await context.params;
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

    if (resource === 'settings') {
      const updated = await settingsRepo.updateSettings(validated.data, user.id);
      await writeAudit(request, user, 'update', resource, { id: 'general', name: 'site settings' });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: 'Resource requires ID for update' }, { status: 400 });
  } catch (error) {
    console.error('[API data resource PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update record' }, { status: 500 });
  }
}
