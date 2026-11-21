import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/supabase-auth';
import { canPerformAdminAction } from '@/lib/auth/admin-authorization';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Source = 'application' | 'contact' | 'partnership';
const sources: Source[] = ['application', 'contact', 'partnership'];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validLead(source: string | null, id: string | null): source is Source {
  return !!source && sources.includes(source as Source) && !!id && uuidPattern.test(id);
}

export async function GET(request: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!canPerformAdminAction(user.role, user.permissions, 'applications', 'read')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  if (request.nextUrl.searchParams.get('view') === 'reminders') {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('growthbridge_crm_leads')
        .select('source, inquiry_id, stage, follow_up_at')
        .not('follow_up_at', 'is', null)
        .not('stage', 'in', '(won,lost)')
        .order('follow_up_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      return NextResponse.json({ success: true, data: { reminders: data || [] } });
    } catch (error) {
      console.error('[API CRM reminders]', error);
      return NextResponse.json({ success: false, error: 'Could not load follow-up reminders' }, { status: 500 });
    }
  }

  const source = request.nextUrl.searchParams.get('source');
  const id = request.nextUrl.searchParams.get('id');
  if (!validLead(source, id)) {
    return NextResponse.json({ success: false, error: 'A valid source and inquiry id are required' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const [lead, activities] = await Promise.all([
      supabase.from('growthbridge_crm_leads').select('*').eq('source', source).eq('inquiry_id', id).maybeSingle(),
      supabase.from('growthbridge_crm_activities').select('id, activity_type, content, metadata, actor_name, created_at').eq('source', source).eq('inquiry_id', id).order('created_at', { ascending: false }).limit(50),
    ]);
    if (lead.error) throw lead.error;
    if (activities.error) throw activities.error;
    return NextResponse.json({ success: true, data: { lead: lead.data, activities: activities.data || [] } });
  } catch (error) {
    console.error('[API CRM GET]', error);
    return NextResponse.json({ success: false, error: 'Could not load CRM activity' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!canPerformAdminAction(user.role, user.permissions, 'applications', 'update')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as {
    source?: string; id?: string; action?: string; content?: string;
    followUpAt?: string | null; stage?: string; conversionValue?: number | null;
  } | null;
  if (!body || !validLead(body.source || null, body.id || null) || !body.action) {
    return NextResponse.json({ success: false, error: 'A valid lead and action are required' }, { status: 400 });
  }

  const source = body.source as Source;
  const id = body.id as string;
  let activityType = '';
  let content: string | null = null;
  let metadata: Record<string, unknown> = {};
  const supabase = createAdminClient();

  try {
    if (body.action === 'add_note') {
      content = body.content?.trim() || '';
      if (!content || content.length > 2000) {
        return NextResponse.json({ success: false, error: 'Notes must contain 1–2000 characters' }, { status: 400 });
      }
      activityType = 'note_added';
    } else if (body.action === 'set_follow_up') {
      if (body.followUpAt !== null && (typeof body.followUpAt !== 'string' || !Number.isFinite(Date.parse(body.followUpAt)))) {
        return NextResponse.json({ success: false, error: 'A valid follow-up date is required' }, { status: 400 });
      }
      const followUpAt = body.followUpAt || null;
      const { error } = await supabase.from('growthbridge_crm_leads').upsert({
        source, inquiry_id: id, follow_up_at: followUpAt, updated_by: user.id, updated_at: new Date().toISOString(),
      }, { onConflict: 'source,inquiry_id' });
      if (error) throw error;
      activityType = followUpAt ? 'follow_up_scheduled' : 'follow_up_cleared';
      metadata = { follow_up_at: followUpAt };
    } else if (body.action === 'set_stage') {
      const allowedStages = ['new', 'qualified', 'proposal', 'won', 'lost'];
      if (!body.stage || !allowedStages.includes(body.stage)) {
        return NextResponse.json({ success: false, error: 'Invalid pipeline stage' }, { status: 400 });
      }
      const conversionValue = body.conversionValue ?? null;
      if (conversionValue !== null && (typeof conversionValue !== 'number' || !Number.isFinite(conversionValue) || conversionValue < 0)) {
        return NextResponse.json({ success: false, error: 'Conversion value must be a non-negative number' }, { status: 400 });
      }
      const { data: previous, error: previousError } = await supabase.from('growthbridge_crm_leads').select('stage').eq('source', source).eq('inquiry_id', id).maybeSingle();
      if (previousError) throw previousError;
      const convertedAt = body.stage === 'won' ? new Date().toISOString() : null;
      const { error } = await supabase.from('growthbridge_crm_leads').upsert({
        source, inquiry_id: id, stage: body.stage, converted_at: convertedAt,
        conversion_value: body.stage === 'won' ? conversionValue : null,
        updated_by: user.id, updated_at: new Date().toISOString(),
      }, { onConflict: 'source,inquiry_id' });
      if (error) throw error;
      activityType = body.stage === 'won' ? 'conversion_recorded' : previous?.stage === 'won' ? 'conversion_reverted' : 'stage_changed';
      metadata = { previous_stage: previous?.stage || 'new', stage: body.stage, conversion_value: body.stage === 'won' ? conversionValue : null };
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported CRM action' }, { status: 400 });
    }

    const { error: activityError } = await supabase.from('growthbridge_crm_activities').insert({
      source, inquiry_id: id, activity_type: activityType, content, metadata,
      actor_id: user.id, actor_name: user.name || 'Admin',
    });
    if (activityError) throw activityError;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API CRM POST]', error);
    return NextResponse.json({ success: false, error: 'Could not save CRM update' }, { status: 500 });
  }
}
