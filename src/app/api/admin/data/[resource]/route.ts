// src/app/api/admin/data/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/supabase-auth';
import type { AdminRole } from '@/lib/types/admin';
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
import { SettingsRepository } from '@/repositories/settings.repository';
import { AuditLogRepository } from '@/repositories/audit-log.repository';
import { ImpactStatsRepository } from '@/repositories/impact-stats.repository';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    resource: string;
  }>;
};

const ADMIN_ROLES: AdminRole[] = ['growthbridge_super_admin', 'growthbridge_admin'];

function hasDataAccess(role: string | undefined, resource: string): boolean {
  if (!role) return false;
  if (ADMIN_ROLES.includes(role as AdminRole)) return true;

  if (role === 'growthbridge_content_manager') {
    return ['blog', 'testimonials', 'faqs', 'announcements', 'media', 'services', 'projects', 'settings', 'dashboard', 'analytics'].includes(resource);
  }
  if (role === 'growthbridge_project_manager') {
    return ['projects', 'media', 'services', 'partners', 'settings', 'dashboard', 'analytics'].includes(resource);
  }
  if (role === 'growthbridge_recruiter') {
    return ['talent', 'applications', 'inquiries', 'media', 'dashboard', 'analytics', 'people'].includes(resource);
  }
  if (role === 'growthbridge_analyst') {
    return ['dashboard', 'analytics'].includes(resource);
  }
  return false;
}

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
const statsRepo = new ImpactStatsRepository();

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { resource } = await context.params;
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasDataAccess(user.role, resource)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    let data: any = null;

    switch (resource) {
      case 'services':
        data = await servicesRepo.getAll();
        break;
      case 'projects':
        data = await projectsRepo.getAll();
        break;
      case 'blog':
        data = await blogRepo.getAll();
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
        data = await settingsRepo.getSettings();
        break;
      case 'audit-logs':
        data = await auditRepo.getAll();
        break;
      case 'dashboard':
      case 'analytics':
        const [svcs, projs, apps, stats] = await Promise.all([
          servicesRepo.getAll(),
          projectsRepo.getAll(),
          applicationsRepo.getAll(),
          statsRepo.getStats(),
        ]);
        data = {
          stats: {
            totalVisitors: 12450,
            visitorsChange: 12.5,
            activeServices: svcs.length,
            servicesChange: 5.0,
            publishedProjects: projs.length,
            projectsChange: 8.3,
            talentApplications: apps.length,
            applicationsChange: 15.2,
            partnerRequests: 14,
            partnerChange: 2.1,
            contactSubmissions: 42,
            contactChange: -1.5,
          },
          visitorTrend: [
            { label: 'Jan', value: 9200 },
            { label: 'Feb', value: 10400 },
            { label: 'Mar', value: 12450 },
          ],
          applicationTrend: [
            { label: 'Jan', value: 12 },
            { label: 'Feb', value: 24 },
            { label: 'Mar', value: apps.length },
          ],
          servicePopularity: svcs.slice(0, 5).map((s) => ({ label: s.title, value: 85 })),
          projectEngagement: projs.slice(0, 5).map((p) => ({ label: p.title, value: 92 })),
        };
        break;
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

    if (!hasDataAccess(user.role, resource)) {
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
        const saved = await mediaRepo.create({
          fileName: file.name,
          name: metadata.name,
          url: `/uploads/${file.name}`,
          mimeType: file.type,
          size: file.size,
          altText: metadata.altText,
        });
        return NextResponse.json({ success: true, data: saved });
      }
    } else {
      body = await request.json().catch(() => ({}));
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
        saved = await blogRepo.create(body);
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
      case 'audit-logs':
        saved = await auditRepo.create({ ...body, actorName: user.name, actorId: user.id });
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid resource' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('[API data resource POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to create record' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { resource } = await context.params;
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasDataAccess(user.role, resource)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));

    if (resource === 'settings') {
      const updated = await settingsRepo.updateSettings(body);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: 'Resource requires ID for update' }, { status: 400 });
  } catch (error) {
    console.error('[API data resource PUT]', error);
    return NextResponse.json({ success: false, error: 'Failed to update record' }, { status: 500 });
  }
}
