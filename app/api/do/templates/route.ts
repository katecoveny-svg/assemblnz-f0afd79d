import { NextResponse } from 'next/server';
import { DEMO_TEMPLATES } from '@/apps/do/shared/templates';
import { FIXTURES } from '@/apps/do/shared/fixtures';
import { POLICY_HONESTY } from '@/apps/do/shared/policy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    honesty: POLICY_HONESTY,
    templates: DEMO_TEMPLATES,
    fixtures: FIXTURES,
  });
}
