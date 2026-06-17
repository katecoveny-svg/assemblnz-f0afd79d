/**
 * GET /api/gating/peek?surface=hapai:9am-brief — read remaining quota WITHOUT
 * consuming a unit. The HAPAI tools call this on mount so the "X runs remaining"
 * counter is visible before the visitor ever hits the wall.
 *
 * Returns `{ remaining, limit, tier }` where remaining/limit are `'unlimited'`
 * for the paid tier. Fail-soft: if the service client is unavailable we report
 * `null` remaining so the counter simply hides rather than blocking the tool.
 */
import { NextResponse } from 'next/server';
import { peekGate } from '@/lib/gating/server';
import type { SurfaceKind } from '@/lib/gating/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KINDS: readonly SurfaceKind[] = ['hapai', 'chat', 'agent', 'workflow'];

export async function GET(req: Request) {
  const surface = new URL(req.url).searchParams.get('surface') ?? '';
  const [kind, ...rest] = surface.split(':');
  const key = rest.join(':');

  if (!KINDS.includes(kind as SurfaceKind) || !key) {
    return NextResponse.json({ error: 'Unknown surface' }, { status: 400 });
  }

  try {
    const verdict = await peekGate(req, kind as SurfaceKind, key);
    return NextResponse.json(
      {
        remaining: Number.isFinite(verdict.remaining) ? verdict.remaining : 'unlimited',
        limit: Number.isFinite(verdict.limit) ? verdict.limit : 'unlimited',
        tier: verdict.tier,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[gating/peek] failed', {
      surface,
      message: error instanceof Error ? error.message : String(error),
    });
    // Fail-soft: hide the counter, never block the tool.
    return NextResponse.json({ remaining: null, limit: null, tier: 'anon' });
  }
}
