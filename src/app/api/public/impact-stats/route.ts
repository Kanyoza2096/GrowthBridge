import { NextResponse } from 'next/server';
import { ImpactStatsRepository } from '@/repositories/impact-stats.repository';

export const dynamic = 'force-dynamic';

/**
 * Public-safe impact metrics. The underlying table is admin-only under RLS;
 * this server endpoint exposes only the six approved aggregate metrics.
 */
export async function GET() {
  try {
    const stats = await new ImpactStatsRepository().getStats(true);
    return NextResponse.json(
      { success: true, data: stats },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Impact statistics unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
