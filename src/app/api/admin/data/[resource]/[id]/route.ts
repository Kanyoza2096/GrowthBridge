// src/app/api/admin/data/[resource]/[id]/route.ts
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

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    resource: string;
    id: string;
  }>;
};

const ADMIN_ROLES: AdminRole[] = ['growthbridge_super_admin', 'growthbridge_admin'];

function hasDataAccess(role: string | undefined, resource: string): boolean {
  if (!role) return false;
  if (ADMIN_ROLES.includes(role as AdminRole)) return true;

  if (role === 'growthbridge_content_manager') {
    return ['blog', 'testimonials', 'faqs', 'announcements', 'media', 'services', 'projects', 'settings'].includes(resource);
  }
  if (role === 'growthbridge_project_manager') {
    return ['projects', 'media', 'services', 'partners', 'settings'].includes(resource);
  }
  if (role === 'growthbridge_recruiter') {
    return ['talent', 'applications', 'inquiries', 'media', 'people'].includes(resource);
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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { resource, id } = await context.params;
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

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { resource, id } = await context.params;
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasDataAccess(user.role, resource)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    let updated: any = null;

    switch (resource) {
      case 'services':
        updated = await servicesRepo.update(id, body);
        break;
      case 'projects':
        updated = await projectsRepo.update(id, body);
        break;
      case 'blog':
        updated = await blogRepo.update(id, body);
        break;
      case 'people':
      case 'team':
        updated = await peopleRepo.update(id, body);
        break;
      case 'testimonials':
        updated = await testimonialsRepo.update(id, body);
        break;
      case 'talent':
        updated = await talentRepo.update(id, body);
        break;
      case 'applications':
        updated = await applicationsRepo.update(id, body);
        break;
      case 'faqs':
        updated = await faqsRepo.update(id, body);
        break;
      case 'announcements':
        updated = await announcementsRepo.update(id, body);
        break;
      case 'partners':
        updated = await partnersRepo.update(id, body);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid resource' }, { status: 400 });
    }

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

    if (!hasDataAccess(user.role, resource)) {
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
        deleted = await mediaRepo.delete(id);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid resource' }, { status: 400 });
    }

    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('[API single resource DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete record' }, { status: 500 });
  }
}
