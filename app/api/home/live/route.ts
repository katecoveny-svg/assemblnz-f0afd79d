import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/home/live — the real numbers behind the homepage credibility section.
 *
 * Every figure here is counted from the Knowledge Brain at request time. Nothing
 * is hard-coded, because the whole point of the section is that a visitor can
 * reload and watch it move. If a count cannot be read we omit that figure rather
 * than substituting a plausible one — a wrong number on this section would
 * undo exactly the thing it exists to establish.
 */

type Figure = { label: string; value: number; hint: string };

export async function GET() {
  try {
    return await readFigures();
  } catch {
    // A missing credential or a brief Supabase outage should degrade to "no
    // figures", not a 500 on the homepage. The client renders the explanation
    // without numbers, which is honest and still makes the point.
    return NextResponse.json(
      { figures: [], lastFetch: null, lastFetchSource: null, checkedAt: new Date().toISOString() },
      { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }
}

async function readFigures() {
  const service = getServiceClient();

  const [documents, changes, sources, activeSources, freshest] = await Promise.all([
    service.from('kb_documents').select('id', { count: 'exact', head: true }),
    service.from('kb_changes').select('id', { count: 'exact', head: true }),
    service.from('kb_sources').select('id', { count: 'exact', head: true }),
    service.from('kb_sources').select('id', { count: 'exact', head: true }).eq('active', true),
    service
      .from('kb_sources')
      .select('name, last_successful_fetch')
      .not('last_successful_fetch', 'is', null)
      .order('last_successful_fetch', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const figures: Figure[] = [];
  if (documents.count != null) {
    figures.push({
      label: 'documents tracked',
      value: documents.count,
      hint: 'Official sources read and kept current',
    });
  }
  if (changes.count != null) {
    figures.push({
      label: 'changes recorded',
      value: changes.count,
      hint: 'Every time a source moved, with what moved',
    });
  }
  if (activeSources.count != null && sources.count != null) {
    figures.push({
      label: 'live sources',
      value: activeSources.count,
      hint: `Checking on their own schedule, of ${sources.count} registered`,
    });
  }

  return NextResponse.json(
    {
      figures,
      lastFetch: freshest.data?.last_successful_fetch ?? null,
      lastFetchSource: freshest.data?.name ?? null,
      checkedAt: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
