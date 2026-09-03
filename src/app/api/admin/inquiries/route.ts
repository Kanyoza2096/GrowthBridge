import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/supabase-auth';
import { canPerformAdminAction } from '@/lib/auth/admin-authorization';
import { inquiryRepository } from '@/repositories/inquiry.repository';
import type { InquiryStatus, InquirySource } from '@/lib/types/inquiry';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ success:false, error:'Unauthorized' }, { status:401 });
  if (!canPerformAdminAction(user.role, user.permissions, 'applications', 'read')) return NextResponse.json({ success:false, error:'Forbidden' }, { status:403 });
  try { return NextResponse.json({ success:true, data:await inquiryRepository.getAll() }); }
  catch (error) { console.error('[API inquiries GET]', error); return NextResponse.json({ success:false,error:'Failed to load inquiries' },{status:500}); }
}

export async function PATCH(request: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ success:false,error:'Unauthorized' },{status:401});
  if (!canPerformAdminAction(user.role,user.permissions,'applications','update')) return NextResponse.json({ success:false,error:'Forbidden' },{status:403});
  const body = await request.json().catch(() => null) as { id?:string; source?:InquirySource; status?:InquiryStatus } | null;
  if (!body?.id || !body.source || !body.status) return NextResponse.json({ success:false,error:'id, source and status are required' },{status:400});
  try { await inquiryRepository.updateStatus(body.id,body.source,body.status); return NextResponse.json({success:true}); }
  catch (error) { console.error('[API inquiries PATCH]',error); return NextResponse.json({success:false,error:'Failed to update inquiry'},{status:500}); }
}
