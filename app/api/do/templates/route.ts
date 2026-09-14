import { NextResponse } from 'next/server';
import { DEMO_TEMPLATES, templatesByLane } from '@/apps/do/shared/templates';
import { FIXTURES } from '@/apps/do/shared/fixtures';
import { CONNECTOR_STUBS } from '@/apps/do/shared/connectors';
import { POLICY_HONESTY } from '@/apps/do/shared/policy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    honesty: POLICY_HONESTY,
    templates: DEMO_TEMPLATES,
    groups: templatesByLane(),
    connectors: CONNECTOR_STUBS,
    fixtures: FIXTURES,
  });
}
