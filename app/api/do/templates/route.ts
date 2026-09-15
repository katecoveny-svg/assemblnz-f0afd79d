import { NextResponse } from 'next/server';
import { templatesByLane, templatesForPack } from '@/apps/do/shared/templates';
import { fixturesForPack } from '@/apps/do/shared/fixtures';
import { connectorsForPack } from '@/apps/do/shared/connectors';
import { POLICY_HONESTY } from '@/apps/do/shared/policy';
import type { TemplatePack } from '@/apps/do/shared/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parsePack(url: URL): TemplatePack {
  const raw = (url.searchParams.get('pack') || 'public').trim().toLowerCase();
  return raw === 'mitre10' ? 'mitre10' : 'public';
}

export async function GET(req: Request) {
  const pack = parsePack(new URL(req.url));
  return NextResponse.json({
    honesty: POLICY_HONESTY,
    pack,
    templates: templatesForPack(pack),
    groups: templatesByLane(pack),
    connectors: connectorsForPack(pack),
    fixtures: fixturesForPack(pack),
  });
}
